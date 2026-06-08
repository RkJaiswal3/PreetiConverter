const express = require('express');
const router = express.Router();
const { convert, getHistory, getStats } = require('../controllers/convertController');

router.post('/convert', convert);
router.get('/history/:session_id', getHistory);
router.get('/stats', getStats);
router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

module.exports = router;