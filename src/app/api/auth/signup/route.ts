import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, setAuthCookie, signToken } from "@/lib/auth";
import { DEFAULT_MAP_LAT, DEFAULT_MAP_LNG } from "@/lib/region";
import { createServerSupabase } from "@/lib/supabase";
import type { UserRole } from "@/types";

const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["customer", "business"]),
  business: z
    .object({
      name: z.string().min(1),
      address: z.string().min(1),
      category: z.enum(["bakery", "cafe", "restaurant", "grocery"]),
      phone: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  try {
    const json: unknown = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { name, email, password, role, business } = parsed.data;
    if (role === "business" && !business) {
      return NextResponse.json({ error: "Business details required" }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { data: existing } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const password_hash = await hashPassword(password);
    const { data: userRow, error: userError } = await supabase
      .from("users")
      .insert({
        email,
        password_hash,
        name,
        role: role as UserRole,
      })
      .select("id, name, email, role")
      .single();

    if (userError || !userRow) {
      console.error(userError);
      return NextResponse.json({ error: "Could not create account" }, { status: 500 });
    }

    if (role === "business" && business) {
      const { error: bizError } = await supabase.from("businesses").insert({
        owner_id: userRow.id,
        name: business.name,
        address: business.address,
        category: business.category,
        phone: business.phone ?? null,
        description: null,
        lat: DEFAULT_MAP_LAT,
        lng: DEFAULT_MAP_LNG,
        logo_url: null,
        rating: 0,
        verified: false,
      });
      if (bizError) {
        console.error(bizError);
        await supabase.from("users").delete().eq("id", userRow.id);
        return NextResponse.json({ error: "Could not create business profile" }, { status: 500 });
      }
    }

    const token = signToken({ userId: userRow.id, role: userRow.role, email: userRow.email });
    setAuthCookie(token);

    return NextResponse.json({
      user: { id: userRow.id, name: userRow.name, email: userRow.email, role: userRow.role },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
