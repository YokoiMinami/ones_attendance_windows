import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import OnesLogo from '../../images/ones-logo.png';
import { loginUser } from '../../apiCall/apis';
import { LOGIN_ERROR_MESSAGE, GENERAL_ERROR_MESSAGE } from '../../constants/messages';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(email, password);
      if (data.token) {
        login(data.token, data.user); 
        navigate('/'); 
      } else {
        setMessage(LOGIN_ERROR_MESSAGE);
      }
    } catch (err) {
      setMessage(GENERAL_ERROR_MESSAGE);
    }
  };

  return (
    <div className='LoginPage'>
      <img src={OnesLogo} alt="Ones" />
      <form onSubmit={handleSubmit}>
        <div>
          <input type="email" name='email' id='login_email_input' value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" required />
        </div>
        <div>
          <input type="password" name='password' id='login_password_input' value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        </div>
        <div>
          <button type="submit" id='login_button'>ログイン</button>
        </div>
      </form>
      <div id ='login_message'>
        {message && <p>{message}</p>}
      </div>
      <div id='new_account_text'>
        アカウントをお持ちでない方は<Link to="/new_account" id='new_account_link'>新規登録</Link>
      </div>
    </div>
  );
}

export default LoginPage;