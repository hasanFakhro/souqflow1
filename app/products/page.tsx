import ProductCard from "@/components/ProductCard"
import ProductsGrid from "@/components/ProductsGrid";
import SearchBar from "@/components/SearchBar"
import prisma from "@/lib/prisma"
import { Product } from "@prisma/client";

const page = async () => {
    const products = await prisma.product.findMany();
    return (
        <div>
            <ProductsGrid products={products}/>
        </div>
    )
}

export default page