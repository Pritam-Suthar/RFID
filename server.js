require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const paymentRoutes = require("./routes/paymentRoutes");
const rfidRoutes = require("./routes/rfidRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Use payment routes
app.use("/api/payments", paymentRoutes);
app.use("/api/rfid", rfidRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
