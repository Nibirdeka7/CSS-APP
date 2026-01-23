const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// Apply both middlewares to all routes in this file
router.use(protect);
router.use(admin);

// Event Routes
router.post('/events', adminController.createEvent);
router.patch('/events/:id', adminController.updateEvent);

// Team Routes
router.get('/teams/pending', adminController.getPendingTeams);
router.patch('/teams/:id/approve', adminController.approveTeam);

// Match Routes
router.post('/matches', adminController.createMatch);
router.patch('/matches/:id/start', adminController.startMatch);
router.patch('/matches/:id/score', adminController.updateScore);
router.patch('/matches/:id/end', adminController.endMatch);

module.exports = router;