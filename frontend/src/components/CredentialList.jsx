import CredentialItem from "./CredentialItem.jsx";

export default function CredentialList({ credentials, onDeleted, onUpdated }) {
  return (
    <ul className="credential-list">
      {credentials.map((cred) => (
        <CredentialItem
          key={cred._id}
          credential={cred}
          onDeleted={onDeleted}
          onUpdated={onUpdated}
        />
      ))}
    </ul>
  );
}
