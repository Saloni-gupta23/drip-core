// app/page.js
// The "use client" directive tells Next.js that this is a Client Component.
// This is REQUIRED to use hooks like useState and useEffect.
"use client";

import React, { useState, useEffect } from 'react';

// The main component for our home page.
// It's exported as the default, which Next.js recognizes as the page component.
export default function App() {
  // === State Management ===
  // 1. `products`: An array to store the product data we fetch from the API.
  //    Initialized as an empty array.
  const [products, setProducts] = useState([]);

  // 2. `loading`: A boolean to track whether we are currently fetching data.
  //    Used to show a loading message to the user.
  const [loading, setLoading] = useState(true);

  // 3. `error`: A string to store any error messages that occur during the fetch.
  const [error, setError] = useState(null);

  // === Data Fetching ===
  // The `useEffect` hook runs after the component mounts in the client's browser.
  // The empty dependency array `[]` means it will only run once.
  useEffect(() => {
    // Define an async function to fetch products
    const fetchProducts = async () => {
      try {
        // The URL of our backend server's product endpoint.
        // Make sure your Node.js server from the previous step is running.
        const response = await fetch('http://localhost:3001/api/products');

        // Check if the network response was successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON data from the response
        const data = await response.json();
        setProducts(data); // Update the state with the fetched products
      } catch (e) {
        // If an error occurs, update the error state
        console.error("Failed to fetch products:", e);
        setError('Failed to load products. Please make sure the backend server is running.');
      } finally {
        // Set loading to false once the fetch is complete (either success or failure)
        setLoading(false);
      }
    };

    fetchProducts(); // Call the fetch function
  }, []); // Empty dependency array ensures this runs only once on component mount.

  // === Render Logic ===
  // Show a loading message while data is being fetched.
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading products...</p>
      </div>
    );
  }

  // Show an error message if the fetch failed.
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-50">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  // === JSX for the main component ===
  // This is what gets rendered to the screen.
  // We use Tailwind CSS for styling.
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-800">Intelligent Store</h1>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Our Products</h2>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            // The `key` prop is crucial for React to efficiently update lists.
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
              <img
                src={product.imageUrl}
                alt={`Image of ${product.name}`}
                className="w-full h-48 object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Found'; }}
              />
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
                <p className="text-gray-600 mt-2 text-sm h-10">{product.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
