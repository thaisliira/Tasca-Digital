const isServer = typeof window === 'undefined';
const BASE_URL = isServer ? 'http://backend:8080' : 'http://localhost:8080';

const fetchOptions: RequestInit = {
  credentials: 'include',
};

export async function getPosts() {
  const response = await fetch(`${BASE_URL}/posts`, fetchOptions);

  if (!response.ok) {
    if (response.status === 401) return [];
    throw new Error('Erro ao buscar as postas do balcão');
  }

  return response.json();
}

export async function createPost(content: string) {
  const response = await fetch(`${BASE_URL}/posts`, {
    ...fetchOptions,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error('Erro ao lançar posta ao balcão');
  }

  return response.json();
}

export async function deletePost(id: string) {
  const response = await fetch(`${BASE_URL}/posts/${id}`, {
    ...fetchOptions,
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Erro ao remover posta');
  }

  return true;
}

export type Comment = {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  author_id: string;
  author_name: string;
  author_color: string;
};

export async function getComments(postId: string): Promise<Comment[]> {
  const response = await fetch(`${BASE_URL}/posts/${postId}/comments`, fetchOptions);
  if (!response.ok) {
    throw new Error('Erro ao buscar palpites');
  }
  return response.json();
}

export async function createComment(postId: string, content: string): Promise<Comment> {
  const response = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
    ...fetchOptions,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    throw new Error('Erro ao lançar palpite');
  }
  return response.json();
}

export type Freguês = {
  id: string;
  name: string;
  department: string;
  avatar_color: string;
};

export type DirectMessage = {
  id: string;
  sender_id: string;
  receiver_id?: string;
  content: string;
  created_at: string;
};

export async function getFregueses(): Promise<Freguês[]> {
  const response = await fetch(`${BASE_URL}/users`, fetchOptions);
  if (!response.ok) throw new Error('Erro ao buscar a freguesia');
  return response.json();
}

export async function getConversa(friendId: string): Promise<DirectMessage[]> {
  const response = await fetch(`${BASE_URL}/messages/${friendId}`, fetchOptions);
  if (!response.ok) throw new Error('Erro ao buscar a conversa');
  return response.json();
}

export async function enviarMensagem(receiverId: string, content: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/messages`, {
    ...fetchOptions,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiver_id: receiverId, content }),
  });
  if (!response.ok) throw new Error('Erro ao enviar bilhete');
}

export async function apagarConversa(friendId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/messages/${friendId}`, {
    ...fetchOptions,
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Erro ao apagar a conversa');
}

export async function toggleReaction(postId: string, emoji: string) {
  const response = await fetch(`${BASE_URL}/posts/${postId}/reactions`, {
    ...fetchOptions,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ emoji }),
  });

  return response.ok;
}
