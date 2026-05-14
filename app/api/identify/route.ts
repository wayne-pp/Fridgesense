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

function getFriendlyErrorMessage(error: unknown) {
  const message =
    error instanceof Error ? error.message : "识别图片失败，请稍后再试。";

  if (message.includes("exceeds 5 MB") || message.includes("too large")) {
    return "这张照片对 Claude Vision 来说还是太大。请重新上传，或换一张更小、更清楚的照片。";
  }

  if (message.includes("invalid_request_error")) {
    return "Claude 暂时无法处理这张图片。请换一张更清楚或更小的照片。";
  }

  return message;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return Response.json({ error: "请先上传一张图片。" }, { status: 400 });
    }

    if (!isSupportedImageType(image.type)) {
      return Response.json(
        { error: "请上传 JPG、PNG、GIF 或 WebP 格式的图片。" },
        { status: 400 },
      );
    }

    if (image.size > maxImageSize) {
      return Response.json(
        { error: "图片太大了，请上传小于 5 MB 的图片。" },
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
    return Response.json({ error: getFriendlyErrorMessage(error) }, { status: 500 });
  }
}
