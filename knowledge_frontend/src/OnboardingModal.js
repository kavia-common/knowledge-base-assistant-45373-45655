import React, { useState } from "react";

/**
 * OnboardingModal
 * A friendly onboarding modal dialog for new users. (Shows on first visit.)
 * Steps can include welcome, file upload, search, reading results, using chart/history, etc.
 * 
 * Props:
 *   open: boolean - whether modal is open
 *   onClose: function - called when onboarding is finished/dismissed
 */
 // PUBLIC_INTERFACE
export function OnboardingModal({ open, onClose }) {
  // Simple multi-step onboarding - could extend this for a full guide.
  const steps = [
    {
      title: "Welcome to Knowledge Base Assistant!",
      description: (
        <>
          This app helps you upload documents, ask questions about them, and view answers with references and visualizations.<br /><br />
          Let's take a 1-minute tour. Click <strong>Next</strong> to continue!
        </>
      )
    },
    {
      title: "Upload Documents",
      description: (
        <>
          <ul>
            <li>Drag and drop or browse to upload PDF, DOCX, or TXT files.</li>
            <li>Your documents are analyzed for your personalized Q&A experience.</li>
          </ul>
        </>
      )
    },
    {
      title: "Ask Questions",
      description: (
        <>
          <ul>
            <li>Type a natural language question in the search box, e.g., <i>What's the project about?</i></li>
            <li>Get instant answers based on your uploaded content.</li>
          </ul>
        </>
      )
    },
    {
      title: "See Answers, References & Charts",
      description: (
        <>
          <ul>
            <li>View the answer, sources, and follow-up questions.</li>
            <li>Use charts to visualize key data extracted from your files.</li>
          </ul>
        </>
      )
    },
    {
      title: "Review Query History",
      description: (
        <>
          <ul>
            <li>Open the history panel to browse past questions and results.</li>
            <li>Great for tracking your research progress!</li>
          </ul>
        </>
      )
    },
    {
      title: "All Set!",
      description: (
        <>
          You're ready to start using the Knowledge Base Assistant.<br /><br />
          <strong>Have fun exploring!</strong>
        </>
      )
    },
  ];

  const [stepIdx, setStepIdx] = useState(0);
  if (!open) return null;

  return (
    <div 
      className="onboarding-modal-backdrop"
      style={{
        position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", zIndex: 10020,
        background: "rgba(0,0,0,0.32)", display: "flex", alignItems: "center", justifyContent: "center"
      }}
    >
      <div
        className="onboarding-modal"
        style={{
          background: "var(--bg-primary)", borderRadius: "18px", boxShadow: "0 8px 48px 0 rgba(0,0,0,0.21)",
          minWidth: 340, maxWidth: 390, padding: "33px 28px", textAlign: "center", position: "relative"
        }}
      >
        <button
          onClick={onClose}
          aria-label="Skip onboarding"
          style={{
            position: "absolute", top: 13, right: 14, background: "transparent", border: "none",
            fontSize: 25, fontWeight: 400, color: "var(--text-secondary)", cursor: "pointer"
          }}
        >×</button>
        <div style={{ fontWeight: 700, fontSize: 21, color: "var(--text-primary)", marginBottom: 3 }}>
          {steps[stepIdx].title}
        </div>
        <div style={{ fontSize: 16, color: "var(--text-primary)", margin: "10px 0 20px 0", minHeight: 58 }}>
          {steps[stepIdx].description}
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {stepIdx > 0 && (
            <button
              className="btn"
              style={{ fontSize: 15, fontWeight: 500, background: "var(--border-color)", color: "var(--text-primary)" }}
              onClick={() => setStepIdx(stepIdx - 1)}
            >Back</button>
          )}
          {stepIdx < steps.length - 1 ? (
            <button
              className="btn"
              style={{ fontSize: 15, fontWeight: 500, background: "var(--button-bg)", color: "var(--button-text)" }}
              onClick={() => setStepIdx(stepIdx + 1)}
            >Next</button>
          ) : (
            <button
              className="btn"
              style={{ fontSize: 15, fontWeight: 500, background: "var(--button-bg)", color: "var(--button-text)" }}
              onClick={onClose}
            >Finish</button>
          )}
        </div>
        <div style={{ marginTop: 13, color: "var(--text-secondary)", fontSize: 13, letterSpacing: "0.01em" }}>
          Step {stepIdx + 1} of {steps.length}
        </div>
      </div>
    </div>
  );
}
