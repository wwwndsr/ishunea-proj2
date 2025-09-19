import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";


export async function GET(
  req: Request,
  context: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { userId } = await auth();
    const { categoryId } = await context.params;

    // удаляем конкретный category
    const category = await prismadb.category.delete({
      where: { id: categoryId }
    });

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
    const body = await req.json();
    const { name, billboardId } = body;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!billboardId) return new NextResponse("Billboard id is required", { status: 400 });

    const { storeId, categoryId } = await context.params;

    if (!storeId || !categoryId) {
      return new NextResponse("Store id and Category id are required", { status: 400 });
    }

    // проверка, что этот store принадлежит пользователю
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId
      }
    });

    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

    const category = await prismadb.category.update({
      where: { id: categoryId },
      data: { name, billboardId }
    });

    return NextResponse.json(category);
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
    if (!storeId || !categoryId)
      return new NextResponse("Store id and Category id are required", { status: 400 });

    // проверка, что этот store принадлежит пользователю
    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId }
    });
    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

    // удаляем конкретный category
    const category = await prismadb.category.delete({
      where: { id: categoryId }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}



