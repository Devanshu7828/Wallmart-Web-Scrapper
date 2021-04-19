const pupperter = require("puppeteer");
const cheerio = require("cheerio");
const Poducts = require("../models/productModel");
const { load } = require("cheerio");

let browser;
async function scrapeData(url, page) {
  try {
    await page.goto(url, { waitUntil: "load", timeout: 0 });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    let title = $("h1").attr("content");
    let price = $(".price-characteristic").attr("content");
    if (!price) {
      let dollars = $(
        "#price > div > span.hide-content.display-inline-block-m > span > span.price-group.price-out-of-stock > span.price-characteristic"
      ).text();
      let cents = $(
        "#price > div > span.hide-content.display-inline-block-m > span > span.price-group > span.price-mantissa"
      ).text();
      price = dollars + "." + cents;
    }
    let seller = "";
    let checkSeller = $(".seller-name");
    if (checkSeller) {
      seller = checkSeller.text();
    }
    let outOfStock = "";
    let checkOutOfStock = $(
      "#product-overview > div > div:nth-child(3) > div > div:nth-child(5) > div:nth-child(1) > section > div.prod-ShippingOffer.prod-PositionedRelative.Grid.prod-PriceHero.prod-PriceHero-buy-box-update.prod-ProductOffer-enhanced > div:nth-child(2) > div > div > div"
    );
    if (checkOutOfStock) {
      outOfStock = checkOutOfStock.text();
    }

    let deleverNotAvailable = "";
    let checkDeleverNotAvailable = $(
      "#add-on-atc-container > div.fulfillment-buy-box-update > div:nth-child(1) > span > div > div > div.fulfillment-shipping-text"
    );
    if (checkDeleverNotAvailable) {
      deleverNotAvailable = checkDeleverNotAvailable.text();
    }

    let stock = "";
    if (
      !seller.includes("Walmart") ||
      outOfStock.includes("Out of Stock") ||
      deleverNotAvailable.includes("Delivery not available")
    ) {
      stock = "Out of stock";
    } else {
      stock = "In Stock";
    }

    return {
      title,
      price,
      stock,
      url,
    };
  } catch (error) {
    console.log(error);
  }
}

const scrapeDataFromWebsite = async (req, res, next) => {
  try {
    const url = req.query.search;
    if (url) {
      browser = await pupperter.launch({ headless: false });
      // browser = await pupperter.launch({ args: ['--no-sandbox'] });
      const page = await browser.newPage();
      let result = await scrapeData(url, page);
      let productData = {
        title: result.title,
        price: "$" + result.price,
        stock: result.stock,
        url: result.url,
      };
      res.render("admin/newproduct", { prdoduct: productData });
      browser.close();
    } else {
      let productData = {
        title: "",
        product: "",
        stock: "",
        productUrl: "",
      };
      res.render("admin/newproduct", { prdoduct: productData });
    }
  } catch (error) {
    req.flash("error", "ERROR" + error);
    return res.redirect("/product/new");
  }
};

const saveScrapeData = async (req, res, next) => {
  const { title, price, stock, url, sku } = req.body;

  const newProduct = await new Poducts({
    title,
    newPrice: price,
    oldPrice: price,
    newStock: stock,
    oldStock: stock,
    sku,
    company: "Walmart",
    url,
    updateStatus: "Updated",
  });

  const ifProduct = await Poducts.findOne({ sku: sku });
  if (ifProduct) {
    req.flash("error", "Product already exist in the database");
    return res.redirect("/product/new");
  }

  // the save to database
  await newProduct.save();
  req.flash("success", "Product added to database successfully");
  res.redirect("/product/new");
};

const searchProductsPage = async (req, res) => {
  try {
    const sku = req.query.sku;
    // check sku present in database
    const product = await Poducts.findOne({ sku: sku });
    if (!product) {
      req.flash("error", "No product found with this sku");
      return res.render("admin/search", { prdoduct: "" });
    }

    return res.render("admin/search", { prdoduct: product });
  } catch (error) {
    req.flash("error", "ERROR" + error);
    res.render("admin/search", { prdoduct: "" });
  }
};

const instock = async (req, res) => {
  try {
    const products = await Poducts.find({ newStock: "In Stock " });
    console.log(products);
    if (!products) {
      req.flash("error", "No products");
      return res.render("admin/instock", { prdoduct: "" });
    }
    return res.render("admin/instock", { prdoduct: products });
  } catch (error) {
    req.flash("error", "ERROR" + error);
    res.render("admin/instock", { prdoduct: "" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Poducts.deleteOne({ _id: id });
    req.flash("success", "Product Deleted Successfully");
    res.redirect("/");
  } catch (error) {
    console.log(error);
    req.flash("error", "ERROR" + error);
    res.render("admin/instock", { prdoduct: "" });
  }
};

const outOfStock = async (req, res) => {
  try {
    const products = await Poducts.find({ newStock: "Out of stock " });
    if (!products) {
      req.flash("error", "No products");
      return res.render("admin/outfStock", { prdoduct: "" });
    }
    return res.render("admin/outofStock", { prdoduct: products });
  } catch (error) {
    console.log(error);
    req.flash("error", "ERROR" + error);
    res.render("admin/outofStock", { prdoduct: "" });
  }
};

const priceChanged = async (req, res) => {
  try {
    const product = await Poducts.find();
    if (!product) {
      req.flash("error", "No products");
      return res.render("admin/pricechanged", { prdoduct: "" });
    }
    return res.render("admin/pricechanged", { prdoduct: product });
  } catch (error) {
    req.flash("error", "ERROR" + error);
    res.render("admin/outOfStock", { prdoduct: "" });
  }
};

const backinstock = async (req, res) => {
  try {
    const product = await Poducts.find({
      $and: [{ oldStock: "Out of stock " }, { newStock: "In Stock " }],
    });

    if (!product) {
      req.flash("error", "No products");
      return res.render("admin/backinstock", { prdoduct: "" });
    }
    return res.render("admin/backinstock", { prdoduct: product });
  } catch (error) {
    req.flash("error", "ERROR" + error);
    res.render("admin/backinstock", { prdoduct: "" });
  }
};

// dashboard
const dashboardPage = async (req, res) => {
  try {
    const product = await Poducts.find();
    if (!product) {
      req.flash("error", "No products");
      return res.render("admin/dashboard", { products: "" });
    }
    res.render("admin/dashboard", { products: product });
  } catch (error) {
    req.flash("error", "ERROR" + error);
    res.render("admin/dashboard", { products: "" });
  }
};

// updatedProduct
const updatedProduct = async (req, res) => {
  try {
    const product = await Poducts.find({ updateStatus: "Updated" });

    if (!product) {
      req.flash("error", "No products");
      return res.render("admin/updatedproducts", { products: "" });
    }
    return res.render("admin/updatedproducts", { products: product });
  } catch (error) {
    req.flash("error", "ERROR" + error);
    res.render("admin/dashboard");
  }
};
const NotupdatedProduct = async (req, res) => {
  try {
    const product = await Poducts.find({ updateStatus: "Not Updated" });
    if (!product) {
      req.flash("error", "No Updated Product");
      return res.render("admin/notupdatedproducts", { products: "" });
    }
    return res.render("admin/notupdatedproducts", { products: product });
  } catch (error) {
    req.flash("error", "ERROR" + error);
    res.render("admin/notupdatedproducts");
  }
};

const update = async (req, res) => {
  try {
    res.render("admin/update", { message: " " });
  } catch (error) {
    req.flash("error", "ERROR" + error);
    res.render("admin/update");
  }
};
const Postupdate = async (req, res) => {
  try {
    res.render("admin/update", { message: "update started" });

    const products = await Poducts.find();
    if (products) {
      for (let i = 0; i < products.length; i++) {
        Poducts.updateOne(
          { url: products[i].url },
          {
            $set: {
              oldPrice: products[i].newPrice,
              oldStock: products[i].newStock,
              updateStatus: "Not Updated",
            },
          }
        ).then((products) => {});
      }

      browser = await pupperter.launch({ headless: false });
      const page = await browser.newPage();
      for (let i = 0; i < products.length; i++) {
        let result = await scrapeData(products[i].url, page);
        Poducts.updateOne(
          { url: products[i].url },
          {
            $set: {
              title: result.title,
              newPrice: "$" + result.price,
              newStock: result.stock,
              updateStatus: "Updated",
            },
          }
        ).then((products) => {});
      }
      browser.close();
      req.flash("sucess", "Product Updated Successfully");
      return res.redirect("/");
    }
    req.flash("error", "No products");
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    req.flash("error", "ERROR" + error);
    res.render("admin/update");
  }
};
module.exports = {
  scrapeDataFromWebsite,
  saveScrapeData,
  searchProductsPage,
  instock,
  deleteProduct,
  outOfStock,
  priceChanged,
  backinstock,
  dashboardPage,
  updatedProduct,
  NotupdatedProduct,
  update,
  Postupdate,
};
