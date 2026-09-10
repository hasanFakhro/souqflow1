import ProductsGrid from "@/components/ProductsGrid";
import prisma from "@/lib/prisma";
import Link from "next/link";

const page = async () => {
   const products = await prisma.product.findMany();

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center gap-2">
                <p className="text-gray-500">No products yet.</p>
                <Link href="/products/inventory" className="text-primary font-medium hover:underline">
                    Add some in the inventory
                </Link>
            </div>
        );
    }

    return <ProductsGrid products={products} />;
};

export default page;