import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tags } = body;

    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { success: false, error: "Tags array is required" },
        { status: 400 }
      );
    }

    for (const tag of tags) {
      revalidateTag(tag);
    }

    return NextResponse.json({
      success: true,
      message: `Revalidated tags: ${tags.join(", ")}`,
    });
  } catch (error) {
    console.error("Error revalidating:", error);
    return NextResponse.json(
      { success: false, error: "Failed to revalidate" },
      { status: 500 }
    );
  }
}
