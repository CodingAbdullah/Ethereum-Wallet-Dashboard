// Custom fetcher function to be used for working with requests, client-side
export default async function fetcher(url: string) {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error('An error occurred while fetching the data.')
    }
    
    return res.json()
}