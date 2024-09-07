import Joi from "joi";

const invoiceSchema = Joi.object({
  sellerDetails: Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().required(),
    panNo: Joi.string().required(),
    gstNo: Joi.string().required(),
  }).required(),
  placeOfSupply: Joi.string().required(),
  billingDetails: Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().required(),
    stateCode: Joi.string().required(),
  }).required(),
  shippingDetails: Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().required(),
    stateCode: Joi.string().required(),
  }).required(),
  placeOfDelivery: Joi.string().required(),
  orderDetails: Joi.object({
    orderNo: Joi.string().required(),
    orderDate: Joi.date().required(),
  }).required(),
  invoiceDetails: Joi.object({
    invoiceNo: Joi.string().required(),
    invoiceDate: Joi.date().required(),
    reverseCharge: Joi.boolean().required(),
  }).required(),
  items: Joi.array()
    .items(
      Joi.object({
        description: Joi.string().required(),
        unitPrice: Joi.number().required(),
        quantity: Joi.number().required(),
        discount: Joi.number().optional().default(0),
        taxRate: Joi.number().required(),
      })
    )
    .required(),
  signature: Joi.string().required(),
}).required();

export function validateInvoiceData(data) {
  const { error } = invoiceSchema.validate(data);
  if (error) {
    throw new Error(error.details[0].message);
  }
}
