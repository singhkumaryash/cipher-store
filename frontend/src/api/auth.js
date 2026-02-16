import api from "./client.js";

export async function register(data) {
  const res = await api.post("/v1/users/register", data);
  return res.data;
}

export async function login(data) {
  const res = await api.post("/v1/users/login", data);
  return res.data;
}

export async function logout() {
  const res = await api.post("/v1/users/logout");
  return res.data;
}

export async function changePassword(oldPassword, newPassword) {
  const res = await api.patch("/v1/users/change-password", { oldPassword, newPassword });
  return res.data;
}

export async function updateProfile(data) {
  const res = await api.patch("/v1/users/update", data);
  return res.data;
}
