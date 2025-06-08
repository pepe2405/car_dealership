import express from 'express';

const router = express.Router();

/**
 * @swagger
 * /test/ping:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Pong with timestamp
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

export default router; 