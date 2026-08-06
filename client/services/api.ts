// src/services/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function uploadPDF(file: File) {
  const formData = new FormData();
  formData.append('pdf', file);
  const res = await fetch(`${API_BASE}/upload/pdf`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return res.json();
}

export async function sendChatMessage(message: string) {
  const res = await fetch(`${API_BASE}/chat?message=${encodeURIComponent(message)}`);
  if (!res.ok) throw new Error(`Chat failed: ${res.statusText}`);
  return res.json();
}