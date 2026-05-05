const express = require('express');
const {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvents,
  getMyAssignments,
  getTodayAssignments,
  getAssignableUsers,
  getAutoAssignmentSuggestions,
  respondToAssignment,
} = require('../controllers/eventController');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, getEvents);
router.get('/my-assignments', verifyToken, getMyAssignments);
router.get('/my-assignments/today', verifyToken, getTodayAssignments);
router.get('/assignable-users', verifyToken, isAdmin, getAssignableUsers);
router.post('/auto-assign', verifyToken, isAdmin, getAutoAssignmentSuggestions);
router.patch('/assignments/:assignmentId/response', verifyToken, respondToAssignment);
router.post('/', verifyToken, isAdmin, createEvent);
router.patch('/:id', verifyToken, isAdmin, updateEvent);
router.delete('/:id', verifyToken, isAdmin, deleteEvent);

module.exports = router;
