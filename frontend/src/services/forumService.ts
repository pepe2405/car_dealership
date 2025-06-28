const API = '/api/forums';

export async function getForums(token: string) {
  const res = await fetch(API, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

export async function createForum(data: { title: string; description: string }, token: string) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteForum(id: string, token: string) {
  await fetch(`${API}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
}

export async function addComment(forumId: string, content: string, token: string) {
  const res = await fetch(`${API}/${forumId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content }),
  });
  return res.json();
}

export async function deleteComment(forumId: string, commentId: string, token: string) {
  await fetch(`${API}/${forumId}/comments/${commentId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
} 