import { v2 as cloudinary } from "cloudinary";
import { AppError } from "@/lib/api/errors";
import { nanoid } from "nanoid";

function getCredentials() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new AppError(
      "STORAGE_NOT_CONFIGURED",
      "File storage is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local.",
      503
    );
  }

  if (/^\*+$/.test(apiSecret) || apiSecret.includes("your_") || apiSecret === "CHANGE_ME") {
    throw new AppError(
      "STORAGE_NOT_CONFIGURED",
      "CLOUDINARY_API_SECRET looks like a placeholder. Paste your real API Secret from the Cloudinary dashboard (Settings → API Keys).",
      503
    );
  }

  return { cloudName, apiKey, apiSecret };
}

function configure() {
  const { cloudName, apiKey, apiSecret } = getCredentials();

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

function resourceTypeForMime(mimeType?: string): "image" | "raw" {
  if (mimeType?.startsWith("image/")) return "image";
  return "raw";
}

export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder: string;
    fileName: string;
    mimeType: string;
  }
): Promise<{
  url: string;
  publicId: string;
  bytes: number;
  format: string;
}> {
  const client = configure();
  const resourceType = resourceTypeForMime(options.mimeType);
  // Keep public_id simple — original filenames can break signatures/paths
  const publicId = nanoid(16);

  try {
    const result = await new Promise<{
      secure_url: string;
      public_id: string;
      bytes: number;
      format?: string;
    }>((resolve, reject) => {
      const stream = client.uploader.upload_stream(
        {
          folder: options.folder,
          public_id: publicId,
          resource_type: resourceType,
          overwrite: false,
          use_filename: false,
          unique_filename: false,
        },
        (err, res) => {
          if (err || !res) {
            reject(err ?? new Error("Upload failed"));
            return;
          }
          resolve(res as {
            secure_url: string;
            public_id: string;
            bytes: number;
            format?: string;
          });
        }
      );
      stream.end(buffer);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      bytes: result.bytes,
      format: result.format || options.fileName.split(".").pop() || "bin",
    };
  } catch (err) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "Upload failed";

    if (/invalid signature/i.test(message) || /http_code.: 401/.test(message)) {
      throw new AppError(
        "STORAGE_AUTH_FAILED",
        "Cloudinary rejected the upload (invalid credentials). Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET match your Cloudinary dashboard.",
        502
      );
    }

    throw new AppError("STORAGE_UPLOAD_FAILED", message, 502);
  }
}

export function getSignedDownloadUrl(publicId: string, expiresIn = 3600) {
  const client = configure();
  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
  return client.utils.private_download_url(publicId, "", {
    expires_at: expiresAt,
    attachment: true,
  });
}
