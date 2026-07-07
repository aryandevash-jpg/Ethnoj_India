import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

function isConfigured(): boolean {
  return Boolean(CLOUD_NAME && API_KEY && API_SECRET);
}

function generateSignature(params: Record<string, string | number>): string {
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  
  return crypto
    .createHash("sha256")
    .update(stringToSign + API_SECRET)
    .digest("hex");
}

export async function POST(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { folder = "uploads", resourceType = "image" } = body;

    const timestamp = Math.floor(Date.now() / 1000);
    
    const params: Record<string, string | number> = {
      timestamp,
      folder,
    };

    const signature = generateSignature(params);

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: CLOUD_NAME,
      apiKey: API_KEY,
      folder,
      resourceType,
    });
  } catch (error) {
    console.error("Error generating signature:", error);
    return NextResponse.json(
      { error: "Failed to generate signature" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    configured: isConfigured(),
    cloudName: CLOUD_NAME ? "***" : null,
  });
}
