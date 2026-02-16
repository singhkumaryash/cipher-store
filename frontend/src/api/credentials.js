import api from "./client.js";

export async function getCredentials(platform) {
  const params = platform ? { platform } : {};
  const res = await api.get("/v1/credentials", { params });
  return res.data;
}

export async function getCredential(id) {
  const res = await api.get(`/v1/credentials/${id}`);
  return res.data;
}

export async function addCredential(data) {
  const res = await api.post("/v1/credentials", data);
  return res.data;
}

export async function updateCredential(id, data) {
  const res = await api.patch(`/v1/credentials/${id}`, data);
  return res.data;
}

export async function deleteCredential(id) {
  const res = await api.delete(`/v1/credentials/${id}`);
  return res.data;
}

export async function revealPassword(id) {
  const res = await api.get(`/v1/credentials/${id}/reveal`);
  return res.data;
}
