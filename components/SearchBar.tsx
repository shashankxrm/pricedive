'use client'
import { scrapeAndStoreProduct } from '@/lib/actions';
import { FormEvent, useState } from 'react'

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

export default Searchbar