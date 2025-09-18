import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";


export async function GET(
  req: Request,
  context: { params: Promise<{ billboardId: string }> }
) {
  try {
    const { userId } = await auth();
    const { billboardId } = await context.params;

    // удаляем конкретный billboard
    const billboard = await prismadb.billboard.delete({
      where: { id: billboardId }
    });

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
    const body = await req.json();
    const { label, imageUrl } = body;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!label) return new NextResponse("Label is required", { status: 400 });
    if (!imageUrl) return new NextResponse("Image URL is required", { status: 400 });

    const { storeId, billboardId } = await context.params;

    if (!storeId || !billboardId) {
      return new NextResponse("Store ID and Billboard ID are required", { status: 400 });
    }

    // проверка, что этот store принадлежит пользователю
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId
      }
    });

    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

    const billboard = await prismadb.billboard.update({
      where: { id: billboardId },
      data: { label, imageUrl }
    });

    return NextResponse.json(billboard);
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
    if (!storeId || !billboardId)
      return new NextResponse("Store ID and Billboard ID are required", { status: 400 });

    // проверка, что этот store принадлежит пользователю
    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId }
    });
    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

    // удаляем конкретный billboard
    const billboard = await prismadb.billboard.findUnique({
      where: { id: billboardId }
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}



