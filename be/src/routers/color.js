const express = require("express");
const {
    getColors,
    addColor,
    deleteColor,
    editColor,
    getColorById,
  } = require("../controllers/color");

const router = express.Router();

router.get(`/colors`, getColors);
router.post(`/colors`, addColor);
router.delete(`/colors/:id`, deleteColor);
router.put(`/colors/:id`, editColor);
router.get(`/color/:id`, getColorById);

module.exports = router;
