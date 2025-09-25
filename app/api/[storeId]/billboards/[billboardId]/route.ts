import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";


export async function GET(
  req: Request,
  context: { params: Promise<{ billboardId: string }> }
) {
  try {
    const { billboardId } = await context.params;

    const billboard = await prismadb.billboard.findUnique({
      where: { id: billboardId },
    });

    if (!billboard) return new NextResponse("Billboard not found", { status: 404 });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ storeId: string; billboardId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    const { storeId, billboardId } = await context.params;
    const body = await req.json();
    const { label, imageUrl } = body;

    if (!storeId || !billboardId) return new NextResponse("Store ID and Billboard ID are required", { status: 400 });
    if (!label) return new NextResponse("Label is required", { status: 400 });
    if (!imageUrl) return new NextResponse("Image URL is required", { status: 400 });

    const store = await prismadb.store.findFirst({ where: { id: storeId, userId } });
    if (!store) return new NextResponse("Unauthorized", { status: 403 });

    const updated = await prismadb.billboard.update({
      where: { id: billboardId },
      data: { label, imageUrl },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.log("[BILLBOARD_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}


export async function DELETE(
  req: Request,
  context: { params: Promise<{ storeId: string; billboardId: string }> }
) {
  try {
    const { userId } = await auth();
    const { storeId, billboardId } = await context.params;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!storeId || !billboardId) return new NextResponse("Store and Billboard IDs required", { status: 400 });

    const store = await prismadb.store.findFirst({ where: { id: storeId, userId } });
    if (!store) return new NextResponse("Unauthorized", { status: 403 });

    try {
      const deleted = await prismadb.billboard.delete({ where: { id: billboardId } });
      return NextResponse.json(deleted);
    } catch (error: any) {
      if (error.code === "P2003") {
        return new NextResponse("Cannot delete billboard: it has dependent records", { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.log("[BILLBOARD_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}




