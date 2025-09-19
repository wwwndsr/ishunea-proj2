import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";


export async function GET(
  req: Request,
  context: { params: Promise<{ sizeId: string }> }
) {
  try {
    const { userId } = await auth();
    const { sizeId } = await context.params;

    // удаляем конкретный size
    const size = await prismadb.size.delete({
      where: { id: sizeId }
    });

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
    const body = await req.json();
    const { name, value } = body;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!value) return new NextResponse("Value is required", { status: 400 });

    const { storeId, sizeId } = await context.params;

    if (!storeId || !sizeId) {
      return new NextResponse("Store Id and Size Id are required", { status: 400 });
    }

    // проверка, что этот store принадлежит пользователю
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId
      }
    });

    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

    const size = await prismadb.size.update({
      where: { id: sizeId },
      data: { name, value }
    });

    return NextResponse.json(size);
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
      return new NextResponse("Store id and Billboard id are required", { status: 400 });

    // проверка, что этот store принадлежит пользователю
    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId }
    });
    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

    // удаляем конкретный size
    const size = await prismadb.size.delete({
      where: { id: sizeId }
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}



