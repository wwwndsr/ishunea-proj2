import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  context: { params: Promise<{ sizeId: string }> }
) {
  try {
    const { sizeId } = await context.params;

    const size = await prismadb.size.findUnique({ where: { id: sizeId } });
    if (!size) return new NextResponse("Size not found", { status: 404 });

    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ storeId: string; sizeId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    const { storeId, sizeId } = await context.params;
    const body = await req.json();
    const { name, value } = body;

    if (!storeId || !sizeId)
      return new NextResponse("Store ID and Size ID are required", { status: 400 });
    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!value) return new NextResponse("Value is required", { status: 400 });

    const store = await prismadb.store.findFirst({ where: { id: storeId, userId } });
    if (!store) return new NextResponse("Unauthorized", { status: 403 });

    const updated = await prismadb.size.update({
      where: { id: sizeId },
      data: { name, value },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.log("[SIZE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ storeId: string; sizeId: string }> }
) {
  try {
    const { userId } = await auth();
    const { storeId, sizeId } = await context.params;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!storeId || !sizeId)
      return new NextResponse("Store and Size IDs required", { status: 400 });

    const store = await prismadb.store.findFirst({ where: { id: storeId, userId } });
    if (!store) return new NextResponse("Unauthorized", { status: 403 });

    try {
      const deleted = await prismadb.size.delete({ where: { id: sizeId } });
      return NextResponse.json(deleted);
    } catch (error: any) {
      if (error.code === "P2003") {
        return new NextResponse("Cannot delete size: it has dependent records", { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.log("[SIZE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
