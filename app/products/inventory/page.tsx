import ProductTable from "../../../components/ProductTable";

export default async function ProductsPage() {
  const response = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const products = await response.json();

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-7xl rounded-xl bg-white p-8 shadow-md">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Products
          </h1>

          <a
            href="/products/add"
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
          >
            Add Product
          </a>
        </div>

        <ProductTable products={products} />
      </div>
    </main>
  );
}