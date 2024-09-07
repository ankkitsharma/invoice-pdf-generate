import express from "express";
// import authController from "../controllers/auth.js";
import invoiceController from "../controllers/invoiceController.js";

const router = express.Router();

// router.get("/getUser", authController.getUser);
router.post("/generateInvoice", invoiceController.generateInvoice);

export default router;
