'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '../../components/ui/button'

// Custom Error Page for handling Invalid Wallet Addresses
export default function TransactionError({
    error,
    reset,
        }: {
        error: Error & { digest?: string }
        reset: () => void
    }) {


    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error]);

    // Custom JSX for rendering Error component
    return (
        <div className="bg-gray-800 min-h-screen flex items-center justify-center px-4">
            <div className="max-w-3xl w-full text-center">
                <h1 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400">
                    Invalid Wallet Address
                </h1>
                <div className="bg-gray-700 p-8 rounded-lg shadow-lg">
                    <p className="text-gray-300 text-lg mb-6">
                        The wallet address you've entered is invalid or doesn't exist. Please check the address and try again.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button asChild className="bg-gradient-to-r from-gray-600 to-gray-400 text-white py-2 px-6 rounded-md hover:from-gray-500 hover:to-gray-300 transition-all duration-300 transform hover:scale-105">
                            <Link href="/">
                                Return to Home
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}