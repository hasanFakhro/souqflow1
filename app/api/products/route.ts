import {NextRequest, NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products, {status: 200});
  } catch (error) {
    console.error("Error fetching products:", error);

    return NextResponse.json(
      {message:'Failed to fetch products'},
      {status: 500}
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

  if (!name || name.trim() === '') {
    return NextResponse.json(
      {message: 'Product name is required'},
      {status: 400}
    );
  }

  if (costPrice === undefined || Number(costPrice) <= 0) {
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

  const product = await prisma.product.create({
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
    }
  });

  return NextResponse.json(
      {
        message: "Product added successfully",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);

    return NextResponse.json(
      {message:'Failed to create product'},
      {status: 500}
    );
  }
}