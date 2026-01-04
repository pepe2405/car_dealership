/**
 * @swagger
 * tags:
 *   name: Cars
 *   description: Car management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Car:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         brand:
 *           type: string
 *         carModel:
 *           type: string
 *         year:
 *           type: integer
 *         price:
 *           type: number
 *         mileage:
 *           type: number
 *         fuelType:
 *           type: string
 *           enum: [petrol, diesel, electric, hybrid]
 *         transmission:
 *           type: string
 *           enum: [manual, automatic]
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         description:
 *           type: string
 *         features:
 *           type: array
 *           items:
 *             type: string
 *         seller:
 *           type: string
 *         status:
 *           type: string
 *           enum: [available, sold, reserved]
 *         location:
 *           type: object
 *           properties:
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             country:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { auth } from "../middleware/auth";
import { Car } from "../models/Car";
import { Deposit } from "../models/Deposit";

const router = express.Router();

/**
 * @swagger
 * /cars:
 *   get:
 *     summary: Get available cars (for unauthenticated users)
 *     tags: [Cars]
 *     responses:
 *       200:
 *         description: List of available cars
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const cars = await Car.find().populate("seller", "name email");

    const availableCars = cars.filter((car) => car.status === "available");
    res.json(availableCars);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cars", error });
  }
});

/**
 * @swagger
 * /cars/authenticated:
 *   get:
 *     summary: Get available cars for authenticated users
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available cars
 */
router.get("/authenticated", auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const cars = await Car.find().populate("seller", "name email");

    if (user.role === "admin" || user.role === "seller") {
      return res.json(cars);
    }

    if (user.role === "buyer") {
      const userDeposits = await Deposit.find({
        buyerId: user._id,
        status: { $in: ["pending", "approved"] },
      });
      const carsWithUserDeposits = new Set(
        userDeposits.map((deposit) => deposit.listingId.toString()),
      );

      const availableCars = cars.filter(
        (car) =>
          car.status === "available" &&
          !carsWithUserDeposits.has((car as any)._id.toString()),
      );

      return res.json(availableCars);
    }

    const availableCars = cars.filter((car) => car.status === "available");
    res.json(availableCars);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cars", error });
  }
});

/**
 * @swagger
 * /cars/all:
 *   get:
 *     summary: Get all cars including those with deposits (admin/seller only)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all cars
 *       403:
 *         description: Access denied
 */
router.get("/all", auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user.role !== "admin" && user.role !== "seller") {
      return res.status(403).json({ message: "Access denied" });
    }

    const cars = await Car.find().populate("seller", "name email");
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cars", error });
  }
});

/**
 * @swagger
 * /cars/mine:
 *   get:
 *     summary: Get cars listed by the current user
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's cars
 */
router.get("/mine", auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const cars = await Car.find({ seller: userId }).populate(
      "seller",
      "name email",
    );
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your cars", error });
  }
});

/**
 * @swagger
 * /cars/{id}:
 *   get:
 *     summary: Get car details by ID
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Car ID
 *     responses:
 *       200:
 *         description: Car details
 *       404:
 *         description: Car not found
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const car = await Car.findById(req.params.id).populate(
      "seller",
      "name email",
    );
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch car", error });
  }
});

/**
 * @swagger
 * /cars:
 *   post:
 *     summary: Create a new car
 *     tags: [Cars]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       201:
 *         description: Car created
 */
router.post(
  "/",
  auth,
  [
    body("brand").notEmpty().withMessage("Brand is required"),
    body("carModel").notEmpty().withMessage("Model is required"),
    body("year")
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Year is invalid"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("mileage")
      .isFloat({ min: 0 })
      .withMessage("Mileage must be a positive number"),
    body("fuelType")
      .isIn(["petrol", "diesel", "electric", "hybrid"])
      .withMessage("Invalid fuel type"),
    body("transmission")
      .isIn(["manual", "automatic"])
      .withMessage("Invalid transmission"),
    body("images")
      .isArray({ min: 1 })
      .withMessage("At least one image is required"),
    body("description").notEmpty().withMessage("Description is required"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const {
        brand,
        carModel,
        year,
        price,
        mileage,
        fuelType,
        transmission,
        images,
        description,
        features,
        location,
      } = req.body;
      const car = new Car({
        brand,
        carModel,
        year,
        price,
        mileage,
        fuelType,
        transmission,
        images,
        description,
        features: features || [],
        location,
        seller: (req as any).user._id,
      });
      await car.save();
      res.status(201).json(car);
    } catch (error) {
      res.status(500).json({ message: "Failed to add car", error });
    }
  },
);

/**
 * @swagger
 * /cars/{id}:
 *   put:
 *     summary: Update a car by ID
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Car ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       200:
 *         description: Car updated
 *       404:
 *         description: Car not found
 *       403:
 *         description: Not authorized
 */
router.put(
  "/:id",
  auth,
  [
    body("brand").optional().notEmpty().withMessage("Brand is required"),
    body("carModel").optional().notEmpty().withMessage("Model is required"),
    body("year")
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Year is invalid"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("mileage")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Mileage must be a positive number"),
    body("fuelType")
      .optional()
      .isIn(["petrol", "diesel", "electric", "hybrid"])
      .withMessage("Invalid fuel type"),
    body("transmission")
      .optional()
      .isIn(["manual", "automatic"])
      .withMessage("Invalid transmission"),
    body("images")
      .optional()
      .isArray({ min: 1 })
      .withMessage("At least one image is required"),
    body("description")
      .optional()
      .notEmpty()
      .withMessage("Description is required"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const car = await Car.findById(req.params.id);
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      if (car.seller.toString() !== (req as any).user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this car" });
      }
      Object.assign(car, req.body);
      await car.save();
      res.json(car);
    } catch (error) {
      res.status(500).json({ message: "Failed to update car", error });
    }
  },
);

/**
 * @swagger
 * /cars/{id}:
 *   delete:
 *     summary: Delete a car by ID
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Car ID
 *     responses:
 *       204:
 *         description: Car deleted
 *       404:
 *         description: Car not found
 *       403:
 *         description: Not authorized
 */
router.delete("/:id", auth, async (req: Request, res: Response) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    if (car.seller.toString() !== (req as any).user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this car" });
    }
    await car.deleteOne();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete car", error });
  }
});

export default router;
