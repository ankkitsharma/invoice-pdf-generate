import express from "express";
import { validateInvoiceData } from "../schema/schema.js";
import easyinvoice from "easyinvoice";
import fs from "fs";
// import { date, number } from "joi";
// import { reverse } from "dns";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const invoiceController = {
  generateInvoice: async (req, res) => {
    try {
      const invoiceData = req.body;

      // Validate and process input data (same as the previous implementation)
      validateInvoiceData(invoiceData);

      // Generate the invoice using EasyInvoice
      const invoicePdf = await generateInvoicePDF(invoiceData);

      // Save the PDF to a file (optional) or send it directly to the client
      fs.writeFileSync("invoice.pdf", invoicePdf, "base64");

      res.setHeader("Content-Type", "application/pdf");
      res.send(invoicePdf);
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
};

export default invoiceController;

async function generateInvoicePDF(invoiceData) {
  // Prepare the EasyInvoice data structure
  const invoiceDetails = {
    apiKey: "free", // Please register to receive a production apiKey: https://app.budgetinvoice.com/register
    mode: "development",
    documentTitle: "INVOICE", // Defaults to INVOICE
    currency: "INR",
    taxNotation: "gst", // "gst" or "vat" or "no"
    marginTop: 25,
    marginRight: 25,
    marginLeft: 25,
    marginBottom: 25,
    logo: "https://public-link-to-logo-image", // Placeholder for the logo
    sender: {
      company: invoiceData.sellerDetails.name,
      address: invoiceData.sellerDetails.address,
      zip: invoiceData.sellerDetails.pincode,
      city: invoiceData.sellerDetails.city,
      country: invoiceData.sellerDetails.state,
      custom1: `PAN: ${invoiceData.sellerDetails.panNo}`,
      custom2: `GST No: ${invoiceData.sellerDetails.gstNo}`,
    },
    client: {
      company: invoiceData.billingDetails.name,
      address: invoiceData.billingDetails.address,
      zip: invoiceData.billingDetails.pincode,
      city: invoiceData.billingDetails.city,
      country: invoiceData.billingDetails.state,
      custom1: `State Code: ${invoiceData.billingDetails.stateCode}`,
    },
    information: {
      number: invoiceData.invoiceDetails.invoiceNo,
      date: invoiceData.invoiceDetails.invoiceDate,
    },
    products: invoiceData.items.map((item) => ({
      quantity: item.quantity,
      description: item.description,
      tax: item.taxRate,
      price: item.unitPrice,
      discount: item.discount,
    })),
    bottomNotice: "Thank you for your purchase!",
    taxType:
      invoiceData.placeOfSupply === invoiceData.placeOfDelivery
        ? "CGST/SGST"
        : "IGST",
    tax: calculateTax(invoiceData), // Tax calculation based on the place of supply
    sign: {
      name: invoiceData.sellerDetails.name,
      signature: invoiceData.signature,
    },
    settings: {
      currency: "INR",
    },
  };

  // Generate the invoice PDF
  const result = await easyinvoice.createInvoice(invoiceDetails, (result) => {
    console.log("PDF base64 string: ", result.pdf);
  });
  return result.pdf;
}

function calculateTax(invoiceData) {
  return invoiceData.items.map((item) => {
    const netAmount = item.unitPrice * item.quantity - item.discount;
    let taxAmount;
    if (invoiceData.placeOfSupply === invoiceData.placeOfDelivery) {
      // Apply CGST + SGST
      taxAmount = netAmount * (item.taxRate / 100);
      return (
        {
          name: "CGST",
          rate: item.taxRate / 2,
          amount: taxAmount / 2,
        },
        {
          name: "SGST",
          rate: item.taxRate / 2,
          amount: taxAmount / 2,
        }
      );
    } else {
      // Apply IGST
      taxAmount = netAmount * (item.taxRate / 100);
      return {
        name: "IGST",
        rate: item.taxRate,
        amount: taxAmount,
      };
    }
  });
}
