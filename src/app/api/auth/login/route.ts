import { NextResponse } from "next/server";
import { z } from "zod";
import { setAuthCookie, signToken, verifyPassword } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const json: unknown = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    const { email, password } = parsed.data;
    const supabase = createServerSupabase();
    const { data: userRow, error } = await supabase
      .from("users")
      .select("id, name, email, role, password_hash")
      .eq("email", email)
      .maybeSingle();

    if (error || !userRow) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const ok = await verifyPassword(password, userRow.password_hash as string);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = signToken({
      userId: userRow.id,
      role: userRow.role,
      email: userRow.email,
    });
    setAuthCookie(token);

    return NextResponse.json({
      user: {
        id: userRow.id,
        name: userRow.name,
        email: userRow.email,
        role: userRow.role,
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
}
