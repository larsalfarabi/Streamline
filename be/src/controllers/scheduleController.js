const prisma = require("../config/prisma");

/**
 * Get all schedules for the logged-in user for today
 * GET /api/schedules
 */
async function getSchedules(req, res) {
  try {
    const userId = req.user.userId;

    // Get start of today (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch schedules from today onwards (not just today, but future schedules too)
    const schedules = await prisma.schedule.findMany({
      where: {
        hostId: userId,
        scheduledAt: {
          gte: today, // From today onwards
        },
      },
      orderBy: {
        scheduledAt: "asc", // Chronological order
      },
      select: {
        id: true,
        title: true,
        platform: true,
        storeName: true,
        scheduledAt: true,
        salesTarget: true,
        acknowledgedAt: true,
      },
    });

    res.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error("Get schedules error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
}

/**
 * Get detailed briefing for a specific schedule
 * GET /api/schedules/:id
 */
async function getScheduleDetail(req, res) {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Fetch schedule with all related data
    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
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

    // Check if schedule exists
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Jadwal tidak ditemukan",
      });
    }

    // Check if schedule belongs to the user
    if (schedule.hostId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke jadwal ini",
      });
    }

    // Format the response
    const briefing = {
      id: schedule.id,
      title: schedule.title,
      platform: schedule.platform,
      storeName: schedule.storeName,
      scheduledAt: schedule.scheduledAt,
      salesTarget: schedule.salesTarget,
      acknowledgedAt: schedule.acknowledgedAt,
      products: schedule.products.map((sp) => ({
        id: sp.product.id,
        sku: sp.product.sku,
        name: sp.product.name,
        defaultPrice: sp.product.defaultPrice,
        promoPrice: sp.promoPrice,
      })),
      vouchers: schedule.vouchers.map((sv) => ({
        id: sv.voucher.id,
        code: sv.voucher.code,
        description: sv.voucher.description,
        isActive: sv.voucher.isActive,
      })),
      talkingPoints: schedule.talkingPoints.map((tp) => ({
        id: tp.id,
        text: tp.text,
        order: tp.order,
      })),
    };

    res.json({
      success: true,
      data: briefing,
    });
  } catch (error) {
    console.error("Get schedule detail error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
}

/**
 * Acknowledge a schedule (mark as read)
 * POST /api/schedules/:id/acknowledge
 */
async function acknowledgeSchedule(req, res) {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Find the schedule
    const schedule = await prisma.schedule.findUnique({
      where: { id },
    });

    // Check if schedule exists
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Jadwal tidak ditemukan",
      });
    }

    // Check if schedule belongs to the user
    if (schedule.hostId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke jadwal ini",
      });
    }

    // Check if already acknowledged
    if (schedule.acknowledgedAt) {
      return res.status(400).json({
        success: false,
        message: "Jadwal sudah dikonfirmasi sebelumnya",
        data: {
          acknowledgedAt: schedule.acknowledgedAt,
        },
      });
    }

    // Update schedule with acknowledgment timestamp
    const updatedSchedule = await prisma.schedule.update({
      where: { id },
      data: {
        acknowledgedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: "Jadwal berhasil dikonfirmasi",
      data: {
        id: updatedSchedule.id,
        acknowledgedAt: updatedSchedule.acknowledgedAt,
      },
    });
  } catch (error) {
    console.error("Acknowledge schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
}

module.exports = {
  getSchedules,
  getScheduleDetail,
  acknowledgeSchedule,
};
