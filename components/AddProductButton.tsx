"use client";

import { useState } from "react";
import ProductFormModal, { ProductFormData } from "./ProductFormModal";

export function AddProductSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateProduct = async (newProduct: ProductFormData) => {
    // API call will connect here
    console.log("Creating product:", newProduct);
  };

  return (
    <div>
      {/* The Add Product Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-purple-700"
      >
        <span className="text-lg leading-none">+</span>
        <span>Add Product</span>
      </button>

      {/* The Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProduct}
      />
    </div>
  );
}
