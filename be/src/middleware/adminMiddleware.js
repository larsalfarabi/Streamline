const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

/**
 * Admin Middleware: Verifies JWT and checks if user has ADMIN role
 * Usage: Place this after authMiddleware in admin routes
 */
async function adminMiddleware(req, res, next) {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database with role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Check if user has ADMIN role
    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Hanya admin yang bisa mengakses resource ini.",
      });
    }

    // Attach user info to request
    req.user = {
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token sudah kadaluarsa",
      });
    }

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
}

module.exports = adminMiddleware;
