const express = require("express");
const {
    getSizes,
    addSize,
    deleteSize,
    getSizeById,
    editSize,
  } = require("../controllers/size");

const router = express.Router();

router.get(`/sizes`, getSizes);
router.post(`/sizes`, addSize);
router.delete(`/sizes/:id`, deleteSize);
router.get(`/size/:id`, getSizeById);
router.put(`/sizes/:id`, editSize);

module.exports = router;
