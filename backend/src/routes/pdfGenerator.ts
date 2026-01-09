import express from "express";
import axios from "axios";
import fs from "fs";

const router = express.Router();

router.post("/generate-document", async (req, res) => {
  try {
    const pdfResponse = await axios.post(
      "http://localhost:8001/generate-car-document",
      {
        buyer_name: req.body.buyerName,  
        seller_name: req.body.sellerName,
        car_model: req.body.carModel,
        car_year: req.body.carYear,
        car_price: req.body.carPrice
      },
      { responseType: "arraybuffer" }
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=car_document.pdf"
    });

    res.send(pdfResponse.data);

  } catch (err) {
    res.status(500).json({ error: "PDF generation failed" });
  }
});

export default router;
