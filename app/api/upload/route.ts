import { put } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return Response.json({ error: "File too large" }, { status: 413 });
    }

    const blob = await put(`reports/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return Response.json({ url: blob.url, contentType: file.type });
  } catch (err) {
    console.error("Upload route error:", err);
    return Response.json({ error: "Upload failed on server" }, { status: 500 });
  }
}