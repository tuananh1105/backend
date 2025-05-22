// routes/shipping.js
const express = require('express');
const router = express.Router();
const { calculateShippingFee } = require("../controllers/shippingFee.js");

router.post('/calculate-shipping', (req, res) => {
    const { weight, address, orderValue } = req.body;
    const shippingFee = calculateShippingFee(weight, address, orderValue);
    res.json({ shippingFee });
});

module.exports = router;
