const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const authMiddleware = require("../middleware/authMiddleware");

// All schedule routes require authentication
router.use(authMiddleware);

// Get all schedules for today
router.get("/", scheduleController.getSchedules);

// Get detailed briefing for a specific schedule
router.get("/:id", scheduleController.getScheduleDetail);

// Acknowledge a schedule
router.post("/:id/acknowledge", scheduleController.acknowledgeSchedule);

module.exports = router;
