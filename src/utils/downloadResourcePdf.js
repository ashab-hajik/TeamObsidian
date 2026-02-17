const FILE_MAP = {
  Notes: "/mock-pdfs/notes-pack.pdf",
  PYQ: "/mock-pdfs/pyq-pack.pdf",
  Assignment: "/mock-pdfs/assignment-kit.pdf",
};

const FALLBACK_FILE = "/mock-pdfs/notes-pack.pdf";

const sanitizeFileName = (value) =>
  String(value ?? "resource")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 80);

export const getMockPdfMeta = (resource) => {
  const sizeKb = 320 + (String(resource?.id ?? "").length + String(resource?.title ?? "").length) * 7;
  return {
    fileType: "PDF",
    fileSize: `${sizeKb} KB`,
  };
};

export async function downloadResourcePdf(resource) {
  const source = FILE_MAP[resource?.type] ?? FALLBACK_FILE;
  const response = await fetch(source);
  if (!response.ok) throw new Error("Failed to load mock PDF file");

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeFileName(resource?.title || "resource")}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
