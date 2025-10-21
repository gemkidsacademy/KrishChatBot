import React, { useState, useEffect } from "react";
import "./UsageDashboard.css";

const UsageDashboard = () => {
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dummy customer usage data for last 30 days
    const dummyData = [
      { user: "Alice", model: "GPT-3.5 Turbo", amount_usd: 12.50 },
      { user: "Bob", model: "GPT-4", amount_usd: 25.00 },
      { user: "Charlie", model: "GPT-3.5 Turbo", amount_usd: 8.75 },
      { user: "Diana", model: "GPT-4", amount_usd: 30.00 },
      { user: "Ethan", model: "GPT-3.5 Turbo", amount_usd: 5.50 },
      { user: "Fiona", model: "GPT-4", amount_usd: 18.25 },
      { user: "George", model: "GPT-3.5 Turbo", amount_usd: 9.10 },
      { user: "Hannah", model: "GPT-4", amount_usd: 22.00 }
    ];

    // Simulate loading delay
    setTimeout(() => {
      setUsageData(dummyData);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return <div className="loading">Loading usage data...</div>;

  // Calculate total usage across all users
  const total = usageData.reduce((sum, item) => sum + item.amount_usd, 0);

  return (
    <div className="usage-dashboard">
      <h1>Customer API Usage (Last 30 Days)</h1>
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Model</th>
            <th>Amount (USD)</th>
          </tr>
        </thead>
        <tbody>
          {usageData.map((item, index) => (
            <tr key={index}>
              <td>{item.user}</td>
              <td>{item.model}</td>
              <td>${item.amount_usd.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="total">
        <strong>Total Usage: ${total.toFixed(2)}</strong>
      </div>
    </div>
  );
};

export default UsageDashboard;
