import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidateTag } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");

    let query = supabase.from("home_config").select("*").eq("is_active", true);

    if (section) {
      query = query.eq("section", section);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching home config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch home config" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { section, config } = body;

    const { data: existing } = await supabase
      .from("home_config")
      .select("id")
      .eq("section", section)
      .single();

    let result;

    if (existing) {
      result = await supabase
        .from("home_config")
        .update({
          config,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("home_config")
        .insert({
          section,
          config,
          is_active: true,
        })
        .select()
        .single();
    }

    if (result.error) throw result.error;

    revalidateTag("home-config");

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error updating home config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update home config" },
      { status: 500 }
    );
  }
}
