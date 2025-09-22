import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";


export async function GET(
  req: Request,
  context: { params: Promise<{ colorId: string }> }
) {
  try {
    const { userId } = await auth();
    const { colorId } = await context.params;

    // удаляем конкретный color
    const color = await prismadb.color.delete({
      where: { id: colorId }
    });

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
    const body = await req.json();
    const { name, value } = body;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!value) return new NextResponse("Value is required", { status: 400 });

    const { storeId, colorId } = await context.params;

    if (!storeId || !colorId) {
      return new NextResponse("Store Id and Color Id are required", { status: 400 });
    }

    // проверка, что этот store принадлежит пользователю
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId
      }
    });

    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

    const color = await prismadb.color.update({
      where: { id: colorId },
      data: { name, value }
    });

    return NextResponse.json(color);
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
    if (!storeId || !colorId)
      return new NextResponse("Store id and Billboard id are required", { status: 400 });

    // проверка, что этот store принадлежит пользователю
    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId }
    });
    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

    // удаляем конкретный color
    const color = await prismadb.color.delete({
      where: { id: colorId }
    });

    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLOR_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}



