import express from "express";
import LeaseOption from "../models/LeaseOption";
import { auth, checkRole } from "../middleware/auth";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const leaseOptions = await LeaseOption.find({ isActive: true }).sort({
      duration: 1,
    });
    res.json(leaseOptions);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const leaseOption = await LeaseOption.findById(req.params.id);
    if (!leaseOption) {
      return res.status(404).json({ error: "Lease option not found" });
    }
    res.json(leaseOption);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", auth, checkRole(["admin"]), async (req: any, res) => {
  try {
    const { name, duration, downPayment, interestRate } = req.body;

    if (!name || !duration || downPayment === undefined || !interestRate) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (duration < 1 || duration > 60) {
      return res
        .status(400)
        .json({ error: "Duration must be between 1 and 60 months" });
    }

    if (downPayment < 0 || downPayment > 100) {
      return res
        .status(400)
        .json({ error: "Down payment must be between 0 and 100%" });
    }

    if (interestRate < 0 || interestRate > 100) {
      return res
        .status(400)
        .json({ error: "Interest rate must be between 0 and 100%" });
    }

    const existingOption = await LeaseOption.findOne({ name });
    if (existingOption) {
      return res
        .status(400)
        .json({ error: "Lease option with this name already exists" });
    }

    const leaseOption = new LeaseOption({
      name,
      duration,
      downPayment,
      interestRate,
    });

    await leaseOption.save();
    res.status(201).json(leaseOption);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", auth, checkRole(["admin"]), async (req: any, res) => {
  try {
    const { name, duration, downPayment, interestRate, isActive } = req.body;

    const leaseOption = await LeaseOption.findById(req.params.id);
    if (!leaseOption) {
      return res.status(404).json({ error: "Lease option not found" });
    }

    if (duration && (duration < 1 || duration > 60)) {
      return res
        .status(400)
        .json({ error: "Duration must be between 1 and 60 months" });
    }

    if (downPayment !== undefined && (downPayment < 0 || downPayment > 100)) {
      return res
        .status(400)
        .json({ error: "Down payment must be between 0 and 100%" });
    }

    if (
      interestRate !== undefined &&
      (interestRate < 0 || interestRate > 100)
    ) {
      return res
        .status(400)
        .json({ error: "Interest rate must be between 0 and 100%" });
    }

    if (name && name !== leaseOption.name) {
      const existingOption = await LeaseOption.findOne({ name });
      if (existingOption) {
        return res
          .status(400)
          .json({ error: "Lease option with this name already exists" });
      }
    }

    if (name) leaseOption.name = name;
    if (duration) leaseOption.duration = duration;
    if (downPayment !== undefined) leaseOption.downPayment = downPayment;
    if (interestRate !== undefined) leaseOption.interestRate = interestRate;
    if (isActive !== undefined) leaseOption.isActive = isActive;

    await leaseOption.save();
    res.json(leaseOption);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", auth, checkRole(["admin"]), async (req: any, res) => {
  try {
    const leaseOption = await LeaseOption.findById(req.params.id);
    if (!leaseOption) {
      return res.status(404).json({ error: "Lease option not found" });
    }

    await leaseOption.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
