import api from "./client.js";

export async function getPlatforms(title) {
  const params = title ? { title } : {};
  const res = await api.get("/v1/platforms", { params });
  return res.data;
}

export async function getPlatform(id) {
  const res = await api.get(`/v1/platforms/${id}`);
  return res.data;
}

export async function addPlatform(data) {
  const res = await api.post("/v1/platforms", data);
  return res.data;
}

export async function updatePlatform(id, data) {
  const res = await api.patch(`/v1/platforms/${id}`, data);
  return res.data;
}

export async function deletePlatform(id) {
  const res = await api.delete(`/v1/platforms/${id}`);
  return res.data;
}
