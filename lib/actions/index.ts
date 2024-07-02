"use server"
import { scrapeAmazonProduct } from '@/lib/scraper/index';

export async function scrapeAndStoreProduct(productUrl: string) {
    if(!productUrl) {
        return;
    }
    try{
        const scrapedProduct = await scrapeAmazonProduct(productUrl);
    } catch (error: any) {
        throw new Error(`Failed to scrape product: ${error.message}`);
    }
}