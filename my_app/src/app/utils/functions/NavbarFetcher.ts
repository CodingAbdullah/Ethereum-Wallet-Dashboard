// Custom fetcher function to be used for working with requests, client-side
export default async function NavbarFetcher(url: string) {
    
  if (url === 'api/navbar/ethereum-price') {
    const res = await fetch('api/navbar/ethereum-price');
    
    if (!res.ok) {
      throw new Error('An error occurred while fetching the data.');
    }
    
    return res.json();
  }
  else {
    const res = await fetch('api/navbar/gas-track');

    if (!res.ok) {
      throw new Error('An error occurred while fetching the data.');
    }
    
    return res.json();
  }
}