import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { Car } from '../models/Car';
import { auth, checkRole } from '../middleware/auth';

const router = express.Router();

// Get all users (admin only)
router.get('/users', auth, checkRole(['admin']), async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all cars (admin only)
router.get('/cars', auth, checkRole(['admin']), async (req: Request, res: Response) => {
  try {
    const cars = await Car.find()
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update car (admin only)
router.put(
  '/cars/:carId',
  auth,
  checkRole(['admin']),
  [
    body('brand').optional().notEmpty().withMessage('Brand cannot be empty'),
    body('carModel').optional().notEmpty().withMessage('Model cannot be empty'),
    body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Invalid year'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be positive'),
    body('mileage').optional().isInt({ min: 0 }).withMessage('Mileage must be positive'),
    body('fuelType').optional().isIn(['petrol', 'diesel', 'electric', 'hybrid']).withMessage('Invalid fuel type'),
    body('transmission').optional().isIn(['manual', 'automatic']).withMessage('Invalid transmission'),
    body('status').optional().isIn(['available', 'sold', 'reserved']).withMessage('Invalid status'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const car = await Car.findById(req.params.carId);
      if (!car) {
        return res.status(404).json({ message: 'Car not found' });
      }

      // Update only the fields that are provided
      const updateFields = [
        'brand', 'carModel', 'year', 'price', 'mileage',
        'fuelType', 'transmission', 'description', 'features',
        'images', 'status', 'location'
      ];

      updateFields.forEach(field => {
        if (req.body[field] !== undefined) {
          (car as any)[field] = req.body[field];
        }
      });

      await car.save();
      await car.populate('seller', 'name email');

      res.json(car);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete car (admin only)
router.delete('/cars/:carId', auth, checkRole(['admin']), async (req: Request, res: Response) => {
  try {
    const car = await Car.findById(req.params.carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    await car.deleteOne();
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (admin only)
router.put(
  '/users/:userId',
  auth,
  checkRole(['admin']),
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('role').optional().isIn(['buyer', 'seller', 'admin']).withMessage('Invalid role'),
    body('phone').optional().trim(),
    body('address').optional().trim(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, role, phone, address } = req.body;
      const user = await User.findById(req.params.userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update only the fields that are provided
      if (name !== undefined) user.name = name;
      if (role !== undefined) user.role = role;
      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;

      await user.save();

      // Return updated user without password
      const updatedUser = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        address: user.address,
      };

      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete user (admin only)
router.delete('/users/:userId', auth, checkRole(['admin']), async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 