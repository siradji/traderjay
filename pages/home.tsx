"use client"; // this is a client component

import { useState, useEffect } from "react";

export default function Arbitrage() {
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/trade');
      const data = await response.json();
      setOpportunities(data.data);
      setLoading(false);
      console.log(data.data)
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  function handleRefreshClick() {
    fetchData();
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-2xl font-bold mb-6">Crypto Arbitrage Opportunities</h2>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : opportunities.length > 0 ? (
        opportunities.map((opportunity, index) => (
           <div key={index} className="bg-white shadow-lg rounded-lg px-6 py-4 mb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">{opportunity.ticker}</h3>
          <div className={`text-sm font-semibold ${opportunity.profitability > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {opportunity.profitability > 0 ? '+' : ''}{opportunity.profitability.toFixed(2)}%
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 mt-4">
          <div>
            <h4 className="text-lg font-semibold mb-2">Buy on {opportunity.highest.exchange}</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Price</span>
              <span className="text-lg font-semibold">{opportunity.highest.price.toFixed(8)}</span>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">Sell on {opportunity.lowest.exchange}</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Price</span>
              <span className="text-lg font-semibold">{opportunity.lowest.price.toFixed(8)}</span>
            </div>
          </div>
        </div>
      </div>
        
        ))
      ) : (
        <div>No opportunities found</div>
      )}
      <button onClick={handleRefreshClick}>Refresh</button>
    </div>
  );
}