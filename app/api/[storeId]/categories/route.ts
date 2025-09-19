import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function POST (
    req: Request,
    context: { params: Promise<{ storeId: string }> }
) {
    try{
        const { storeId } = await context.params;
        const{ userId } = await auth();
        const body = await req.json();

        const { name, billboardId } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", {status: 401 });
        }

        if (!name) {
            return new NextResponse("Name is required", {status: 400});
        }

        if (!billboardId) {
            return new NextResponse("Billboard id is required", {status: 400});
        }

        if (!storeId) {
            return new NextResponse("Store id is required", {status: 400});

        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", {status: 403})
        }

        const category = await prismadb.category.create({
            data: {
              name,
              billboardId,
              storeId: storeId
            }
        });

        return NextResponse.json(category);

    } catch (error) {
        console.log("[CATEGORIES_POST", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET (
    req: Request,
    context: { params: Promise<{ storeId: string }> }
) {
    try{
        const { storeId } = await context.params;

        if (!storeId) {
            return new NextResponse("Store id is required", {status: 400});
        }

        const categories = await prismadb.category.findMany({
            where: {
                storeId: storeId
            }
        });

        return NextResponse.json(categories);

    } catch (error) {
        console.log("[CATEGORIES_GET", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}