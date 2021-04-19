const express = require("express");
const router = express.Router();
const pageController = require("../controolers/pageControoler");
const {guest,isAuthenticated} = require("../middlewares/guestMiddleware");
const adminController = require("../controolers/adminControoler");
// page
// dashboard
router.get("/",adminController.indexPage);
router.get("/dashboard", isAuthenticated, adminController.dashboardPage);
router.get("/product/new", isAuthenticated, pageController.newProductsPage);
router.get("/product/search", isAuthenticated, adminController.searchProductsPage);
router.get("/products/instock", isAuthenticated, adminController.instock);
router.get("/products/outofstock", isAuthenticated, adminController.outOfStock);
router.get("/products/pricechanged", isAuthenticated, adminController.priceChanged);
router.get("/products/backinstock", isAuthenticated, adminController.backinstock);
router.get("/products/updated", isAuthenticated, adminController.updatedProduct);
router.get("/products/notupdated", isAuthenticated, adminController.NotupdatedProduct);
// update
router.get("/update", isAuthenticated, adminController.update);
router.post("/update", isAuthenticated, adminController.Postupdate);
// delete product
router.delete('/delete/product/:id', isAuthenticated, adminController.deleteProduct);
router.get(
  "/fetch/data",
  isAuthenticated,
  adminController.scrapeDataFromWebsite
);
router.post(
  "/save/data",
  isAuthenticated,
  adminController.saveScrapeData
);

module.exports = router;
