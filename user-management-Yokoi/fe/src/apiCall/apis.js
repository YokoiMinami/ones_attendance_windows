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

//アカウント情報取得
export const fetchUserData = async (id) => {
  const response = await fetch(`http://localhost:3000/user/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
};

// 出勤状態を取得
export const fetchAttendanceStatus = async (id) => {
  const response = await fetch(`http://localhost:3000/attendance/status/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

//出勤登録
export const postAttendance = async (requestBody) => {
  const response = await fetch('http://localhost:3000/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.text();
};

//今日の出勤状況を取得
export const fetchCheckInTime = async (accounts_id, date) => {
  const response = await fetch(`http://localhost:3000/attendance/checkin/${accounts_id}/${date}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

//標準勤務時間を取得
export const standardTime = async (accounts_id) => {
  const response = await fetch(`http://localhost:3000/overuser/${accounts_id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

//標準勤務時間を登録
export const postStandardTime = async (data) => {
  const response = await fetch('http://localhost:3000/overtime', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.text();
};

//プロジェクト情報を取得
export const fetchProjectData = async (accounts_id, year, month) => {
  const response = await fetch(`http://localhost:3000/projects/${accounts_id}/${year}/${month}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

//プロジェクト情報を登録
export const postProjectData = async (data) => {
  const response = await fetch('http://localhost:3000/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.text();
};

//勤怠情報を取得
export const fetchAttendanceData = async (accounts_id, year, month) => {
  const response = await fetch(`http://localhost:3000/attendance/${accounts_id}/${year}/${month}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

//交通費情報を取得
export const fetchExpensesData = async (accounts_id, year, month) => {
  const response = await fetch(`http://localhost:3000/expenses/${accounts_id}/${year}/${month}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

//代休情報を取得
export const fetchHolidayData = async (accounts_id) => {
  const response = await fetch(`http://localhost:3000/holiday/${accounts_id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

//経費情報を取得
export const fetchExpensesData2 = async (accounts_id, year, month) => {
  const response = await fetch(`http://localhost:3000/api/expenses2/${accounts_id}/${year}/${month}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

//特記事項を修正
export const postRemarks = async (data) => {
  const response = await fetch('http://localhost:3000/remarks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.text();
};

//交通費登録
export const saveExpenses = async (data) => {
  try {
    const response = await fetch('http://localhost:3000/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response;
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
};

//経費申請
export const submitExpense = async (data) => {
  try {
    const response = await fetch('http://localhost:3000/projects_put', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response;
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
};

//代休登録
export const addHoliday = async (data) => {
  try {
    const response = await fetch('http://localhost:3000/holiday', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response;
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
};

//代休削除
export const deleteHoliday = async (itemId) => {
  const response = await fetch('http://localhost:3000/holiday_delete', {
    method: 'delete',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: itemId })
  });
  return await response.json();
};