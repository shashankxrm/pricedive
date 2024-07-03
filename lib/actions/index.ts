'use server';

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "../nodemailer";

export async function scrapeAndStoreProduct(productUrl: string) {
  if (!productUrl) return;

  try {
    await connectToDB();
    const scrapedProduct = await scrapeAmazonProduct(productUrl);

    if (!scrapedProduct) return;

    // Store the scraped product in the database
    let product = scrapedProduct;
    const existingProduct = await Product.findOne({ url: product.url });
    if (existingProduct) {
      const updatedPriceHistory:any = [...existingProduct.priceHistory, { price: scrapedProduct.currentPrice }];

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory)
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    );

    revalidatePath(`/products/${newProduct._id}`);
  } catch (error: any) {
    console.log("Error details:", error);
    throw new Error("Failed to scrape and store product");
  }
}

export async function getProductById(productId: string) {
  try {
    await connectToDB();
    const product = await Product.findOne({ _id: productId });
    if (!product) return null;
    return product;
  } catch (error: any) {
    console.log("Error details:", error);
    throw new Error("Failed to get product by ID");
  }
}

export async function getAllProducts() {
  try {
    await connectToDB();
    const products = await Product.find();
    if (!products) return [];
    return products;
  } catch (error: any) {
    console.log("Error details:", error);
    throw new Error("Failed to get all products");
  }
}
export async function getSimilarProducts(productId: string) {
  try {
    await connectToDB();
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) return null;

    let similarProducts;

    if (currentProduct.category.length > 0) {
      const categoryItems = currentProduct.category.map((cat: { categoryItem: string }) => cat.categoryItem);
      
      similarProducts = await Product.find({
        'category.categoryItem': { $in: categoryItems },
        _id: { $ne: productId }
      }).limit(3);
    }

    if (!similarProducts || similarProducts.length === 0) {
      const titleWords = currentProduct.title.split(' ').map((word: string) => word.trim()).filter((word: string) => word.length > 2);
      const regex = new RegExp(titleWords.join('|'), 'i');

      similarProducts = await Product.find({
        title: { $regex: regex },
        _id: { $ne: productId }
      }).limit(3);
    }

    return similarProducts;
  } catch (error: any) {
    console.log("Error details:", error);
    throw new Error("Failed to get similar products");
  }
}

export async function addUserEmailToProduct(productId: string, userEmail: string) {
  try {
    const product = await Product.findById(productId);
    if (!product) return;

    const userExists = product.users.some((user: User) => user.email === userEmail);

    if(!userExists) {
      product.users.push({email: userEmail});
      await product.save();
      const emailContent = await generateEmailBody(product, "WELCOME");

      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error: any) {
    console.log("Error details:", error);
    throw new Error("Failed to add user email to product");
  }
}

