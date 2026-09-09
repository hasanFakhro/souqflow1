"use client";

import { useState } from "react";
import ProductFormModal, { ProductFormData } from "./ProductFormModal";

export function EditProductSection({ product }: { product: ProductFormData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdateProduct = async (updatedProduct: ProductFormData) => {
    // API call will connect here
    console.log("Updating product:", updatedProduct);
  };

  return (
    <div>
      {/* The Edit Product Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-blue-600"
      >
        Edit
      </button>

      {/* The Modal with existing product populated */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleUpdateProduct}
        initialData={product}
      />
    </div>
  );
}
