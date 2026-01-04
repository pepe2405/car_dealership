/**
 * @swagger
 * tags:
 *   name: Deposits
 *   description: Deposit management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Deposit:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         listingId:
 *           type: string
 *         userId:
 *           type: string
 *         amount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, refunded]
 *         notes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth';
import { Deposit } from '../models/Deposit';
import { Car } from '../models/Car';

const router = express.Router();

/**
 * @swagger
 * /deposits:
 *   post:
 *     summary: Create a new deposit for a car
 *     tags: [Deposits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listingId
 *               - amount
 *             properties:
 *               listingId:
 *                 type: string
 *                 description: Car listing ID
 *               amount:
 *                 type: number
 *                 description: Deposit amount
 *               notes:
 *                 type: string
 *                 description: Optional notes
 *     responses:
 *       201:
 *         description: Deposit created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Car not found
 *       409:
 *         description: Deposit already exists for this user and listing
 */
router.post(
  '/',
  auth,
  [
    body('listingId').isMongoId().withMessage('Valid listing ID is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { listingId, amount, notes } = req.body;
      const userId = (req as any).user._id;

     
      const car = await Car.findById(listingId);
      if (!car) {
        return res.status(404).json({ message: 'Car not found' });
      }

     
      if (car.status !== 'available') {
        return res.status(400).json({ message: 'Car is not available for deposit' });
      }

     
      const existingDeposit = await Deposit.findOne({ listingId, userId });
      if (existingDeposit) {
        return res.status(409).json({ 
          message: 'You already have a deposit for this car',
          deposit: existingDeposit 
        });
      }

     
      const deposit = new Deposit({
        listingId,
        userId,
        amount,
        notes,
      });

      await deposit.save();

     
      await deposit.populate('listingId', 'brand carModel year price');
      await deposit.populate('userId', 'name email');

      res.status(201).json({
        message: 'Deposit created successfully',
        deposit,
      });
    } catch (error) {
      console.error('Error creating deposit:', error);
      res.status(500).json({ message: 'Failed to create deposit', error });
    }
  }
);

/**
 * @swagger
 * /deposits:
 *   get:
 *     summary: Get all deposits for the current user
 *     tags: [Deposits]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's deposits
 */
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const deposits = await Deposit.find({ userId })
      .populate('listingId', 'brand carModel year price images')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(deposits);
  } catch (error) {
    console.error('Error fetching deposits:', error);
    res.status(500).json({ message: 'Failed to fetch deposits', error });
  }
});

/**
 * @swagger
 * /deposits/{listingId}:
 *   get:
 *     summary: Get deposit status for a specific car listing
 *     tags: [Deposits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Car listing ID
 *     responses:
 *       200:
 *         description: Deposit status
 *       404:
 *         description: Deposit not found
 */
router.get('/:listingId', auth, async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const userId = (req as any).user._id;

    const deposit = await Deposit.findOne({ listingId, userId })
      .populate('listingId', 'brand carModel year price images')
      .populate('userId', 'name email');

    if (!deposit) {
      return res.status(404).json({ 
        message: 'No deposit found for this car',
        hasDeposit: false 
      });
    }

    res.json({
      hasDeposit: true,
      deposit,
    });
  } catch (error) {
    console.error('Error fetching deposit status:', error);
    res.status(500).json({ message: 'Failed to fetch deposit status', error });
  }
});

/**
 * @swagger
 * /deposits/admin/all:
 *   get:
 *     summary: Get all deposits (admin only)
 *     tags: [Deposits]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all deposits
 *       403:
 *         description: Access denied
 */
router.get('/admin/all', auth, async (req: Request, res: Response) => {
  try {
   
    const user = (req as any).user;
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const deposits = await Deposit.find()
      .populate('listingId', 'brand carModel year price images')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(deposits);
  } catch (error) {
    console.error('Error fetching all deposits:', error);
    res.status(500).json({ message: 'Failed to fetch deposits', error });
  }
});

/**
 * @swagger
 * /deposits/owner/cars:
 *   get:
 *     summary: Get deposits for cars owned by the current user
 *     tags: [Deposits]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of deposits for user's cars
 */
router.get('/owner/cars', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

   
    const userCars = await Car.find({ seller: userId }).select('_id');
    const carIds = userCars.map(car => car._id);

    if (carIds.length === 0) {
      return res.json([]);
    }

   
    const deposits = await Deposit.find({ listingId: { $in: carIds } })
      .populate('listingId', 'brand carModel year price images')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(deposits);
  } catch (error) {
    console.error('Error fetching owner deposits:', error);
    res.status(500).json({ message: 'Failed to fetch deposits', error });
  }
});

/**
 * @swagger
 * /deposits/{depositId}/approve:
 *   put:
 *     summary: Approve deposit by car owner
 *     tags: [Deposits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: depositId
 *         required: true
 *         schema:
 *           type: string
 *         description: Deposit ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Deposit approved successfully
 *       403:
 *         description: Access denied - not the car owner
 *       404:
 *         description: Deposit not found
 */
router.put('/:depositId/approve', auth, async (req: Request, res: Response) => {
  try {
    const { depositId } = req.params;
    const { notes } = req.body;
    const userId = (req as any).user._id;

    const deposit = await Deposit.findById(depositId)
      .populate('listingId', 'seller brand carModel year price')
      .populate('userId', 'name email');

    if (!deposit) {
      return res.status(404).json({ message: 'Deposit not found' });
    }

   
    const listingId = deposit.listingId as any;
    if (listingId.seller.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied - you are not the owner of this car' });
    }

   
    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Deposit is not pending for approval' });
    }

   
    deposit.status = 'approved';
    if (notes) {
      deposit.notes = notes;
    }

    await deposit.save();

   
    await Car.findByIdAndUpdate(listingId._id, { status: 'reserved' });

    res.json({
      message: 'Deposit approved successfully',
      deposit,
    });
  } catch (error) {
    console.error('Error approving deposit:', error);
    res.status(500).json({ message: 'Failed to approve deposit', error });
  }
});

/**
 * @swagger
 * /deposits/{depositId}/reject:
 *   put:
 *     summary: Reject deposit by car owner
 *     tags: [Deposits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: depositId
 *         required: true
 *         schema:
 *           type: string
 *         description: Deposit ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Deposit rejected successfully
 *       403:
 *         description: Access denied - not the car owner
 *       404:
 *         description: Deposit not found
 */
router.put('/:depositId/reject', auth, async (req: Request, res: Response) => {
  try {
    const { depositId } = req.params;
    const { notes } = req.body;
    const userId = (req as any).user._id;

    const deposit = await Deposit.findById(depositId)
      .populate('listingId', 'seller brand carModel year price')
      .populate('userId', 'name email');

    if (!deposit) {
      return res.status(404).json({ message: 'Deposit not found' });
    }

   
    const listingId = deposit.listingId as any;
    if (listingId.seller.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied - you are not the owner of this car' });
    }

   
    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Deposit is not pending for approval' });
    }

   
    deposit.status = 'rejected';
    if (notes) {
      deposit.notes = notes;
    }

    await deposit.save();

    res.json({
      message: 'Deposit rejected successfully',
      deposit,
    });
  } catch (error) {
    console.error('Error rejecting deposit:', error);
    res.status(500).json({ message: 'Failed to reject deposit', error });
  }
});

/**
 * @swagger
 * /deposits/{depositId}:
 *   put:
 *     summary: Update deposit status (admin only)
 *     tags: [Deposits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: depositId
 *         required: true
 *         schema:
 *           type: string
 *         description: Deposit ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected, refunded]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Deposit updated successfully
 *       404:
 *         description: Deposit not found
 */
router.put('/:depositId', auth, async (req: Request, res: Response) => {
  try {
    const { depositId } = req.params;
    const { status, notes } = req.body;

   
    const user = (req as any).user;
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const deposit = await Deposit.findById(depositId);
    if (!deposit) {
      return res.status(404).json({ message: 'Deposit not found' });
    }

    deposit.status = status;
    if (notes) {
      deposit.notes = notes;
    }

    await deposit.save();

   
    await deposit.populate('listingId', 'brand carModel year price');
    await deposit.populate('userId', 'name email');

    res.json({
      message: 'Deposit updated successfully',
      deposit,
    });
  } catch (error) {
    console.error('Error updating deposit:', error);
    res.status(500).json({ message: 'Failed to update deposit', error });
  }
});

export default router; 