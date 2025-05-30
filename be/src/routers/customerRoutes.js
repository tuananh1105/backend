const express = require("express");
const { createCustomer, getCustomers, editCustomer, getCustomerById, deleteCustomer, editCustomerAddress } = require("../controllers/customerController");
const router = express.Router();

/**
 * @swagger
 * /create-customer:
 *   post:
 *     tags:
 *      - Address  
 *     summary: Thêm địa chỉ
 *     responses:
 *       201:
 *         description: Thành công
 */
router.post("/create-customer", createCustomer);
/**
 * @swagger
 * /create-customer:
 *   get:
 *     tags:
 *      - Address  
 *     summary: Lấy danh sách địa chỉ theo useId
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/create-customer/:userId", getCustomers);
/**
 * @swagger
 * /edit-customer/:id/:userId:
 *   put:
 *     tags:
 *      - Address  
 *     summary: Update địa chỉ theo useId và id
 *     responses:
 *       201:
 *         description: Thành công
 */
router.put("/edit-customer/:id/:userId", editCustomer);
router.put('/editcustomer/:id/:userId', editCustomerAddress);
/**
 * @swagger
 * /customers/:userId:
 *   get:
 *     tags:
 *      - Address  
 *     summary: Lấy danh sách địa chỉ theo useId 
 *     responses:
 *       201:
 *         description: Thành công
 */
router.get("/customers/:userId", getCustomerById);
/**
 * @swagger
 * /delete-customer/:id:
 *   delete:
 *     tags:
 *      - Address  
 *     summary: Xoá địa chỉ 
 *     responses:
 *       201:
 *         description: Thành công
 */
router.delete("/delete-customer/:id", deleteCustomer); 

module.exports = router;
