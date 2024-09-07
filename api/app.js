import express from "express";
import cors from "cors";
import invoiceRouter from "../routes/invoiceRoute.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use("/routes", routeName)
app.use("/invoice", invoiceRouter);

app.get("/", (req, res) => {
  res.send("hello world");
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
