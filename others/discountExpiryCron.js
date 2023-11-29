const Cron = require('node-cron');
const Product=require('../models/productModel')
const Category = require('../models/categoryModel');

Cron.schedule('0 * * * *', async () => {
    try {
        console.log('Cron job started at:', new Date().toLocaleString());

      const expiredCategories = await Category.find({
            expiryDate: { $lte: new Date() } // Categories whose expiry date has passed
        });
      // Find products where the expiry date has passed
      const expiredProducts = await Product.find({
        'category.expiryDate': { $lt: new Date() },
        'category.discount': { $gt: 0 } // Only update if discount is currently set
      });
      for (const category of expiredCategories) {
        category.discount = 0;
        category.expiryDate = null; // Reset expiryDate to null or another default value
        category.offerstatus = false;
        await category.save();
    }
      // Update expired products to set the discount to zero
      for (const product of expiredProducts) {
        product.discountedPrice = 0;
        
        await product.save();
      }
    } catch (error) {
      console.error('Error occurred:', error.message);
    }
  });
  
  module.exports = Cron;

