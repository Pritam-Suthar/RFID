const Razorpay = require("razorpay");
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Function to create an order
async function createOrder(amount) {
    try {
        console.log("Received amount (INR):", amount);

        const options = {
            amount: amount * 100, // Convert INR to paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1,
        };

        const order = await razorpay.orders.create(options);
        console.log("Order created:", order);

        // Store order in Supabase
        const { data, error } = await supabase
            .from("payments")  // Ensure table name is correct
            .insert([
                {
                    order_id: order.id,
                    amount: order.amount / 100, // Store in INR
                    currency: "INR",
                    status: "created",
                    created_at: new Date(),
                },
            ]);

        if (error) {
            console.error("Error inserting into Supabase:", error);
            throw error;
        }

        console.log("Inserted into Supabase:", data);
        return order;
    } catch (error) {
        console.error("Error in createOrder:", error);
        throw error;
    }
}

module.exports = { createOrder };
