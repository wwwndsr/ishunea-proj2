import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";
import Navbar from "@/components/navbar";

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { storeId: string } | Promise<{ storeId: string }>;
}) {
    const { userId } = await auth();

    if (!userId) redirect("/sign-in");

    //дожидаемся params, если это промис
    const resolvedParams = await params;
    const { storeId } = resolvedParams;

    const store = await prismadb.store.findFirst({
        where: {
            id: storeId,
            userId,
        },
    });

    if (!store) redirect("/");

    return (
        <>
           <Navbar />
            {children}
        </>
    );
}
