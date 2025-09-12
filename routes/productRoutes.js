// import express from "express";
// import multer from "multer";
// import path from "path";

// import { 
//   getProducts, 
//   addProduct, 
//   updateProduct, 
//   deleteProduct 
// } from "../controllers/productController.js";

// const router = express.Router();


// // ✅ Multer Storage Config
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => cb(null, "uploads/"), // save to /uploads
// //   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// // });
// // const upload = multer({ storage });

// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, "uploads/");
// //   },
// //   filename: (req, file, cb) => {
// //     cb(null, Date.now() + path.extname(file.originalname));
// //   },
// // });

// // const upload = multer({ storage });

// // ================= Routes =================

// // Get all products for a user
// router.get("/:user", getProducts);

// // Add new product (with image upload)
// // router.post("/", upload.single("image"), addProduct);
// // router.post("/", upload.single("image"), addProduct);

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // make sure uploads/ exists
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage });

// // router.post("/", upload.single("image"), addProduct);

// router.post("/", addProduct);


// // Update product (with optional new image)
// router.put("/:id", upload.single("image"), updateProduct);


// // Delete product
// router.delete("/:id", deleteProduct);

// export default router;


import express from "express";

import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  updateStock, 
  setStock,
  lowStockProducts,
  getStockSummary,
  addStock,
  reduceStock,
  updateStocks,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/:user", getProducts);
router.post("/", addProduct);
router.put("/:id", updateProduct);    // Update by ID
router.put("/update/:id", updateStocks);    // Update by ID

router.delete("/:id", deleteProduct); 

router.put("/stock/:id", updateStock);   // increment/decrement
router.put("/stock/set/:id", setStock); // set absolute value
router.get("/stock/low/:user", lowStockProducts);
router.get("/stock-summary/:user", getStockSummary);
router.post("/stock/:id/add", addStock);
router.post("/stock/:id/reduce", reduceStock);

export default router;
