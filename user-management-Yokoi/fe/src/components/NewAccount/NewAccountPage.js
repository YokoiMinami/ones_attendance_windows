import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import OnesLogo from '../../images/ones-logo.png';
import AccountLogo from '../../images/account-logo.png';
import { Button, Form, FormGroup } from 'reactstrap';
import { TextField, Autocomplete } from '@mui/material';
import {  submitFormAddApi } from '../../apiCall/apis';
import { companyOptions, teamOptions } from '../../constants/selectForm';
import { EMAIL_ERROR_MESSAGE, COMPANY_ERROR, FULLNAME_ERROR, KANANAME_ERROR, KANANAME_FORMAT_ERROR, EMAIL_ERROR, EMAIL_FORMAT_ERROR, TEAM_ERROR, PASSWORD_ERROR, PASSWORD_FORMAT_ERROR } from '../../constants/messages';

const NewAccountPage = (props) => {

  const [company_state, setCompanyState] = React.useState({ company: '' });
  const [team_state, setTeamState] = React.useState({ team: '' });

  const companyOnChange = (event, value) => {
    setCompanyState({ company: value ? value.label : '' });
  };

  const teamOnChange = (event, value) => {
    setTeamState({ team: value ? value.label : '' });
  };

  const [state, setState] = useState({
    id: 0,
    fullname: '',
    kananame: '',
    email: '',
    password: '',
    authority: ''
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const onChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    const katakanaRegex = /^[ァ-ヶー　]*$/; // カタカナのみを許可する正規表現
    const alphanumericRegex = /^[a-zA-Z0-9]*$/; // 英数字のみを許可する正規表現

    if (!company_state.company) newErrors.company = COMPANY_ERROR;
    if (!state.fullname) newErrors.fullname = FULLNAME_ERROR;
    if (!state.kananame) {
      newErrors.kananame = KANANAME_ERROR;
    } else if (!katakanaRegex.test(state.kananame)) {
      newErrors.kananame = KANANAME_FORMAT_ERROR;
    }
    if (!state.email) {
      newErrors.email = EMAIL_ERROR;
    } else if (!/\S+@\S+\.\S+/.test(state.email)) {
      newErrors.email = EMAIL_FORMAT_ERROR;
    }
    if (!team_state.team) newErrors.team = TEAM_ERROR;
    if (!state.password) {
      newErrors.password = PASSWORD_ERROR;
    } else if (!alphanumericRegex.test(state.password)) {
      newErrors.password = PASSWORD_FORMAT_ERROR;
    }

    return newErrors;
  };

  const submitFormAdd = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
  
    const data = {
      company: company_state.company,
      fullname: state.fullname,
      kananame: state.kananame,
      email: state.email,
      team: team_state.team,
      password: state.password,
      authority: state.authority
    };
  
    submitFormAddApi(data)
    .then(item => {
      if (item.dbError) {
        if (item.dbError.includes('メールアドレス')) {
          setErrors({ email: EMAIL_ERROR_MESSAGE });
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
        <img src={AccountLogo} alt="Account" style={{ width: '180px', height: '180px', objectFit: 'cover' }} />
      </div>
      <Form onSubmit={submitFormAdd} className='new_account_form'>
        <FormGroup>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '5vh' }}>
            <label htmlFor="company" className='new_account_label' style={{ marginRight: '5px' }}>会社名</label>
            <Autocomplete options={companyOptions} getOptionLabel={(option) => option.label} onChange={companyOnChange} value={companyOptions.find(option => option.label === company_state.company) || null}
            renderInput={(params) => (
            <TextField {...params} name="company" id="company" className='new_account_input' label="その他の場合はテキストを入力" onChange={onChange}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'transparent', // ボーダーを透明に設定
            },'&:hover fieldset': {
            borderColor: 'transparent', // ホバー時のボーダーを透明に設定
            },
            '&.Mui-focused fieldset': {
              borderColor: 'transparent', // フォーカス時のボーダーを透明に設定
            },
            height: '50px',
            borderRadius: '0px', // 角を丸くしない
            },'& .MuiAutocomplete-endAdornment': {
            display: 'none', // ドロップダウンアイコンを非表示
            },}}/>)}
            sx={{width: 300, backgroundColor: 'white', borderRadius: '0px', // 角を丸くしない
            '& .MuiInputBase-root': { height: '40px',
            borderBottom: 'none', // 下部のボーダーを削除
            },}}/>
          </div>
          <div className='new_error' id='company_error'>
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
          <div className='new_error' id='kananame_error'>
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '5vh' }}>
            <label htmlFor="team" className='new_account_label' style={{ marginRight: '5px' }}>所属チーム</label>
            <Autocomplete options={teamOptions} getOptionLabel={(option) => option.label} onChange={teamOnChange} value={teamOptions.find(option => option.label === team_state.team) || null}
            renderInput={(params) => (
            <TextField {...params} name="team" id="team" className='new_account_input' label="その他の場合はテキストを入力" onChange={onChange} 
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'transparent', // ボーダーを透明に設定
            },'&:hover fieldset': {
            borderColor: 'transparent', // ホバー時のボーダーを透明に設定
            },
            '&.Mui-focused fieldset': {
              borderColor: 'transparent', // フォーカス時のボーダーを透明に設定
            },
            height: '50px',
            borderRadius: '0px', // 角を丸くしない
            },'& .MuiAutocomplete-endAdornment': {
            display: 'none', // ドロップダウンアイコンを非表示
            },}}/>)}
            sx={{width: 300, backgroundColor: 'white', borderRadius: '0px', // 角を丸くしない
            '& .MuiInputBase-root': { height: '40px',
            borderBottom: 'none', // 下部のボーダーを削除
            },}}/>
          </div>
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
          <input type="text" name="authority" placeholder='管理者のみ入力' id="authority" className='new_account_input' onChange={onChange} value={state.authority || ''} />
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
