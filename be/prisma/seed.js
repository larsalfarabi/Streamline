const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data (in reverse order of dependencies)
  await prisma.talkingPoint.deleteMany();
  await prisma.scheduleVoucher.deleteMany();
  await prisma.scheduleProduct.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Cleared existing data");

  // ======================================
  // 1. Create Users (Hosts & Admin)
  // ======================================
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Hosts
  const siti = await prisma.user.create({
    data: {
      username: "siti",
      password: hashedPassword,
      displayName: "Siti Nurhaliza",
      role: "HOST",
    },
  });

  const rina = await prisma.user.create({
    data: {
      username: "rina",
      password: hashedPassword,
      displayName: "Rina Wati",
      role: "HOST",
    },
  });

  // Admin
  const admin = await prisma.user.create({
    data: {
      username: "admin",
      password: hashedPassword,
      displayName: "Admin Streamline",
      role: "ADMIN",
    },
  });

  console.log("✅ Created users (2 hosts + 1 admin)");

  // ======================================
  // 2. Create Products
  // ======================================
  const products = await Promise.all([
    prisma.product.create({
      data: {
        sku: "GROGLO-SERUM-001",
        name: "Groglo Whitening Serum 30ml",
        defaultPrice: 199000,
      },
    }),
    prisma.product.create({
      data: {
        sku: "GROGLO-CREAM-001",
        name: "Groglo Night Cream 50ml",
        defaultPrice: 149000,
      },
    }),
    prisma.product.create({
      data: {
        sku: "GROGLO-TONER-001",
        name: "Groglo Rose Toner 100ml",
        defaultPrice: 89000,
      },
    }),
    prisma.product.create({
      data: {
        sku: "TKIS-PILLOW-001",
        name: "TKIS Memory Foam Pillow",
        defaultPrice: 299000,
      },
    }),
    prisma.product.create({
      data: {
        sku: "TKIS-BEDSHEET-001",
        name: "TKIS Premium Bedsheet Set",
        defaultPrice: 599000,
      },
    }),
  ]);

  console.log("✅ Created products");

  // ======================================
  // 3. Create Vouchers
  // ======================================
  const vouchers = await Promise.all([
    prisma.voucher.create({
      data: {
        code: "GGMG1111",
        description: "Diskon 11% untuk semua produk Groglo",
        isActive: true,
      },
    }),
    prisma.voucher.create({
      data: {
        code: "FLASHSALE50",
        description: "Gratis ongkir min. belanja Rp 50.000",
        isActive: true,
      },
    }),
    prisma.voucher.create({
      data: {
        code: "NEWUSER20",
        description: "Diskon Rp 20.000 untuk pengguna baru",
        isActive: true,
      },
    }),
    prisma.voucher.create({
      data: {
        code: "CASHBACK100",
        description: "Cashback Rp 100.000 min. belanja Rp 500.000",
        isActive: true,
      },
    }),
  ]);

  console.log("✅ Created vouchers");

  // ======================================
  // 4. Create Schedules
  // ======================================

  // Get today's date at 10:00 AM
  const today = new Date();
  today.setHours(10, 0, 0, 0);

  // Schedule 1: Siti - Morning (10:00 - 12:00)
  const schedule1 = await prisma.schedule.create({
    data: {
      hostId: siti.id,
      title: "Flash Sale Groglo 11.11! 🔥",
      platform: "SHOPEE_LIVE",
      storeName: "GROGLO_BEAUTY",
      scheduledAt: new Date(today.getTime()), // 10:00 AM
      salesTarget: 5000000, // Rp 5 juta
    },
  });

  // Schedule 2: Siti - Afternoon (14:00 - 16:00)
  const schedule2 = await prisma.schedule.create({
    data: {
      hostId: siti.id,
      title: "Spesial Skincare Routine TKIS",
      platform: "TIKTOK_LIVE",
      storeName: "TKIS_HOME_LIVING",
      scheduledAt: new Date(today.getTime() + 4 * 60 * 60 * 1000), // 14:00 PM
      salesTarget: 3000000, // Rp 3 juta
    },
  });

  // Schedule 3: Rina - Evening (18:00 - 20:00)
  const schedule3 = await prisma.schedule.create({
    data: {
      hostId: rina.id,
      title: "Bedtime Beauty Sale 🌙",
      platform: "SHOPEE_LIVE",
      storeName: "GROGLO_BEAUTY",
      scheduledAt: new Date(today.getTime() + 8 * 60 * 60 * 1000), // 18:00 PM
      salesTarget: 7000000, // Rp 7 juta
      acknowledgedAt: new Date(), // Already acknowledged
    },
  });

  console.log("✅ Created schedules");

  // ======================================
  // 5. Add Products to Schedules
  // ======================================

  // Schedule 1 Products (Groglo Beauty)
  await prisma.scheduleProduct.createMany({
    data: [
      {
        scheduleId: schedule1.id,
        productId: products[0].id, // Groglo Serum
        promoPrice: 99000, // 50% off!
      },
      {
        scheduleId: schedule1.id,
        productId: products[1].id, // Groglo Cream
        promoPrice: 99000,
      },
      {
        scheduleId: schedule1.id,
        productId: products[2].id, // Groglo Toner
        promoPrice: 49000,
      },
    ],
  });

  // Schedule 2 Products (TKIS Home)
  await prisma.scheduleProduct.createMany({
    data: [
      {
        scheduleId: schedule2.id,
        productId: products[3].id, // Memory Foam Pillow
        promoPrice: 199000,
      },
      {
        scheduleId: schedule2.id,
        productId: products[4].id, // Bedsheet Set
        promoPrice: 399000,
      },
    ],
  });

  // Schedule 3 Products (Groglo Beauty)
  await prisma.scheduleProduct.createMany({
    data: [
      {
        scheduleId: schedule3.id,
        productId: products[0].id, // Groglo Serum
        promoPrice: 149000,
      },
      {
        scheduleId: schedule3.id,
        productId: products[1].id, // Groglo Cream
        promoPrice: 119000,
      },
    ],
  });

  console.log("✅ Added products to schedules");

  // ======================================
  // 6. Add Vouchers to Schedules
  // ======================================

  await prisma.scheduleVoucher.createMany({
    data: [
      { scheduleId: schedule1.id, voucherId: vouchers[0].id }, // GGMG1111
      { scheduleId: schedule1.id, voucherId: vouchers[1].id }, // FLASHSALE50
      { scheduleId: schedule2.id, voucherId: vouchers[1].id }, // FLASHSALE50
      { scheduleId: schedule2.id, voucherId: vouchers[3].id }, // CASHBACK100
      { scheduleId: schedule3.id, voucherId: vouchers[0].id }, // GGMG1111
      { scheduleId: schedule3.id, voucherId: vouchers[2].id }, // NEWUSER20
    ],
  });

  console.log("✅ Added vouchers to schedules");

  // ======================================
  // 7. Add Talking Points to Schedules
  // ======================================

  await prisma.talkingPoint.createMany({
    data: [
      // Schedule 1 Talking Points
      {
        scheduleId: schedule1.id,
        text: "Highlight: Serum Groglo adalah produk #1 Best Seller bulan ini! 🏆",
        order: 1,
      },
      {
        scheduleId: schedule1.id,
        text: "Promo: Beli 2 GRATIS 1 Night Cream untuk 100 pembeli pertama!",
        order: 2,
      },
      {
        scheduleId: schedule1.id,
        text: 'Testimoni: "Kulitku jadi glowing dalam 7 hari!" - @beauty_lover99',
        order: 3,
      },
      {
        scheduleId: schedule1.id,
        text: "Call-to-Action: Jangan lupa gunakan voucher GGMG1111 untuk diskon ekstra!",
        order: 4,
      },

      // Schedule 2 Talking Points
      {
        scheduleId: schedule2.id,
        text: "Memory Foam Pillow ini cocok untuk penderita sakit leher dan punggung",
        order: 1,
      },
      {
        scheduleId: schedule2.id,
        text: "Bedsheet premium dengan material 100% katun Mesir",
        order: 2,
      },
      {
        scheduleId: schedule2.id,
        text: "Gratis ongkir untuk pembelian hari ini!",
        order: 3,
      },

      // Schedule 3 Talking Points
      {
        scheduleId: schedule3.id,
        text: "Night Routine Special: Paket Serum + Night Cream untuk kulit glowing!",
        order: 1,
      },
      {
        scheduleId: schedule3.id,
        text: "Target: 100 transaksi sebelum jam 21:00 untuk unlock bonus mystery gift!",
        order: 2,
      },
      {
        scheduleId: schedule3.id,
        text: "Reminder: Tanyakan viewers tentang skincare concern mereka",
        order: 3,
      },
    ],
  });

  console.log("✅ Added talking points to schedules");

  console.log("\n🎉 Seed completed successfully!\n");
  console.log("📊 Summary:");
  console.log(`   - Users: 3 (2 hosts + 1 admin)`);
  console.log(`   - Products: 5`);
  console.log(`   - Vouchers: 4`);
  console.log(`   - Schedules: 3`);
  console.log(`\n🔐 Login credentials:`);
  console.log(`   Host: siti | Password: password123`);
  console.log(`   Host: rina | Password: password123`);
  console.log(`   Admin: admin | Password: password123`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
