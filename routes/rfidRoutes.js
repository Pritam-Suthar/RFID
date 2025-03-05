const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const router = express.Router();

// Initialize Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// API to check RFID existence
router.post("/check-rfid", async (req, res) => {
    const { rfid } = req.body;

    if (!rfid) {
        return res.status(400).json({ success: false, message: "RFID is required" });
    }

    try {
        const { data, error } = await supabase
            .from("scannedIds") // Change to your actual table name
            .select("rfid") // Select any column to check existence
            .eq("rfid", rfid)
            .maybeSingle(); // Fetch a single match

        if (error) {
            return res.status(500).json({ success: false, message: "Database query error", error });
        }

        if (data) {
            return res.status(200).json({ success: true, message: "RFID found" });
        } else {
            return res.status(404).json({ success: false, message: "RFID not found" });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

// ✅ Export the router
module.exports = router;
