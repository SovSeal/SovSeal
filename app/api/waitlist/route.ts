import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!supabase) {
      console.error("Supabase not configured");
      return NextResponse.json(
        { error: "Service temporarily unavailable" },
        { status: 503 }
      );
    }

    // Insert email into waitlist table
    const { error } = await supabase
      .from("waitlist")
      .upsert(
        { email: email.toLowerCase().trim(), source: "maintenance_page" },
        { onConflict: "email" }
      );

    if (error) {
      console.error("Supabase error:", error);
      
      // Handle duplicate gracefully
      if (error.code === "23505") {
        return NextResponse.json(
          { message: "You're already on the list!" },
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to join waitlist" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Successfully joined the waitlist!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
