'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import addressValidator from '../utils/functions/addressValidator';

// Custom Component for working with the Home Page Wallet Form
export default function HomePageWalletForm() {
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Function for handling form submissions
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (addressValidator(walletAddress)) {
      router.push(`/transactions/${walletAddress}`);
    } 
    else {
      setError('Invalid wallet address. Please check and try again.');
    }
  };

  // Return JSX code for working with the Home Page Wallet Form Component
  return (
    <form className="mt-8" onSubmit={handleSubmit}>
      <div className="flex flex-col sm:flex-row gap-4">
        <input 
          className="flex-grow bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
          type="search"
          placeholder="Enter wallet address"
          maxLength={42}
          minLength={42}
          aria-label="Search"
          required 
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
        />
        <button 
          className="bg-gradient-to-r from-gray-600 to-gray-400 text-white py-2 px-6 rounded-md hover:from-gray-500 hover:to-gray-300 transition-all duration-300 transform hover:scale-105"
          type="submit"
        >
          Search! &raquo;
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}