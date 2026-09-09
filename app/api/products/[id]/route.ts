import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const {
      name,
      description,
      imageUrl,
      sku,
      category,
      costPrice,
      sellPrice,
      quantity,
      lowStockAt,
    } = body;

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { message: "Product name is required" },
        { status: 400 }
      );
    }

    if (costPrice === undefined || Number(costPrice) < 0) {
      return NextResponse.json(
        { message: "Cost price must be 0 or greater" },
        { status: 400 }
      );
    }

    if (sellPrice === undefined || Number(sellPrice) < 0) {
      return NextResponse.json(
        { message: "Sell price must be 0 or greater" },
        { status: 400 }
      );
    }

    if (quantity === undefined || Number(quantity) < 0) {
      return NextResponse.json(
        { message: "Quantity must be 0 or greater" },
        { status: 400 }
      );
    }

    if (lowStockAt !== undefined && Number(lowStockAt) < 0) {
      return NextResponse.json(
        { message: "Low stock level cannot be negative" },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: {
        id,
      },

      data: {
        name: name.trim(),
        description: description || null,
        imageUrl: imageUrl || null,
        sku: sku || null,
        category: category || null,

        costPrice: Number(costPrice),
        sellPrice: Number(sellPrice),
        quantity: Number(quantity),

        lowStockAt:
          lowStockAt !== undefined ? Number(lowStockAt) : null,
      },
    });

    return NextResponse.json(
      {
        message: "Product updated successfully",
        product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating product:", error);

    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}



export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

     await prisma.product.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      {
        message: "Product deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);

    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 }
    );
  }
}