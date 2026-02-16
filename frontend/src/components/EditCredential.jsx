import { useState } from "react";
import * as credentialsApi from "../api/credentials.js";

export default function EditCredential({ credential, onClose, onUpdated }) {
  const [username, setUsername] = useState(credential.username ?? "");
  const [email, setEmail] = useState(credential.email ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {};
    if (username.trim() !== (credential.username ?? "")) payload.username = username.trim();
    if (email.trim() !== (credential.email ?? "")) payload.email = email.trim();
    if (password) payload.password = password;
    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await credentialsApi.updateCredential(credential._id, payload);
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit credential</h2>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error">{error}</div>}
          <p className="muted">Platform: {credential.platform?.title ?? "—"}</p>
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            New password (leave blank to keep)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
