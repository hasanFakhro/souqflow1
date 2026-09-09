import prisma from "@/lib/prisma";
import { EditProductSection } from "@/components/EditProductButton";

const Page = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: {
      id: id,
    },
  });

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <EditProductSection product={product} />
    </div>
  );
};

export default Page;