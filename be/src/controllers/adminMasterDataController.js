const prisma = require("../config/prisma");

/**
 * Get all hosts (for dropdown selection)
 * GET /api/admin/users/hosts
 */
async function getHosts(req, res) {
  try {
    const hosts = await prisma.user.findMany({
      where: {
        role: "HOST",
      },
      select: {
        id: true,
        username: true,
        displayName: true,
      },
      orderBy: {
        displayName: "asc",
      },
    });

    res.json({
      success: true,
      data: hosts,
    });
  } catch (error) {
    console.error("Get hosts error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
}

/**
 * Get all products with optional search
 * GET /api/admin/products?search=keyword
 */
async function getProducts(req, res) {
  try {
    const { search } = req.query;

    const where = {};

    // Add search filter if provided
    if (search) {
      where.OR = [
        { sku: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
}

/**
 * Get all active vouchers
 * GET /api/admin/vouchers
 */
async function getVouchers(req, res) {
  try {
    const vouchers = await prisma.voucher.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        code: "asc",
      },
    });

    res.json({
      success: true,
      data: vouchers,
    });
  } catch (error) {
    console.error("Get vouchers error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
}

module.exports = {
  getHosts,
  getProducts,
  getVouchers,
};
