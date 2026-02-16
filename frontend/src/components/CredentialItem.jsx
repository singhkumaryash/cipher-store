import { useState } from "react";
import CredentialCard from "./CredentialCard.jsx";

export default function CredentialItem({ credential, onDeleted, onUpdated }) {
  const [cardOpen, setCardOpen] = useState(false);

  const platform = credential.platform?.title || "—";
  const loginId = credential.email || credential.username || "—";

  return (
    <>
      <li
        className="credential-item"
        role="button"
        tabIndex={0}
        onClick={() => setCardOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setCardOpen(true);
          }
        }}
        aria-label={`Open ${platform} credential`}
      >
        <div className="credential-info">
          <span className="credential-platform">{platform}</span>
          <span className="credential-login">{loginId}</span>
        </div>
        <span className="credential-item-arrow" aria-hidden>→</span>
      </li>

      {cardOpen && (
        <CredentialCard
          credential={credential}
          onClose={() => setCardOpen(false)}
          onDeleted={onDeleted}
          onUpdated={onUpdated}
        />
      )}
    </>
  );
}
