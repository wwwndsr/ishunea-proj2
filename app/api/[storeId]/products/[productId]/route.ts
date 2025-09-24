import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";


import prismadb from "@/lib/prismadb";


export async function GET(
  req: Request,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    const { userId } = await auth();
    const { productId } = await context.params;

    // удаляем конкретный product
    const product = await prismadb.product.delete({
      where: { id: productId },
      include: {
        images:true,
        category: true,
        color: true,
        size:true
      }   
    });

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
    const body = await req.json();
    const { 
        name,
        price,
        categoryId,
        colorId,
        sizeId,
        images,
        isFeatured,
        isArchived
      } = body;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!name) {
            return new NextResponse("Name is required", {status: 400});
        }

         if (!images || !images.length) {
            return new NextResponse("Images are required", {status: 400});
        }

        if (!price) {
            return new NextResponse("Price is required", {status: 400});
        }

        if (!categoryId) {
            return new NextResponse("Category id is required", {status: 400});
        }

         if (!sizeId) {
            return new NextResponse("Size id is required", {status: 400});
        }

        if (!colorId) {
            return new NextResponse("Color id is required", {status: 400});
        }

        

    const { storeId, productId } = await context.params;

    if (!storeId || !productId) {
      return new NextResponse("Store id and Product id are required", { status: 400 });
    }

    // проверка, что этот store принадлежит пользователю
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId
      }
    });

    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

    await prismadb.product.update({
        where: { id: productId },
        data: { 
          name,
          price: new Prisma.Decimal(price), // преобразуем number обратно в Decimal
          categoryId,
          colorId,
          sizeId,
          isFeatured,
          isArchived,
          images: {
            deleteMany: {} // удаляем старые изображения
          }
      }
    });

  const product = await prismadb.product.update({
  where: { id: productId },
  data: {
    images: {
      createMany: {
        data: images.map((image: { url: string }) => ({ url: image.url })) // <-- массив объектов
      }
    }
  }
});

    return NextResponse.json(product);
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

    // проверка, что этот store принадлежит пользователю
    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId }
    });
    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

    // удаляем конкретный product
    const product = await prismadb.product.delete({
      where: { id: productId }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}



