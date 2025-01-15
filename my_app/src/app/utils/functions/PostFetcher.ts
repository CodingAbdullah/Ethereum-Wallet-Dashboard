// Custom Post Fetcher function
const PostFetcher = async (url: string, data: object) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) // Passing params in the body
    });

    if (!response.ok) {
        throw new Error();
    }

    return response.json(); // Assuming the response is in JSON format
};

export default PostFetcher;