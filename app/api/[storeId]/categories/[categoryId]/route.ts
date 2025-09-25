import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  context: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await context.params;

    const category = await prismadb.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) return new NextResponse("Category not found", { status: 404 });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ storeId: string; categoryId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    const { storeId, categoryId } = await context.params;
    const body = await req.json();
    const { name, billboardId } = body;

    if (!storeId || !categoryId) return new NextResponse("Store id and Category id required", { status: 400 });
    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!billboardId) return new NextResponse("Billboard id is required", { status: 400 });

    const store = await prismadb.store.findFirst({ where: { id: storeId, userId } });
    if (!store) return new NextResponse("Unauthorized", { status: 403 });

    const updated = await prismadb.category.update({
      where: { id: categoryId },
      data: { name, billboardId },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.log("[CATEGORY_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ storeId: string; categoryId: string }> }
) {
  try {
    const { userId } = await auth();
    const { storeId, categoryId } = await context.params;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!storeId || !categoryId) return new NextResponse("Store id and Category id required", { status: 400 });

    const store = await prismadb.store.findFirst({ where: { id: storeId, userId } });
    if (!store) return new NextResponse("Unauthorized", { status: 403 });

    try {
      const deleted = await prismadb.category.delete({ where: { id: categoryId } });
      return NextResponse.json(deleted);
    } catch (error: any) {
      if (error.code === "P2003") {
        return new NextResponse("Cannot delete category: it has dependent records", { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.log("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
