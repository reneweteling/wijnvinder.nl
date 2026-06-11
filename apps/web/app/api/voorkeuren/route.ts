import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { authDb } from "@/lib/db/client";

export async function GET() {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json(null, { status: 401 });
  }

  const user = await authDb(session.user).user.findUnique({
    where: { id: session.user.id },
    select: { weeklyDealsOptIn: true },
  });

  return NextResponse.json({ weeklyDealsOptIn: user?.weeklyDealsOptIn ?? true });
}

export async function PUT(request: Request) {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  let body: { weeklyDealsOptIn: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige data" }, { status: 400 });
  }

  if (typeof body.weeklyDealsOptIn !== "boolean") {
    return NextResponse.json({ error: "Ongeldige waarde" }, { status: 400 });
  }

  await authDb(session.user).user.update({
    where: { id: session.user.id },
    data: { weeklyDealsOptIn: body.weeklyDealsOptIn },
  });

  return NextResponse.json({ weeklyDealsOptIn: body.weeklyDealsOptIn });
}
