import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import * as credentialsApi from "../api/credentials.js";
import CredentialList from "../components/CredentialList.jsx";
import AddCredential from "../components/AddCredential.jsx";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  async function loadCredentials() {
    setLoading(true);
    setError("");
    try {
      const res = await credentialsApi.getCredentials(platformFilter || undefined);
      setCredentials(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load credentials");
      setCredentials([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCredentials();
  }, [platformFilter]);

  async function handleAdded() {
    setShowAdd(false);
    loadCredentials();
  }

  async function handleDeleted() {
    loadCredentials();
  }

  async function handleUpdated() {
    loadCredentials();
  }

  const platforms = [...new Set(credentials.map((c) => c.platform?.title).filter(Boolean))].sort();

  return (
    <div className="page dashboard-page">
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="app-logo">Cipher Store</h1>
          <span className="user-name">{user?.fullname || user?.username}</span>
        </div>
        <div className="header-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(true)}>
            Add credential
          </button>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="toolbar">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="filter-select"
            aria-label="Filter by platform"
          >
            <option value="">All platforms</option>
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="form-error">{error}</div>}
        {loading ? (
          <div className="center py-4">
            <div className="loader" />
          </div>
        ) : (
          <CredentialList
            credentials={credentials}
            onDeleted={handleDeleted}
            onUpdated={handleUpdated}
          />
        )}

        {credentials.length === 0 && !loading && (
          <p className="empty-state">No credentials yet. Add one to get started.</p>
        )}
      </main>

      {showAdd && (
        <AddCredential onClose={() => setShowAdd(false)} onAdded={handleAdded} />
      )}
    </div>
  );
}
