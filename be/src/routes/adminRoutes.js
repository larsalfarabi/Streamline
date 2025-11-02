const express = require("express");
const router = express.Router();
const adminScheduleController = require("../controllers/adminScheduleController");
const adminMasterDataController = require("../controllers/adminMasterDataController");
const adminMiddleware = require("../middleware/adminMiddleware");

// All admin routes require admin authentication
router.use(adminMiddleware);

// ======================================
// SCHEDULE CRUD ROUTES
// ======================================

// Get all schedules (with filters)
router.get("/schedules", adminScheduleController.getAllSchedules);

// Get schedule by ID (for edit form)
router.get("/schedules/:id", adminScheduleController.getScheduleById);

// Create new schedule
router.post("/schedules", adminScheduleController.createSchedule);

// Update schedule
router.put("/schedules/:id", adminScheduleController.updateSchedule);

// Delete schedule
router.delete("/schedules/:id", adminScheduleController.deleteSchedule);

// ======================================
// MASTER DATA ROUTES (for dropdowns)
// ======================================

// Get all hosts
router.get("/users/hosts", adminMasterDataController.getHosts);

// Get all products (with search)
router.get("/products", adminMasterDataController.getProducts);

// Get all active vouchers
router.get("/vouchers", adminMasterDataController.getVouchers);

module.exports = router;
