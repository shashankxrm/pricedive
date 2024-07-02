export async function scrapeAmazonProduct(url: string) {
    if(!url) {
        return;
    }
    //curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_23374ed9-zone-pricedive:x5xe24rjs8pr -k "http://geo.brdtest.com/mygeo.json"

    
    // BrightData proxy configuration
    const username = String(process.env.BRIGHTDATA_USERNAME);
    const password = String(process.env.BRIGHTDATA_PASSWORD);
}