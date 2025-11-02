const prisma = require("../config/prisma");
/**
 * Get ALL schedules (for admin dashboard)
 * GET /api/admin/schedules
 */
async function getAllSchedules(req, res) {
  try {
    const { date, hostId, platform } = req.query;

    // Build where clause
    const where = {};

    // Filter by date if provided
    if (date) {
      // Parse date string as local date (YYYY-MM-DD)
      // Don't use new Date() as it will interpret as UTC
      const [year, month, day] = date.split("-").map(Number);

      // Create date range for the entire day in local timezone
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

      where.scheduledAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // Filter by host
    if (hostId) {
      where.hostId = parseInt(hostId);
    }

    // Filter by platform
    if (platform) {
      where.platform = platform;
    }

    // Fetch all schedules with host info
    const schedules = await prisma.schedule.findMany({
      where,
      orderBy: {
        scheduledAt: "asc",
      },
      select: {
        id: true,
        title: true,
        platform: true,
        storeName: true,
        scheduledAt: true,
        salesTarget: true,
        acknowledgedAt: true,
        host: {
          select: {
            id: true,
            displayName: true,
            username: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error("Get all schedules error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
}

/**
 * Get schedule detail by ID (for edit form)
 * GET /api/admin/schedules/:id
 */
async function getScheduleById(req, res) {
  try {
    const { id } = req.params;

    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            displayName: true,
            username: true,
          },
        },
        products: {
          include: {
            product: true,
          },
        },
        vouchers: {
          include: {
            voucher: true,
          },
        },
        talkingPoints: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Jadwal tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error("Get schedule by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
}

/**
 * Create new schedule (with nested products, vouchers, talking points)
 * POST /api/admin/schedules
 */
async function createSchedule(req, res) {
  try {
    const {
      hostId,
      title,
      platform,
      storeName,
      scheduledAt,
      salesTarget,
      products = [], // Array of { productId, promoPrice }
      vouchers = [], // Array of { voucherId }
      talkingPoints = [], // Array of { text, order }
    } = req.body;

    // Validation
    if (!hostId || !title || !platform || !storeName || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "Data tidak lengkap",
      });
    }

    // Create schedule with nested writes
    const schedule = await prisma.schedule.create({
      data: {
        hostId: parseInt(hostId),
        title,
        platform,
        storeName,
        // Convert ISO string to Date object (Prisma will store it as-is in local timezone)
        scheduledAt: new Date(scheduledAt),
        salesTarget: parseFloat(salesTarget) || 0,
        // Nested create for products
        products: {
          create: products.map((p) => ({
            productId: parseInt(p.productId),
            promoPrice: parseFloat(p.promoPrice),
          })),
        },
        // Nested create for vouchers
        vouchers: {
          create: vouchers.map((v) => ({
            voucherId: parseInt(v.voucherId),
          })),
        },
        // Nested create for talking points
        talkingPoints: {
          create: talkingPoints.map((tp) => ({
            text: tp.text,
            order: parseInt(tp.order),
          })),
        },
      },
      include: {
        host: {
          select: {
            displayName: true,
          },
        },
        products: {
          include: {
            product: true,
          },
        },
        vouchers: {
          include: {
            voucher: true,
          },
        },
        talkingPoints: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    console.log(
      `[Admin Schedule] Created schedule for hostId ${schedule.hostId}, SSE notification sent: ${notificationSent}`
    );

    res.status(201).json({
      success: true,
      message: "Jadwal berhasil dibuat",
      data: schedule,
    });
  } catch (error) {
    console.error("Create schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
}

/**
 * Update schedule (with nested updates)
 * PUT /api/admin/schedules/:id
 */
async function updateSchedule(req, res) {
  try {
    const { id } = req.params;
    const {
      hostId,
      title,
      platform,
      storeName,
      scheduledAt,
      salesTarget,
      products = [],
      vouchers = [],
      talkingPoints = [],
    } = req.body;

    // Check if schedule exists
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return res.status(404).json({
        success: false,
        message: "Jadwal tidak ditemukan",
      });
    }

    // Update schedule using transaction
    const updatedSchedule = await prisma.$transaction(async (tx) => {
      // 1. Delete existing relationships
      await tx.scheduleProduct.deleteMany({
        where: { scheduleId: id },
      });

      await tx.scheduleVoucher.deleteMany({
        where: { scheduleId: id },
      });

      await tx.talkingPoint.deleteMany({
        where: { scheduleId: id },
      });

      // 2. Update schedule with new nested data
      const updated = await tx.schedule.update({
        where: { id },
        data: {
          ...(hostId && { hostId: parseInt(hostId) }),
          ...(title && { title }),
          ...(platform && { platform }),
          ...(storeName && { storeName }),
          // Convert ISO string to Date object if scheduledAt is provided
          ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
          ...(salesTarget !== undefined && {
            salesTarget: parseFloat(salesTarget),
          }),
          // Create new relationships
          products: {
            create: products.map((p) => ({
              productId: parseInt(p.productId),
              promoPrice: parseFloat(p.promoPrice),
            })),
          },
          vouchers: {
            create: vouchers.map((v) => ({
              voucherId: parseInt(v.voucherId),
            })),
          },
          talkingPoints: {
            create: talkingPoints.map((tp) => ({
              text: tp.text,
              order: parseInt(tp.order),
            })),
          },
        },
        include: {
          host: {
            select: {
              displayName: true,
            },
          },
          products: {
            include: {
              product: true,
            },
          },
          vouchers: {
            include: {
              voucher: true,
            },
          },
          talkingPoints: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      return updated;
    });



    console.log(
      `[Admin Schedule] Updated schedule for hostId ${updatedSchedule.hostId}, SSE notification sent: ${notificationSent}`
    );

    res.json({
      success: true,
      message: "Jadwal berhasil diperbarui",
      data: updatedSchedule,
    });
  } catch (error) {
    console.error("Update schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
}

/**
 * Delete schedule
 * DELETE /api/admin/schedules/:id
 */
async function deleteSchedule(req, res) {
  try {
    const { id } = req.params;

    // Check if schedule exists
    const schedule = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Jadwal tidak ditemukan",
      });
    }

    // Delete schedule (cascading delete will handle relationships)
    await prisma.schedule.delete({
      where: { id },
    });

    console.log(
      `[Admin Schedule] Deleted schedule for hostId ${schedule.hostId}, SSE notification sent: ${notificationSent}`
    );

    res.json({
      success: true,
      message: "Jadwal berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
}

module.exports = {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};
