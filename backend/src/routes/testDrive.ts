import express from 'express';
import { auth } from '../middleware/auth';
import TestDriveRequest from '../models/TestDriveRequest';
import { Car } from '../models/Car';

const router = express.Router();

// POST /api/test-drives - нова заявка
router.post('/', auth, async (req, res) => {
  try {
    const { car, date, message } = req.body;
    const carDoc = await Car.findById(car);
    if (!carDoc) return res.status(404).json({ message: 'Car not found' });
    const seller = carDoc.seller;
    const buyer = (req as any).user._id;
    const testDrive = await TestDriveRequest.create({
      car,
      buyer,
      seller,
      date,
      message,
      status: 'pending',
    });
    res.status(201).json(testDrive);
  } catch (e) {
    res.status(500).json({ message: 'Failed to create test drive request', error: e });
  }
});

// GET /api/test-drives - заявки за купувача или продавача
router.get('/', auth, async (req, res) => {
  try {
    const userId = (req as any).user._id;
    const role = (req as any).user.role;
    const carId = req.query.car as string | undefined;
    let requests;
    if (carId) {
      // Връща заявка за тази кола и текущия купувач
      requests = await TestDriveRequest.find({ car: carId, buyer: userId })
        .populate('car')
        .populate('buyer', 'name email')
        .populate('seller', 'name email');
      return res.json(requests);
    }
    if (role === 'seller' || role === 'admin') {
      requests = await TestDriveRequest.find({ seller: userId })
        .populate('car')
        .populate('buyer', 'name email')
        .populate('seller', 'name email');
    } else {
      requests = await TestDriveRequest.find({ buyer: userId })
        .populate('car')
        .populate('buyer', 'name email')
        .populate('seller', 'name email');
    }
    res.json(requests);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch test drive requests', error: e });
  }
});

// GET /api/test-drives/:id - детайли
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await TestDriveRequest.findById(req.params.id)
      .populate('car')
      .populate('buyer', 'name email')
      .populate('seller', 'name email');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch test drive request', error: e });
  }
});

// PUT /api/test-drives/:id - одобряване/отказване
router.put('/:id', auth, async (req, res) => {
  try {
    const userId = (req as any).user._id;
    const { status } = req.body;
    const request = await TestDriveRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.seller.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only the seller can approve/reject this request' });
    }
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    request.status = status;
    await request.save();
    res.json(request);
  } catch (e) {
    res.status(500).json({ message: 'Failed to update test drive request', error: e });
  }
});

// DELETE /api/test-drives/:id - отказ от заявка (само купувачът)
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = (req as any).user._id;
    const request = await TestDriveRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.buyer.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only the buyer can cancel this request' });
    }
    await request.deleteOne();
    res.json({ message: 'Request cancelled' });
  } catch (e) {
    res.status(500).json({ message: 'Failed to cancel test drive request', error: e });
  }
});

export default router; 