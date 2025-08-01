import React, { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getChartData, getReferences } from "./api";

/**
 * ChartVisualization
 * Fetches chart data from the backend for the selected chart type ("bar" or "line") and renders it using Recharts.
 * @param {object} props
 *   chartType - "bar" | "line"
 *   chartQuery - optional string to filter chart data
 */
 // PUBLIC_INTERFACE
export function ChartVisualization({ chartType = "bar", chartQuery = null }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setErr("");
    setLoading(true);
    setChartData(null);
    getChartData(chartType, chartQuery)
      .then((data) => {
        // Transform backend format { labels: [], values: [] }
        if (data && data.labels && data.values && Array.isArray(data.labels) && Array.isArray(data.values)) {
          const rows = data.labels.map((lbl, i) => ({
            label: lbl,
            value: data.values[i] ?? 0
          }));
          setChartData(rows);
        } else {
          setChartData([]);
        }
      })
      .catch((e) => setErr(e?.message || "Failed to fetch chart data"))
      .finally(() => setLoading(false));
  }, [chartType, chartQuery]);

  return (
    <div className="chart-visualization" style={{
      background: "var(--bg-secondary)",
      borderRadius: 16,
      margin: "14px auto 34px auto",
      padding: 24,
      boxShadow: "0 2px 19px 0 rgba(0,0,0,0.08)",
      maxWidth: 620,
      width: "100%",
      border: '1.5px solid var(--border-color)',
      minHeight: 280
    }}>
      <div style={{fontWeight: 600, fontSize: 18, marginBottom: 13}}>Chart Visualization</div>
      {loading && <div>Loading chart...</div>}
      {err && <div style={{ color: "red" }}>Error: {err}</div>}
      {chartData && chartData.length === 0 && !loading && !err && <div>No chart data available.</div>}
      {chartData && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={270}>
          {chartType === "bar" ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="var(--text-secondary)" name="Value" />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line dataKey="value" stroke="var(--text-secondary)" name="Value" />
            </LineChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
}

/**
 * ReferenceList
 * Fetches and displays a list of references/sources from the backend.
 */
 // PUBLIC_INTERFACE
export function ReferenceList({ title = "Knowledge References" }) {
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setErr("");
    setLoading(true);
    getReferences()
      .then((data) => {
        if (data && Array.isArray(data.references)) {
          setReferences(data.references);
        } else {
          setReferences([]);
        }
      })
      .catch((e) => setErr(e?.message || "Failed to fetch references"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="reference-list" style={{
      background: "var(--bg-secondary)",
      borderRadius: 14,
      margin: "10px auto 20px auto",
      padding: 20,
      boxShadow: "0 1px 10px 0 rgba(0,0,0,0.06)",
      maxWidth: 480,
      width: "100%",
      border: '1.5px solid var(--border-color)'
    }}>
      <div style={{ fontWeight: 600, fontSize: 16.5, marginBottom: 9 }}>{title}</div>
      {loading && <div>Loading...</div>}
      {err && <div style={{ color: "red" }}>{err}</div>}
      {references && references.length === 0 && !loading && !err && <div>No references found.</div>}
      {references && references.length > 0 && (
        <ul style={{ paddingLeft: 16, margin: 0 }}>
          {references.map((ref, idx) => (
            <li key={idx} style={{
              fontSize: 14.5,
              marginBottom: 2,
              background: "rgba(0,120,180,0.09)",
              borderRadius: 5,
              padding: "4px 8px",
              color: "var(--text-primary)",
              fontFamily: "monospace"
            }}>
              {ref}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
