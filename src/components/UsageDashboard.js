import React, { useEffect, useState } from "react";
import "./UsageDashboard.css";

const UsageDashboard = () => {
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch("https://krishbackend-production.up.railway.app/api/usage?days=10000");
        if (!response.ok) throw new Error("Failed to fetch usage data");
        const data = await response.json();
        setUsageData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, []);

  if (loading) return <div className="loading">Loading usage data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const total = usageData.reduce((sum, item) => sum + item.amount_usd, 0);

  return (
    <div className="usage-dashboard">
      <h1>OpenAI API Usage (Last 30 Days)</h1>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Amount (USD)</th>
          </tr>
        </thead>
        <tbody>
          {usageData.map((item, index) => (
            <tr key={index}>
              <td>{item.date}</td>
              <td>{item.type}</td>
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
