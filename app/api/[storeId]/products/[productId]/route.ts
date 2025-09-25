import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await context.params;

    const product = await prismadb.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
        category: true,
        color: true,
        size: true,
      },
    });

    if (!product) return new NextResponse("Product not found", { status: 404 });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    const { storeId, productId } = await context.params;
    const body = await req.json();
    const {
      name,
      price,
      categoryId,
      colorId,
      sizeId,
      images,
      isFeatured,
      isArchived,
    } = body;

    if (!storeId || !productId)
      return new NextResponse("Store id and Product id are required", { status: 400 });
    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!price) return new NextResponse("Price is required", { status: 400 });
    if (!categoryId) return new NextResponse("Category id is required", { status: 400 });
    if (!colorId) return new NextResponse("Color id is required", { status: 400 });
    if (!sizeId) return new NextResponse("Size id is required", { status: 400 });
    if (!images || !images.length) return new NextResponse("Images are required", { status: 400 });

    const store = await prismadb.store.findFirst({ where: { id: storeId, userId } });
    if (!store) return new NextResponse("Unauthorized", { status: 403 });

    // Удаляем старые изображения и обновляем продукт
    await prismadb.product.update({
      where: { id: productId },
      data: {
        name,
        price: new Prisma.Decimal(price),
        categoryId,
        colorId,
        sizeId,
        isFeatured,
        isArchived,
        images: { deleteMany: {} },
      },
    });

    const updated = await prismadb.product.update({
      where: { id: productId },
      data: {
        images: {
          createMany: { data: images.map((img: { url: string }) => ({ url: img.url })) },
        },
      },
      include: { images: true, category: true, color: true, size: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.log("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const { userId } = await auth();
    const { storeId, productId } = await context.params;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!storeId || !productId)
      return new NextResponse("Store id and Product id are required", { status: 400 });

    const store = await prismadb.store.findFirst({ where: { id: storeId, userId } });
    if (!store) return new NextResponse("Unauthorized", { status: 403 });

    try {
      const deleted = await prismadb.product.delete({ where: { id: productId } });
      return NextResponse.json(deleted);
    } catch (error: any) {
      if (error.code === "P2003") {
        return new NextResponse("Cannot delete product: it has dependent records", { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.log("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
