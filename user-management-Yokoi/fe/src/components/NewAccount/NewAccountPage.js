import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import OnesLogo from '../../images/ones-logo.png';
import AccountLogo from '../../images/account-logo.png';
import { Button, Form, FormGroup } from 'reactstrap';
import { TextField, Autocomplete } from '@mui/material';

const NewAccountPage = (props) => {

  const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
  ];

  const [company_state, setCompanyState] = React.useState({ company: '' });

  const companyOnChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.value });
  };

  const [state, setState] = useState({
    id: 0,
    company: '',
    fullname: '',
    kananame: '',
    email: '',
    team: '',
    password: '',
    authority: 'false'
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const onChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!state.company) newErrors.company = '会社名を入力してください';
    if (!state.fullname) newErrors.fullname = '氏名を入力してください';
    if (!state.kananame) newErrors.kananame = 'ヨミガナを入力してください';
    if (!state.email) {
      newErrors.email = 'Emailを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(state.email)) {
      newErrors.email = '有効なEmailを入力してください';
    }
    if (!state.team) newErrors.phone = '所属するチームを入力してください';
    if (!state.password) newErrors.password = 'パスワードを入力してください';
    return newErrors;
  };

  const submitFormAdd = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        return;
      }
    fetch('http://localhost:3000/post', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullname: state.fullname,
        email: state.email,
        phone: state.phone,
        password: state.password
      })
    })
      .then(response => response.json())
      .then(item => {
        if (item.dbError) {
          if (item.dbError.includes('メールアドレス')) {
            setErrors({ email: 'このメールアドレスは既に登録されています' });
          }
        } else if (item) {
          const userId = item.map(item => item.id);
          // 登録した情報を表示するページに遷移
          navigate(`/new_account_after/${userId}`); 
        } else {
          console.log('failure');
        }
      })
      .catch(err => console.log(err));
  };

  return (
    <div id='new_account_page'>
      <div id='new_account_ones'>
        <img src={OnesLogo} alt="Ones" style={{ width: '150px', height: '150px', objectFit: 'cover' }} />
      </div>
      <div id='new_account_logo'>
        <img src={AccountLogo} alt="Account" style={{ width: '200px', height: '200px', objectFit: 'cover' }} />
      </div>
      <Form onSubmit={submitFormAdd} className='new_account_form'>
        <FormGroup>
          <label htmlFor="company" className='new_account_label'>会社名</label>
          <Autocomplete
      options={options}
      getOptionLabel={(option) => option.label}
      renderInput={(params) => (
        <TextField
          {...params}
          label="選択肢"
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'white',
              },
              '&:hover fieldset': {
                borderColor: 'white',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white',
              },
              height: '50px', // ここで高さを指定
            },
          }}
        />
      )}
      sx={{
        width: 300,
        backgroundColor: 'white',
        borderRadius: '5px',
        '& .MuiInputBase-root': {
          padding: '10px',
          height: '45px', // ここで高さを指定
        },
      }}
    />
          <input type="text" name="company" id="company" className='new_account_input' onChange={onChange} value={state.company || ''} />
          <div className='new_error' id='name_error'>
          {errors.company && <p className="error">{errors.company}</p>}
          </div>
        </FormGroup>
        <FormGroup>
          <label htmlFor="fullname" className='new_account_label'>氏名</label>
          <input type="text" name="fullname" id="fullname" className='new_account_input' onChange={onChange} value={state.fullname || ''} />
          <div className='new_error' id='name_error'>
          {errors.fullname && <p className="error">{errors.fullname}</p>}
          </div>
        </FormGroup>
        <FormGroup>
          <label htmlFor="kananame" className='new_account_label'>ヨミガナ</label>
          <input type="text" name="kananame" id="kananame" className='new_account_input' onChange={onChange} value={state.kananame || ''} />
          <div className='new_error' id='name_error'>
          {errors.kananame && <p className="error">{errors.kananame}</p>}
          </div>
        </FormGroup>
        <FormGroup>
          <label htmlFor="email" className='new_account_label'>Email</label>
          <input type="email" name="email" id="email" className='new_account_input' onChange={onChange} value={state.email || ''} />
          <div className='new_error' id='email_error'>
          {errors.email && <p className="error">{errors.email}</p>}
          </div>
        </FormGroup>
        <FormGroup>
          <label htmlFor="team" className='new_account_label'>所属チーム</label>
          <input type="text" name="team" id="team" className='new_account_input' onChange={onChange} value={state.team || ''} />
          <div className='new_error' id='team_error'>
          {errors.team && <p className="error">{errors.team}</p>}
          </div>
        </FormGroup>
        <FormGroup>
          <label htmlFor="password" className='new_account_label'>パスワード</label>
          <input type="text" name="password" id="password" className='new_account_input' onChange={onChange} value={state.password || ''} />
          <div className='new_error' id='pass_error'>
          {errors.password && <p className="error">{errors.password}</p>}
          </div>
        </FormGroup>
        <FormGroup>
          <label htmlFor="authority" className='new_account_label'>利用権限</label>
          <input type="text" name="authority" id="authority" className='new_account_input' onChange={onChange} value={state.authority || ''} />
          <div className='new_error' id='authority_error'>
          {errors.authority && <p className="error">{errors.authority}</p>}
          </div>
        </FormGroup>
        <Button className='new_account_button'>登録</Button>
      </Form>
      <div>
        <Link to="/login" id='login_link'>←ログインページ</Link>
      </div>
    </div>
  );
};

export default NewAccountPage;
