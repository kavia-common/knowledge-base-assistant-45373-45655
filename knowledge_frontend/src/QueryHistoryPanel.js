import React, { useState, useEffect } from "react";
import { getHistory } from "./api";

/**
 * QueryHistoryPanel
 * Displays user's past queries and answers in a sidebar or modal.
 * Allows user to close panel and (optionally) re-query from history.
 * 
 * Props:
 *  open: boolean - whether the panel/modal is open
 *  onClose: function - called when the panel/modal is dismissed
 */
 // PUBLIC_INTERFACE
export function QueryHistoryPanel({ open, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [expandedIdx, setExpandedIdx] = useState(-1);

  useEffect(() => {
    if (!open) return;
    setErr("");
    setLoading(true);
    getHistory()
      .then(data => {
        if (data && Array.isArray(data.history)) {
          setHistory(data.history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        } else {
          setHistory([]);
        }
      })
      .catch(e => setErr(e?.message || "Failed to fetch history"))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;
  return (
    <div 
      className="history-modal-backdrop"
      style={{
        position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", zIndex: 10010,
        background: "rgba(0,0,0,0.20)", display: "flex", alignItems: "flex-start", justifyContent: "flex-end"
      }}
      onClick={onClose}
    >
      <div
        className="history-panel"
        style={{
          width: "375px", maxWidth: "93vw", minHeight: "100vh", background: "var(--bg-secondary)",
          boxShadow: "-6px 0 20px 0 rgba(0,0,0,0.17)", borderLeft: "1.5px solid var(--border-color)", padding: "0",
          display: "flex", flexDirection: "column", position: "relative", overflowY: "auto"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding: "23px 16px 11px 23px", borderBottom: "1.5px solid var(--border-color)",
          background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <span style={{ fontWeight: 700, fontSize: 20, color: "var(--text-primary)" }}>
            Query History
          </span>
          <button 
            onClick={onClose}
            aria-label="Close history"
            style={{
              background: "transparent", border: "none", fontSize: 27, fontWeight: 400, cursor: "pointer",
              color: "var(--text-secondary)"
            }}
          >×</button>
        </div>
        <div style={{ padding: "16px 18px 10px 18px", flexGrow: 1, overflowY: "auto" }}>
          {loading && <div>Loading history...</div>}
          {err && <div style={{ color: "red" }}>Error: {err}</div>}
          {history.length === 0 && !loading && !err && <div>No previous queries.</div>}
          {history.length > 0 && (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {history.map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    marginBottom: 18,
                    background: expandedIdx === idx ? "rgba(0,180,216,0.1)" : "rgba(0,0,0,0.02)",
                    borderRadius: 8,
                    padding: "10px 12px 8px 12px",
                    cursor: "pointer",
                    border: "1px solid var(--border-color)"
                  }}
                  onClick={() => setExpandedIdx(expandedIdx === idx ? -1 : idx)}
                  title="Click to expand/collapse"
                >
                  <div style={{ fontWeight: 500, fontSize: 15, color: "var(--text-secondary)" }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                  <div style={{
                    fontWeight: 600, fontSize: 15.5, margin: "5px 0 6px 0", color: "var(--text-primary)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: expandedIdx === idx ? "normal" : "nowrap"
                  }}>
                    Q: {item.question}
                  </div>
                  {expandedIdx === idx && (
                    <div style={{ marginTop: 4, fontSize: 15, color: "var(--text-primary)" }}>
                      <div style={{ marginBottom: 5, fontWeight: 500 }}>A: <span style={{ fontWeight: 400 }}>{item.answer}</span></div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ textAlign: "center", padding: "10px 0 14px 0", fontSize: 13.5, color: "var(--text-secondary)" }}>
          Only you can see your query history. <br />
        </div>
      </div>
    </div>
  );
}
