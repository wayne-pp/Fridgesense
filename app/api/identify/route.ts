import { identifyFoodFromImage } from "@/lib/claude";
import type { SupportedImageMediaType } from "@/lib/claude";

const supportedImageTypes: SupportedImageMediaType[] = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const maxImageSize = 5 * 1024 * 1024;

function isSupportedImageType(value: string): value is SupportedImageMediaType {
  return supportedImageTypes.includes(value as SupportedImageMediaType);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return Response.json({ error: "Please upload an image." }, { status: 400 });
    }

    if (!isSupportedImageType(image.type)) {
      return Response.json(
        { error: "Please upload a JPG, PNG, GIF, or WebP image." },
        { status: 400 },
      );
    }

    if (image.size > maxImageSize) {
      return Response.json(
        { error: "Image is too large. Please upload an image under 5 MB." },
        { status: 400 },
      );
    }

    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const result = await identifyFoodFromImage({
      base64Image: imageBuffer.toString("base64"),
      mediaType: image.type,
    });

    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to identify image.";

    return Response.json({ error: message }, { status: 500 });
  }
}
