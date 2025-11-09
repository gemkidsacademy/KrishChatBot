import React, { useState, useEffect } from "react";
import "./UsageDashboard.css";

const UsageDashboard = () => {
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        const response = await fetch("/api/openai-usage"); // Backend endpoint for OpenAI API usage
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUsageData(data);
      } catch (err) {
        console.error("Failed to fetch OpenAI API usage data:", err);
        setError("Failed to load OpenAI API usage data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, []);

  if (loading) return <div className="loading">Loading OpenAI API usage data...</div>;
  if (error) return <div className="error">{error}</div>;

  // Calculate total usage across all users
  const total = usageData.reduce((sum, item) => sum + item.amount_usd, 0);

  return (
    <div className="usage-dashboard">
      <h1>OpenAI API Usage (Last 30 Days)</h1>
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Amount (USD)</th>
          </tr>
        </thead>
        <tbody>
          {usageData.map((item, index) => (
            <tr key={index}>
              <td>{item.user}</td>
              <td>${item.amount_usd.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="total">
        <strong>Total OpenAI API Usage: ${total.toFixed(2)}</strong>
      </div>
    </div>
  );
};

export default UsageDashboard;
