import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './custom.css';

function App() {
  const [url, setUrl] = useState('');
  const [qps, setQps] = useState(1);
  const [latencies, setLatencies] = useState([]);
  const [errorRates, setErrorRates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  const fetchResults = async () => {
    try {
      const response = await axios.post('http://localhost:8000/loadtest', { url, qps });
      setLatencies((prevLatencies) => {
        const newLatencies = [...prevLatencies, ...response.data.latencies];
        const maxDataPoints = qps * 20;
        if (newLatencies.length > maxDataPoints) {
          return newLatencies.slice(-maxDataPoints);
        }
        return newLatencies;
      });
      setErrorRates((prevErrorRates) => {
        const newErrorRates = [...prevErrorRates, ...Array(response.data.latencies.length).fill(response.data.error_rate)];
        const maxDataPoints = qps * 20;
        if (newErrorRates.length > maxDataPoints) {
          return newErrorRates.slice(-maxDataPoints);
        }
        return newErrorRates;
      });
    } catch (error) {
      console.error("There was an error!", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLatencies([]); // Reset latencies on new test
    setErrorRates([]); // Reset error rates on new test
    if (intervalId) {
      clearInterval(intervalId);
    }
    await fetchResults();
    const newIntervalId = setInterval(fetchResults, 5000); // Poll every 5 seconds
    setIntervalId(newIntervalId);
  };

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const calculateStatistics = () => {
    const validLatencies = latencies.filter(latency => latency !== null);
    if (validLatencies.length === 0) return {};

    const average = validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length;
    const median = [...validLatencies].sort((a, b) => a - b)[Math.floor(validLatencies.length / 2)];
    const max = Math.max(...validLatencies);
    const min = Math.min(...validLatencies);
    const stdDev = Math.sqrt(validLatencies.map(x => Math.pow(x - average, 2)).reduce((a, b) => a + b) / validLatencies.length);
    const percentile90 = [...validLatencies].sort((a, b) => a - b)[Math.floor(validLatencies.length * 0.9)];
    const totalRequests = validLatencies.length;
    const totalErrors = errorRates.reduce((a, b) => a + (b || 0), 0);

    return {
      average: average.toFixed(4),
      median: median.toFixed(4),
      max: max.toFixed(4),
      min: min.toFixed(4),
      stdDev: stdDev.toFixed(4),
      percentile90: percentile90.toFixed(4),
      totalRequests,
      totalErrors
    };
  };

  const stats = calculateStatistics();
  const performanceDifference = () => {
    const validLatencies = latencies.filter(latency => latency !== null);
    if (validLatencies.length < 2) return 'N/A';
    const latest = validLatencies[validLatencies.length - 1];
    const previous = validLatencies[validLatencies.length - 2];
    return (((latest - previous) / previous) * 100).toFixed(2);
  };

  const maxDataPoints = qps * 20;
  const data = Array(maxDataPoints).fill(null).map((_, index) => ({
    name: `Request ${index + 1}`,
    Latency: latencies[index] !== undefined ? latencies[index].toFixed(4) : null,
    'Error Rate': errorRates[index] !== undefined ? errorRates[index] : null,
  }));

  return (
    <div className="container">
      <h1>HTTP Load Tester</h1>
      <form onSubmit={handleSubmit} className="form-grid">
        <div>
          <label htmlFor="url">URL:</label>
          <input type="text" id="url" value={url} onChange={(e) => setUrl(e.target.value)} required className="small" />
        </div>
        <div>
          <label htmlFor="qps">QPS:</label>
          <input type="number" id="qps" value={qps} onChange={(e) => setQps(e.target.value)} min="1" required className="small" />
        </div>
        <button type="submit" disabled={isLoading}>Start Test</button>
      </form>
      {latencies.filter(latency => latency !== null).length > 0 && (
        <div className="results">
          <h2>Performance</h2>
          <table>
            <thead>
              <tr>
                <th>Latest Latency (s)</th>
                <th>Performance Change (%)</th>
                <th>Error Rate (%)</th>
                <th>Average Latency (s)</th>
                <th>Median Latency (s)</th>
                <th>Maximum Latency (s)</th>
                <th>Minimum Latency (s)</th>
                <th>Standard Deviation (s)</th>
                <th>90th Percentile (s)</th>
                <th>Total Requests</th>
                <th>Total Errors</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{latencies[latencies.length - 1] !== null ? latencies[latencies.length - 1].toFixed(4) : 'N/A'}</td>
                <td>{performanceDifference()}</td>
                <td>{errorRates[errorRates.length - 1] !== null ? errorRates[errorRates.length - 1] : 'N/A'}</td>
                <td>{stats.average}</td>
                <td>{stats.median}</td>
                <td>{stats.max}</td>
                <td>{stats.min}</td>
                <td>{stats.stdDev}</td>
                <td>{stats.percentile90}</td>
                <td>{stats.totalRequests}</td>
                <td>{stats.totalErrors}</td>
              </tr>
            </tbody>
          </table>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" label={{ value: 'Latency (s)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Error Rate (%)', angle: -90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="Latency" stroke="#8884d8" isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="Error Rate" stroke="#ff7300" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
          <h2>Results</h2>
          <ul>
            {latencies.filter(latency => latency !== null).map((latency, index) => (
              <li key={index}>Request {index + 1}: {latency.toFixed(4)} seconds</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
