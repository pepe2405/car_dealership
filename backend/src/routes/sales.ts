import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Sale from '../models/Sale';
import Invoice from '../models/Invoice';
import { auth } from '../middleware/auth';
import { Car } from '../models/Car';
import { User } from '../models/User';

const router = express.Router();

/**
 * @swagger
 * /sales:
 *   post:
 *     summary: Create a new sale (full purchase or leasing)
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - carId
 *               - buyerId
 *               - saleType
 *               - totalAmount
 *             properties:
 *               carId:
 *                 type: string
 *                 description: Car ID
 *               buyerId:
 *                 type: string
 *                 description: Buyer ID
 *               saleType:
 *                 type: string
 *                 enum: [full, leasing]
 *                 description: Type of sale
 *               totalAmount:
 *                 type: number
 *                 description: Total sale amount
 *               downPayment:
 *                 type: number
 *                 description: Down payment amount (for leasing)
 *               monthlyPayment:
 *                 type: number
 *                 description: Monthly payment amount (for leasing)
 *               leaseTerm:
 *                 type: number
 *                 description: Lease term in months
 *               interestRate:
 *                 type: number
 *                 description: Interest rate percentage
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       201:
 *         description: Sale created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Car or buyer not found
 */
router.post('/', auth, [
  body('carId').isMongoId().withMessage('Valid car ID is required'),
  body('buyerId').isMongoId().withMessage('Valid buyer ID is required'),
  body('saleType').isIn(['full', 'leasing']).withMessage('Sale type must be full or leasing'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('downPayment').optional().isFloat({ min: 0 }).withMessage('Down payment must be a positive number'),
  body('monthlyPayment').optional().isFloat({ min: 0 }).withMessage('Monthly payment must be a positive number'),
  body('leaseTerm').optional().isInt({ min: 1, max: 120 }).withMessage('Lease term must be between 1 and 120 months'),
  body('interestRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Interest rate must be between 0 and 100'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters'),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = (req as any).user;
    const {
      carId,
      buyerId,
      saleType,
      totalAmount,
      downPayment,
      monthlyPayment,
      leaseTerm,
      interestRate,
      notes,
    } = req.body;

   
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (car.status !== 'available' && car.status !== 'reserved') {
      return res.status(400).json({ message: 'Car is not available for sale' });
    }

   
    const buyer = await User.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({ message: 'Buyer not found' });
    }

   
    if (saleType === 'leasing') {
      if (!downPayment || !monthlyPayment || !leaseTerm) {
        return res.status(400).json({ 
          message: 'Down payment, monthly payment, and lease term are required for leasing' 
        });
      }
    }

   
    const sale = new Sale({
      carId,
      buyerId,
      sellerId: user._id,
      saleType,
      totalAmount,
      downPayment,
      monthlyPayment,
      leaseTerm,
      interestRate,
      notes,
    });

    await sale.save();

   
    await Car.findByIdAndUpdate(carId, { status: 'sold' });

   
    await sale.populate([
      { path: 'carId', select: 'brand carModel year price images' },
      { path: 'buyerId', select: 'name email' },
      { path: 'sellerId', select: 'name email' },
    ]);

    res.status(201).json({
      message: 'Sale created successfully',
      sale,
    });
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ message: 'Failed to create sale', error });
  }
});

/**
 * @swagger
 * /sales:
 *   get:
 *     summary: Get all sales (admin/seller only)
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sales
 *       403:
 *         description: Access denied
 */
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
   
    if (user.role !== 'admin' && user.role !== 'seller') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const sales = await Sale.find()
      .populate('carId', 'brand carModel year price images')
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Failed to fetch sales', error });
  }
});

/**
 * @swagger
 * /sales/{saleId}/invoice:
 *   post:
 *     summary: Generate invoice for a sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: saleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     responses:
 *       201:
 *         description: Invoice generated successfully
 *       404:
 *         description: Sale not found
 */
router.post('/:saleId/invoice', auth, [
  body('buyerInfo.name').notEmpty().withMessage('Buyer name is required'),
  body('buyerInfo.email').isEmail().withMessage('Valid buyer email is required'),
  body('sellerInfo.name').notEmpty().withMessage('Seller name is required'),
  body('sellerInfo.email').isEmail().withMessage('Valid seller email is required'),
  body('carInfo.brand').notEmpty().withMessage('Car brand is required'),
  body('carInfo.model').notEmpty().withMessage('Car model is required'),
  body('carInfo.year').isInt({ min: 1900 }).withMessage('Valid car year is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.description').notEmpty().withMessage('Item description is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Item quantity must be at least 1'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Item unit price must be positive'),
  body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be positive'),
  body('tax').isFloat({ min: 0 }).withMessage('Tax must be positive'),
  body('total').isFloat({ min: 0 }).withMessage('Total must be positive'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters'),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = (req as any).user;
    const { saleId } = req.params;

   
    const sale = await Sale.findById(saleId)
      .populate('carId', 'brand carModel year price')
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

   
    if (sale.sellerId.toString() !== user._id.toString() && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

   
    const existingInvoice = await Invoice.findOne({ saleId });
    if (existingInvoice) {
      return res.status(400).json({ message: 'Invoice already exists for this sale' });
    }

    const {
      buyerInfo,
      sellerInfo,
      carInfo,
      items,
      subtotal,
      tax,
      total,
      paymentTerms,
      dueDate,
      notes,
    } = req.body;

   
    const invoice = new Invoice({
      saleId,
      buyerInfo,
      sellerInfo,
      carInfo,
      items,
      subtotal,
      tax,
      total,
      paymentTerms: paymentTerms || 'Net 30',
      dueDate,
      notes,
    });

    await invoice.save();

    res.status(201).json({
      message: 'Invoice generated successfully',
      invoice,
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: 'Failed to generate invoice', error });
  }
});

/**
 * @swagger
 * /sales/{saleId}/invoice:
 *   get:
 *     summary: Get invoice for a sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: saleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Invoice details
 *       404:
 *         description: Sale or invoice not found
 */
router.get('/:saleId/invoice', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { saleId } = req.params;

   
    const sale = await Sale.findById(saleId)
      .populate('carId', 'brand carModel year price')
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

   
    const isSeller = sale.sellerId.toString() === user._id.toString();
    const isBuyer = sale.buyerId.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isSeller && !isBuyer && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

   
    const invoice = await Invoice.findOne({ saleId });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({
      sale,
      invoice,
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: 'Failed to fetch invoice', error });
  }
});

export default router;
