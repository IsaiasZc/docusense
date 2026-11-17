import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/upload", label: "Upload" },
  { href: "/documents", label: "Documents" },
  { href: "/export", label: "Export" },
];

export default function Sidebar() {
  return (
    <aside className="flex w-56 flex-col gap-1 border-r border-white/10 p-4">
      <h2 className="mb-4 text-lg font-semibold">DocuSense</h2>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-md px-3 py-2 text-sm hover:bg-white/10"
        >
          {link.label}
        </Link>
      ))}
    </aside>
  );
}