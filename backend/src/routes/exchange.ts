import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/rates", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.frankfurter.app/latest?from=EUR&to=GBP,USD"
    );
    res.json(response.data.rates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch exchange rates" });
  }
});

export default router;
