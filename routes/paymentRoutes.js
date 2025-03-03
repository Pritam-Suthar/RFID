const express = require("express");
const router = express.Router();
const { createOrder } = require("../services/razorpayService");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Route to create an order
router.post("/create-checkout", async (req, res) => {
    try {
        const { amount } = req.body;
        console.log("Received request to create order with amount:", amount);

        const order = await createOrder(amount);
        console.log("Order created:", order);

        res.json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Failed to create order", details: error.message });
    }
});

router.post("/create-order", async (req, res) => {
    try {
        const { amount } = req.body;  // Receive user-inputted amount
        if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

        const order = await createOrder(amount); // Use amount in order creation
        res.json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
});

// Route to verify payment
router.post("/verify-payment", async (req, res) => {
    const { order_id, razorpay_payment_id, razorpay_signature } = req.body;

    try {
        console.log("Received payment verification request:", req.body);

        if (!order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        const body = order_id + "|" + razorpay_payment_id;
        console.log("Concatenated body for signature:", body);

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        console.log("Expected Signature:", expectedSignature);
        console.log("Received Signature:", razorpay_signature);

        if (expectedSignature !== razorpay_signature) {
            console.error("❌ Signature mismatch! Payment verification failed.");
            return res.status(400).json({ error: "Invalid signature" });
        }

        console.log("✅ Payment verified successfully. Updating database...");

        // Update payment status in Supabase
        const { data, error } = await supabase
            .from("payments")
            .update({ payment_id: razorpay_payment_id, status: "Success" })
            .eq("order_id", order_id);

        if (error) {
            console.error("❌ Supabase update failed:", error);
            throw error;
        }

        console.log("✅ Payment updated in database:", data);
        res.json({ success: true, message: "Payment verified" });

    } catch (error) {
        console.error("❌ Error in payment verification:", error);
        res.status(500).json({ error: "Verification failed", details: error.message });
    }
});


module.exports = router;
