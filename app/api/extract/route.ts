import { z } from "zod";
import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { zodResponseFormat } from "openai/helpers/zod";
import { supabase } from "@/lib/supabase";

// Defines the object that will be extracted using the API
const ExtractedObject = z.object({
    vendorName: z.string(),
    date_of_purchase: z.string().nullable(),
    item_quantity: z.string(),
    sub_total: z.string().nullable(),
    tax: z.string().nullable(),
    total_price: z.string()
});

// Exports the object so that it can be used
export type ParsedObject = z.infer<typeof ExtractedObject>;

// Calls the API and gives the necessary info for it to work
const apiCall = new OpenAI({
    apiKey: process.env.API_KEY,
    baseURL: process.env.ENDPOINT
});

export async function POST(req: Request) {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
        return NextResponse.json(
            { success: false, error: "No valid file was uploaded" },
            { status: 400 }
        );
    }

    try {
        const bytes = Buffer.from(await file.arrayBuffer());
        const base64 = bytes.toString("base64");
        const dataURL = `data:${file.type};base64,${base64}`;

        const response = await apiCall.chat.completions.create({
            model: "gpt-6-luna",
            messages: [
                { role: "system", content: "You are an expert at parsing documents and pulling out the necessary info" },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Extract and pull out all of the invoice or receipt fields from this image"
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: dataURL,
                            },
                        },
                    ],
                },
            ],
            response_format: zodResponseFormat(ExtractedObject, "response")
        });

        const rawContent = response.choices[0]?.message?.content;

        if (!rawContent) {
            return NextResponse.json(
                { success: false, error: "An empty response was returned" },
                { status: 500 }
            );
        }

        const parsedData = ExtractedObject.safeParse(JSON.parse(rawContent));

        if (!parsedData.success) {
            return NextResponse.json(
                { success: false, error: "There was an error validating the data" },
                { status: 422 }
            );
        }

        const extracted = parsedData.data;

        // 1. Upload the original file to the 'documents' bucket
        // The file name is sanitized so special characters don't break the storage path
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = `uploads/${Date.now()}_${safeName}`;
        const { error: uploadError } = await supabase.storage
            .from("documents")
            .upload(filePath, bytes, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            return NextResponse.json(
                { success: false, error: "Failed to upload file to storage" },
                { status: 500 }
            );
        }

        // 2. Insert a record into the 'documents' table
        const { data: docRecord, error: docError } = await supabase
            .from("documents")
            .insert({
                doc_type: "invoice",
                file_name: file.name,
                file_path: filePath,
                status: "pending_review",
            })
            .select("id")
            .single();

        if (docError || !docRecord) {
            console.error("Database insert error (documents):", docError);
            // Rollback: remove the uploaded file so it doesn't stay orphaned
            await supabase.storage.from("documents").remove([filePath]);
            return NextResponse.json(
                { success: false, error: "Failed to save document metadata" },
                { status: 500 }
            );
        }

        // 3. Save the extracted fields in 'document_fields'
        const fieldsToInsert = [
            { document_id: docRecord.id, field_name: "vendor_name", ai_value: extracted.vendorName, value: extracted.vendorName },
            { document_id: docRecord.id, field_name: "date", ai_value: extracted.date_of_purchase, value: extracted.date_of_purchase },
            { document_id: docRecord.id, field_name: "item_quantity", ai_value: extracted.item_quantity, value: extracted.item_quantity },
            { document_id: docRecord.id, field_name: "subtotal", ai_value: extracted.sub_total, value: extracted.sub_total },
            { document_id: docRecord.id, field_name: "tax", ai_value: extracted.tax, value: extracted.tax },
            { document_id: docRecord.id, field_name: "total", ai_value: extracted.total_price, value: extracted.total_price },
        ];

        const { error: fieldsError } = await supabase
            .from("document_fields")
            .insert(fieldsToInsert);

        if (fieldsError) {
            console.error("Database insert error (document_fields):", fieldsError);
            // Rollback: remove the document row and the uploaded file
            await supabase.from("documents").delete().eq("id", docRecord.id);
            await supabase.storage.from("documents").remove([filePath]);
            return NextResponse.json(
                { success: false, error: "Failed to save extracted fields" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            documentId: docRecord.id,
            data: extracted,
        });

    } catch (err) {
        console.error("There was an error with attempting to extract the data", err);
        return NextResponse.json(
            { success: false, error: "There was an error extracting data from the document" },
            { status: 500 }
        );
    }
}