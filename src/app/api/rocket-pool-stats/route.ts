import { NextResponse } from "next/server";

const BEACON_CHAIN_URL = "https://beaconcha.in/api/v1/rocketpool/stats"; // Beacon Chain API Endpoint

// Custom Route Handler function
export async function GET(){

    // Setting options for authenticated API call
    const options = {
        method: "GET",
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*'
        } as HeadersInit
    }

    // Fetch data based on options parameters
    const response = await fetch(BEACON_CHAIN_URL + '?apikey=' + process.env.BEACON_CHAIN_API_KEY , options); // Fetch data related to the global market
    
    // Return response based on data fetch
    if (!response.ok) {
        return NextResponse.json({
            message: "Could not fetch global market data"
        }, { status: 400 });
    }
    else {
        // Send back as response, rocket pool statistics
        const information = await response.json();
        return NextResponse.json({
            information
        });
    }
}