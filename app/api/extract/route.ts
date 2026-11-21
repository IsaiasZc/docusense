import { z } from "zod";
import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { zodResponseFormat } from "openai/helpers/zod";

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

export async function POST(req: Request){
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
        return NextResponse.json(
            {success: false, error: "No valid file was uploaded"},
            {status: 400}
        );
    }

    try {

        const bytes = Buffer.from(await file.arrayBuffer());
        const base64 = bytes.toString("base64")
        const dataURL = `data:${file.type};base64,${base64}`;
    
        const response = await apiCall.chat.completions.create({
            model: "gpt-6-luna",
            messages: [
                {role: "system", content: "You are an expert at parsing documents and pulling out the necessary info"},
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
                {success: false, error: "An empty response was returned"},
                {status: 500}
            );
        }
        const parsedData = ExtractedObject.safeParse(JSON.parse(rawContent));
    
        if (!parsedData.success) {
            return NextResponse.json(
                {success: false, error: "There was an error validating the data"},
                {status: 422}
            );
        }
    
        return NextResponse.json({
           success: true,
           data: parsedData.data, 
        });
    } catch (err) {
        console.error("There was an error with attempting to extract the data", err)
        return NextResponse.json(
            {success: false, error: "There was an error extracting data from the document"},
            {status: 500}
        );
    }
}