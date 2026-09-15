const express = require('express');
const router = express.Router();
const { getAnalytics, getUsers, updateUser, getStaffMembers } = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth, authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.get('/staff', getStaffMembers);

module.exports = router;
