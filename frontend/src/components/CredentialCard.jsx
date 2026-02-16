import { useState } from "react";
import * as credentialsApi from "../api/credentials.js";
import EditCredential from "./EditCredential.jsx";

export default function CredentialCard({ credential, onClose, onDeleted, onUpdated }) {
  const [password, setPassword] = useState(null);
  const [loadingReveal, setLoadingReveal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);

  const platform = credential.platform?.title || "—";
  const websiteUrl = credential.platform?.websiteUrl;
  const username = credential.username || null;
  const email = credential.email || null;

  async function handleReveal() {
    if (password !== null) {
      setPassword(null);
      return;
    }
    setLoadingReveal(true);
    try {
      const res = await credentialsApi.revealPassword(credential._id);
      setPassword(res.data?.password ?? "—");
    } catch {
      setPassword("(error)");
    } finally {
      setLoadingReveal(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this credential?")) return;
    setDeleting(true);
    try {
      await credentialsApi.deleteCredential(credential._id);
      onClose();
      onDeleted();
    } finally {
      setDeleting(false);
    }
  }

  function handleUpdated() {
    setEditing(false);
    onUpdated();
  }

  function copyToClipboard(text, label) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const el = document.activeElement;
      if (el?.blur) el.blur();
    });
  }

  return (
    <div className="modal-overlay credential-card-overlay" onClick={onClose}>
      <div className="credential-card modal" onClick={(e) => e.stopPropagation()}>
        <div className="credential-card-header">
          <h2 className="credential-card-title">{platform}</h2>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="credential-card-body">
          {websiteUrl && (
            <div className="credential-card-row">
              <span className="credential-card-label">Website</span>
              <a
                href={websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="credential-card-value link"
              >
                {websiteUrl}
              </a>
            </div>
          )}

          {username != null && username !== "" && (
            <div className="credential-card-row">
              <span className="credential-card-label">Username</span>
              <div className="credential-card-value-wrap">
                <span className="credential-card-value">{username}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-small btn-copy"
                  onClick={() => copyToClipboard(username, "Username")}
                  aria-label="Copy username"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {email != null && email !== "" && (
            <div className="credential-card-row">
              <span className="credential-card-label">Email</span>
              <div className="credential-card-value-wrap">
                <span className="credential-card-value">{email}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-small btn-copy"
                  onClick={() => copyToClipboard(email, "Email")}
                  aria-label="Copy email"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          <div className="credential-card-row">
            <span className="credential-card-label">Password</span>
            <div className="credential-card-value-wrap">
              {password === null ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-small"
                  onClick={handleReveal}
                  disabled={loadingReveal}
                >
                  {loadingReveal ? "…" : "Reveal"}
                </button>
              ) : (
                <>
                  <code className="credential-card-password">{password}</code>
                  <button
                    type="button"
                    className="btn btn-ghost btn-small btn-copy"
                    onClick={() => copyToClipboard(password, "Password")}
                    aria-label="Copy password"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    onClick={handleReveal}
                  >
                    Hide
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="credential-card-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn btn-ghost danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      {editing && (
        <EditCredential
          credential={credential}
          onClose={() => setEditing(false)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
