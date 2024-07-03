"use client"
import HeroCarousel from "@/components/HeroCarousel"

import Image from "next/image"
import { getAllProducts } from "@/lib/actions"
import ProductCard from "@/components/ProductCard"
import { useState } from "react"
import { FormEvent } from "react"
import { scrapeAndStoreProduct } from "@/lib/actions"



const Home = async () => {
  const allProducts = await getAllProducts();
  return (
    <>
      <section className="px-6 md:px-20 py-24">
        <div className="flex max-xl:flex-col gap-16">
          <div className="flex flex-col justify-center">
            <p className="small-text">
              Smart Shoppping Starts Here
              <Image
                src="/assets/icons/arrow-right.svg"
                alt="arrow-right"
                width={16}
                height={16}
              />
            </p>

            <h1 className="head-text">
              Unleash the Power of
              <span className="text-primary"> PriceDive</span>
            </h1>

            <p className="mt-6">
              Powerful, self-server product and growth analytics to help you convert, engage, and retain more.
            </p>

            <Searchbar />
          </div>

          <HeroCarousel />
        </div>
      </section>

      <section className="trending-section">
        <h2 className="section-text">Trending</h2>

        <div className="flex flex-wrap gap-x-8 gap-y-16">
          {allProducts?.map((product) => (
            <ProductCard key={product._id} product={product}/>
          ))}
        </div>
      </section>
    </>
  )
}
const Searchbar = () => {
  const [searchPrompt, setSearchPrompt] = useState('');
  const [ loading, setLoading ] = useState(false);
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValidLink = isValidAmazonProductLink(searchPrompt);

    if(!isValidLink) {
      alert('Please enter a valid Amazon product link');
    }

    try {
      setLoading(true);
      // Scraping logic here
      const product = await scrapeAndStoreProduct(searchPrompt);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="flex flex-wrap gap-4 mt-12"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder="Enter product link"
        className="searchbar-input"
      />

      <button
        type="submit"
        className="searchbar-btn"
        disabled={searchPrompt === '' || loading}
      > {loading? 'Searching...' : 'Search'}</button>
    </form>
  )
}
const isValidAmazonProductLink = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    if(hostname.includes('amazon.com') || hostname.includes('amazon.') || hostname.includes('amazon')) {
      return true;
    }
  }
  catch (error) {
    return false;
  }
}

export default Home