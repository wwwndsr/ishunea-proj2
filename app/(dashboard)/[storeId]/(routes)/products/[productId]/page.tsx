import prismadb from "@/lib/prismadb";
import { ProductForm } from "./components/product-form";


const ProductPage = async ({
  params
}: {
  params: { storeId: string; productId: string } 
}) => {
  const { storeId, productId } = await Promise.resolve(params); 

  let formattedProduct = null;

  // если это не "new", то грузим продукт
  if (productId !== "new") {
    const product = await prismadb.product.findUnique({
      where: { id: productId },
      include: { images: true }
    });

    if (!product) return null;

    formattedProduct = {
      ...product,
      price: Number(product.price),
      images: product.images.map(img => ({ ...img })),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    };
  }

  const categories = await prismadb.category.findMany({ where: { storeId } });
  const sizes = await prismadb.size.findMany({ where: { storeId } });
  const colors = await prismadb.color.findMany({ where: { storeId } });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm
          categories={categories}
          colors={colors}
          sizes={sizes}
          initialData={formattedProduct as any} // если новый продукт, будет null
        />
      </div>
    </div>
  );
};

export default ProductPage;
