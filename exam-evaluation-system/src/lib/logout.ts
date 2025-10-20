// src/lib/logout.ts
export async function logout() {
  await fetch("/api/auth/signout", { method: "POST" });
  window.location.href = "/"; // redirect after logout
}