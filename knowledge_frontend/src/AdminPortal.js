import React, { useState, useEffect } from "react";
import { getAdminData, performAdminAction } from "./api";

/**
 * AdminPortal
 * Dedicated UI for admin users to manage uploads, users, and view logs.
 * Provides protected access, visibility toggling, and backend integration.
 * 
 * Props:
 *   open: boolean       - Controls portal visibility.
 *   onClose: function   - Fired when admin exits portal.
 */
// PUBLIC_INTERFACE
export function AdminPortal({ open, onClose }) {
  const [auth, setAuth] = useState(false); // Represents if admin is authenticated
  const [authInput, setAuthInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionErr, setActionErr] = useState("");

  // Dummy password for demonstration; in a real app, backend login & JWT would be used
  const ADMIN_PASSWORD = "admin123"; // Should ideally be from an ENV or backend!

  // Load admin dashboard data whenever open+auth changes
  useEffect(() => {
    if (!open) return;
    if (!auth) return;
    setLoading(true);
    setAdminData(null);
    setActionMsg("");
    setActionErr("");
    getAdminData()
      .then(data => setAdminData(data))
      .catch(e => setAdminData({ error: "Failed to load admin data: " + (e?.message || "") }))
      .finally(() => setLoading(false));
  }, [open, auth]);

  if (!open) return null;

  // Simple admin "authentication" with password
  if (!auth) {
    return (
      <div style={{
        position: "fixed",
        top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.27)", zIndex: 10060,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          background: "var(--bg-primary)", borderRadius: 17, boxShadow: "0 8px 54px rgba(0,0,0,0.20)",
          minWidth: 320, maxWidth: 390, padding: "33px 28px", textAlign: "center", position: "relative"
        }}>
          <h2 style={{ marginTop: 0, color: "var(--text-primary)" }}>Admin Login</h2>
          <input
            type="password"
            placeholder="Enter admin password"
            value={authInput}
            style={{
              padding: "10px 14px", width: "92%", marginBottom: 14, fontSize: 15.5,
              borderRadius: 8, border: "1.8px solid var(--border-color)", outline: "none",
              background: "var(--bg-secondary)", color: "var(--text-primary)"
            }}
            autoFocus
            onChange={e => { setAuthInput(e.target.value); setAuthError(""); }}
            onKeyDown={e => { if (e.key === "Enter") handleLogin(); }}
          />
          {authError && (<div style={{ color: "red", marginBottom: 13 }}>{authError}</div>)}
          <button
            style={{
              background: "var(--button-bg)", color: "var(--button-text)",
              border: "none", borderRadius: 8, padding: "10px 23px", fontWeight: 600, fontSize: 16,
              cursor: "pointer", marginBottom: 4
            }}
            onClick={() => handleLogin()}
          >Login</button>
          <br />
          <button
            style={{
              color: "var(--text-secondary)", background: "transparent", border: "none",
              marginTop: 10, cursor: "pointer", fontSize: 15, opacity: 0.7
            }}
            onClick={onClose}
          >Cancel</button>
        </div>
      </div>
    );
  }

  function handleLogin() {
    if (authInput === ADMIN_PASSWORD) {
      setAuth(true);
      setAuthInput("");
      setAuthError("");
    } else {
      setAuthError("Incorrect password.");
      setAuthInput("");
    }
  }

  function handleLogout() {
    setAuth(false);
    setAuthError("");
    setAuthInput("");
    setAdminData(null);
    setActionMsg("");
    setActionErr("");
  }

  // List of example admin actions (could be reprocess uploads, delete users, etc.)
  const actions = [
    { label: "Reprocess All Uploads", action: "reprocess_uploads" },
    { label: "List All Users", action: "list_users" },
    { label: "Download Server Logs", action: "download_logs" },
    { label: "Clear Query History", action: "clear_history" }
  ];

  async function doAdminAction(action) {
    setActionLoading(true);
    setActionMsg("");
    setActionErr("");
    try {
      const result = await performAdminAction(action);
      setActionMsg(JSON.stringify(result, null, 2));
    } catch (e) {
      setActionErr("Admin action failed: " + (e?.message || ""));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.21)", zIndex: 10060,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "var(--bg-primary)", borderRadius: 17, boxShadow: "0 8px 54px 0 rgba(0,0,0,0.24)",
        minWidth: 350, maxWidth: 500, padding: "33px 31px", position: "relative",
        textAlign: "center", maxHeight: "95vh", overflowY: "auto"
      }}>
        <button
          onClick={onClose}
          aria-label="Close admin portal"
          style={{
            position: "absolute", top: 15, right: 16, border: "none",
            background: "transparent", color: "var(--text-secondary)",
            fontSize: 28, fontWeight: 400, cursor: "pointer"
          }}
        >×</button>
        <button
          onClick={handleLogout}
          aria-label="Logout admin"
          style={{
            position: "absolute", top: 15, left: 17, border: "none",
            background: "transparent", color: "var(--text-secondary)",
            fontSize: 22, fontWeight: 500, cursor: "pointer"
          }}
        >⎋</button>
        <div style={{ fontWeight: 700, fontSize: 23, color: "var(--text-primary)", marginBottom: 6 }}>
          Admin Portal
        </div>
        <div style={{ fontSize: 15.8, margin: "0 0 22px", color: "var(--text-secondary)" }}>
          Manage uploads, users, and logs below. (For demonstration, actions connect to backend API.)
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Quick Actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 12 }}>
            {actions.map(a => (
              <button
                key={a.action}
                disabled={actionLoading}
                className="btn"
                style={{
                  background: "var(--button-bg)", color: "var(--button-text)", border: "none", borderRadius: 9,
                  padding: "8px 14px", fontSize: 14.5, fontWeight: 600, cursor: "pointer"
                }}
                onClick={() => doAdminAction(a.action)}
              >{a.label}</button>
            ))}
          </div>
          {actionLoading && (
            <div style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 8 }}>Performing action…</div>
          )}
          {actionMsg && (
            <div style={{
              marginTop: 4, color: "green", fontSize: 13.5, wordBreak: "break-all",
              background: "rgba(44,180,30,0.05)", borderRadius: 6, padding: 10, textAlign: "left"
            }}>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Response:</div>
              <pre style={{ margin: 0 }}>{actionMsg}</pre>
            </div>
          )}
          {actionErr && (
            <div style={{ color: "red", marginTop: 6 }}>{actionErr}</div>
          )}
        </div>
        <hr style={{ margin: "20px 0 16px 0", border: "none", borderBottom: "1.5px solid var(--border-color)" }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 15.5, marginBottom: 2 }}>Admin Dashboard Data</div>
          {loading && <div>Loading dashboard…</div>}
          {adminData && (
            <pre style={{
              fontSize: 13.2, color: "var(--text-primary)", whiteSpace: "pre-wrap", textAlign: "left",
              background: "rgba(0,0,0,0.04)", padding: 10, borderRadius: 6, maxHeight: 162, overflowY: "auto"
            }}>
              {JSON.stringify(adminData, null, 2)}
            </pre>
          )}
          {adminData?.error && (
            <div style={{ color: "red" }}>{adminData.error}</div>
          )}
        </div>
      </div>
    </div>
  );
}
