//
// src/api.js
//
// A reusable API service/helper layer for communicating with the backend endpoints.
// Handles file upload, queries, references, chart data, history, and admin actions.
//
// PUBLIC_INTERFACE
// Each function below corresponds to a backend REST endpoint.
// Use these async functions throughout the app for API calls.
//

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

/**
 * Helper for GET requests with query params, always with trailing slash safety.
 * Ensures endpoint URLs exactly match backend FastAPI routes.
 */
async function getRequest(endpoint, params = {}) {
  // Always prefix endpoints with slash, trim any duplicate slashes
  let cleanEndpoint =
    "/" + endpoint.replace(/^\/+/, "").replace(/\/+$/, "");
  // Some backend routes (like /chart-data) expect the dash, not underscore.
  // We'll keep API surface as per OpenAPI spec

  const url = new URL(API_BASE_URL + cleanEndpoint);
  Object.keys(params).forEach((key) =>
    params[key] !== undefined && params[key] !== null
      ? url.searchParams.append(key, params[key])
      : null
  );
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok)
    throw new Error(await response.text());
  return response.json();
}

/**
 * Helper for POST requests with JSON bodies.
 * Ensures endpoint URLs exactly match backend FastAPI route definitions.
 */
async function postRequest(endpoint, body) {
  let cleanEndpoint =
    "/" + endpoint.replace(/^\/+/, "").replace(/\/+$/, "");
  const response = await fetch(API_BASE_URL + cleanEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok)
    throw new Error(await response.text());
  return response.json();
}

/**
 * Helper for file upload (multipart/form-data)
 * Ensures endpoint URLs exactly match backend FastAPI route definitions.
 */
async function postFile(endpoint, file) {
  let cleanEndpoint =
    "/" + endpoint.replace(/^\/+/, "").replace(/\/+$/, "");
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(API_BASE_URL + cleanEndpoint, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!response.ok)
    throw new Error(await response.text());
  return response.json();
}

// PUBLIC_INTERFACE
export async function uploadFile(file) {
  /**
   * Upload a file for knowledge extraction and analysis.
   * file: File object (PDF, DOCX, TXT, etc.)
   * Returns: Status & metadata
   */
  return postFile("/upload", file);
}

// PUBLIC_INTERFACE
export async function submitQuery(question) {
  /**
   * Submit a natural language query.
   * question: string (user's query)
   * Returns: { answer, references, follow_up_questions }
   */
  return postRequest("/query", { question });
}

// PUBLIC_INTERFACE
export async function getQuery(question) {
  /**
   * Fetch answer for a string query (GET variant for testing/simple queries).
   * question: string (user's query)
   * Returns: { answer, references, follow_up_questions }
   */
  return getRequest("/query", { question });
}

// PUBLIC_INTERFACE
export async function getReferences() {
  /**
   * Get the list of available reference files/sources.
   * Returns: { references: [string] }
   */
  return getRequest("/references");
}

// PUBLIC_INTERFACE
export async function getChartData(chart_type, query = null) {
  /**
   * Get chart data for given type and query.
   * chart_type: string ("bar", "line", etc.)
   * query: string (optional) - chart context/filter
   * Returns: { chart_type, labels, values }
   */
  return getRequest("/chart-data", { chart_type, query });
}

// PUBLIC_INTERFACE
export async function getHistory() {
  /**
   * Get user query/answer history.
   * Returns: { history: [{ question, answer, timestamp }, ...] }
   */
  return getRequest("/history");
}

// PUBLIC_INTERFACE
export async function getAdminData() {
  /**
   * Get admin portal data.
   * Returns: admin dashboard information (stub)
   */
  return getRequest("/admin");
}

// PUBLIC_INTERFACE
export async function performAdminAction(action) {
  /**
   * Perform an admin action (reprocessing, etc.).
   * action: string (specifying the admin task)
   * Returns: stub result for the performed action
   */
  return postRequest("/admin", { action });
}
