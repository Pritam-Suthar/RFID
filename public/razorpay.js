document.getElementById("payNow").addEventListener("click", async function () {
    try {
        const response = await fetch("http://localhost:5000/api/payments/create-checkout", {  
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 4500 })  // Backend should generate order_id
        });

        const data = await response.json();
        console.log("Checkout Data:", data);

        if (!data || !data.id) {
            throw new Error("Invalid Razorpay order response");
        }

        // ✅ Open Razorpay Checkout
        const options = {
            key: "rzp_test_00c36kD21CoCL3", // Razorpay key (not secret!)
            amount: data.amount, // Amount in paise
            currency: "INR",
            name: "Your Company",
            description: "Test Transaction",
            order_id: data.id, // Order ID from backend
            handler: function (response) {
                console.log("Payment Successful:", response);
                
                // ✅ Call backend to verify the payment
                verifyPayment(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
            },
            prefill: {
                name: "Test User",
                email: "test@example.com",
                contact: "9999999999"
            },
            theme: { color: "#3399cc" }
        };

        const rzp1 = new Razorpay(options);
        rzp1.open();
    } catch (error) {
        console.error("Error:", error);
    }
});

// ✅ Function to verify payment after success
async function verifyPayment(order_id, payment_id, signature) {
    try {
        const response = await fetch("http://localhost:5000/api/payments/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_id, payment_id, razorpay_signature: signature })
        });

        const result = await response.json();
        console.log("Payment Verification:", result);
        if (result.success) {
            alert("Payment Verified Successfully!");
        } else {
            alert("Payment Verification Failed!");
        }
    } catch (error) {
        console.error("Verification Error:", error);
    }
}
