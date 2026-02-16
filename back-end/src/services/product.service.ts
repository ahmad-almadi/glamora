import { prisma } from "../prisma.js";

export const getAllProductsService = async () => {
  return await prisma.product.findMany({
    include: {
      category: true,
      variants: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
export const getProductsByCategoryService = async (categoryId?: string) => {
  if (categoryId) {
    return prisma.product.findMany({
      where: { categoryId },
      include: { category: true, variants: true },
    });
  } else {
    return prisma.product.findMany({
      include: { category: true, variants: true },
    });
  }
};

export const getAllCategories = async () => {
  return await prisma.category.findMany({});
};

// Get a single product by ID
export const getProductByIdService = async (id: string) => {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: true,
    },
  });
};

//////admin///////

export const createProductService = async (data: any) => {
  const { variants, ...productData } = data;

  let sizes: string[] = [];
  let colors: string[] = [];

  if (variants && Array.isArray(variants)) {
    sizes = [...(new Set(variants.map((v: any) => v.size)) as Set<string>)];
    colors = [...(new Set(variants.map((v: any) => v.color)) as Set<string>)];
  }

  return await prisma.product.create({
    data: {
      ...productData,
      sizes,
      colors,
      variants: {
        create: variants || [],
      },
    },
    include: { variants: true },
  });
};

export const updateProductService = async (id: string, data: any) => {
  const { variants, ...productData } = data;

  if (variants && Array.isArray(variants)) {
    const sizes = [
      ...(new Set(variants.map((v: any) => v.size)) as Set<string>),
    ];
    const colors = [
      ...(new Set(variants.map((v: any) => v.color)) as Set<string>),
    ];

    return await prisma.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({
        where: { productId: id },
      });

      return await tx.product.update({
        where: { id },
        data: {
          ...productData,
          sizes,
          colors,
          variants: {
            create: variants,
          },
        },
        include: { variants: true },
      });
    });
  } else {
    return await prisma.product.update({
      where: { id },
      data: productData,
      include: { variants: true },
    });
  }
};

export const deleteProductService = async (id: string) => {
  return await prisma.product.delete({
    where: { id },
  });
};

export const getAllUsersService = async () => {
  return await prisma.user.findMany({
    where: {
      role: {
        not: "ADMIN", // This excludes all admins
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      authProvider: true,
      orders: {
        select: {
          id: true,
          totalAmount: true,
          createdAt: true,
          shippingAddress: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
