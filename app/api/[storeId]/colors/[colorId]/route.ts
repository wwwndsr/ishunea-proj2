import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  context: { params: Promise<{ colorId: string }> }
) {
  try {
    const { colorId } = await context.params;

    const color = await prismadb.color.findUnique({ where: { id: colorId } });
    if (!color) return new NextResponse("Color not found", { status: 404 });

    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLOR_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ storeId: string; colorId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    const { storeId, colorId } = await context.params;
    const body = await req.json();
    const { name, value } = body;

    if (!storeId || !colorId) return new NextResponse("Store id and Color id required", { status: 400 });
    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!value) return new NextResponse("Value is required", { status: 400 });

    const store = await prismadb.store.findFirst({ where: { id: storeId, userId } });
    if (!store) return new NextResponse("Unauthorized", { status: 403 });

    const updated = await prismadb.color.update({
      where: { id: colorId },
      data: { name, value },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.log("[COLOR_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ storeId: string; colorId: string }> }
) {
  try {
    const { userId } = await auth();
    const { storeId, colorId } = await context.params;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!storeId || !colorId) return new NextResponse("Store id and Color id required", { status: 400 });

    const store = await prismadb.store.findFirst({ where: { id: storeId, userId } });
    if (!store) return new NextResponse("Unauthorized", { status: 403 });

    try {
      const deleted = await prismadb.color.delete({ where: { id: colorId } });
      return NextResponse.json(deleted);
    } catch (error: any) {
      if (error.code === "P2003") {
        return new NextResponse("Cannot delete color: it has dependent records", { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.log("[COLOR_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
