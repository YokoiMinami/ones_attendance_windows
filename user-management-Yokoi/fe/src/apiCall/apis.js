//ログイン
export const loginUser = async (email, password) => {
  const response = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error logging in');
  }
  return data;
};

//アカウント登録
export const submitFormAddApi = async (data) => {
  const response = await fetch('http://localhost:3000/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};

//アカウント情報
export const fetchUserData = async (id) => {
  const response = await fetch(`http://localhost:3000/user/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
