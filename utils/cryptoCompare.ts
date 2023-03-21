export async function getExchangePrice(exchange: string, currency: string, COINGECKO_API_URL: string) {
    const response = await fetch(`${COINGECKO_API_URL}/simple/price?ids=${exchange}&vs_currencies=usd&include_24hr_change=true`);
    if (!response.ok) {
      throw new Error(`Failed to retrieve price for ${currency} on ${exchange}: ${response.status} ${response.statusText}`);
    }
  
    const price = (await response.json())[exchange.toLowerCase()].usd;
  
    if (price === undefined) {
      throw new Error(`Failed to parse price for ${currency} on ${exchange}: ${JSON.stringify(price)}`);
    }
  
    return price;
  }