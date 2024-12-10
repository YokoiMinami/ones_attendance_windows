import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { TextField, Autocomplete } from '@mui/material';
import { companyOptions, teamOptions } from '../../constants/selectForm';
import { updateUser } from '../../apiCall/apis';
import { EMAIL_ERROR_MESSAGE } from '../../constants/messages';

const MemberForm = (props) => {

  const [state, setState] = useState({
    id: 0,
    company: '',
    fullname: '',
    kananame: '',
    email: '',
    team: '',
    password: '',
    authority: ''
  });

  const [companyState, setCompanyState] = useState({ company: '' });
  const [teamState, setTeamState] = useState({ team: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (props.item) {
      const { id,company, fullname,kananame, email, team, authority } = props.item;
      setState({ id,company, fullname,kananame, email, team, authority });
      setCompanyState({company});
      setTeamState({team});
    }
  }, [props.item]);

  const onChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const companyOnChange = (event, value) => {
    setCompanyState({ company: value ? value.label : '' });
  };

  const teamOnChange = (event, value) => {
    setTeamState({ team: value ? value.label : '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!companyState.company) newErrors.company = '会社名を入力してください';
    if (!state.fullname) newErrors.fullname = '氏名を入力してください';
    if (!state.kananame) newErrors.kananame = 'ヨミガナを入力してください';
    if (!state.email) {
      newErrors.email = 'Emailを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(state.email)) {
      newErrors.email = '有効なEmailを入力してください';
    }
    if (!teamState.team) newErrors.team = '所属するチームを入力してください';
    return newErrors;
  };
  
  const submitFormEdit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    try {
      const data = {
        id: state.id,
        company: companyState.company,
        fullname: state.fullname,
        kananame: state.kananame,
        email: state.email,
        team: teamState.team,
        password: state.password,
        authority: state.authority
      };
      const item = await updateUser(data);
      if (item.dbError) {
        if (item.dbError.includes('メールアドレス')) {
          setErrors({ email: EMAIL_ERROR_MESSAGE });
        }
      }else if (item) {
        props.updateState(item);
        props.toggle();
        window.location.reload();
      } else {
        console.log('failure');
      }
    } catch (err) {
      console.log(err);
    }
  };
  
  return (
    <Form onSubmit={submitFormEdit}>
      <FormGroup>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '5vh' }}>
          <label htmlFor="company" className='new_account_label' style={{ marginRight: '5px' }}>会社名</label>
          <Autocomplete options={companyOptions} getOptionLabel={(option) => option.label} onChange={companyOnChange} value={companyOptions.find(option => option.label === companyState.company) || null}
          renderInput={(params) => (
          <TextField {...params} name="company" id="company" label="その他の場合はテキストを入力" onChange={onChange}
          sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#808080', // ボーダーを透明に設定
          },'&:hover fieldset': {
          borderColor: '#808080', // ホバー時のボーダーを透明に設定
          },
          '&.Mui-focused fieldset': {
            borderColor: '#808080', // フォーカス時のボーダーを透明に設定
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
        <div className='new_error2' id='company_error2'>
          {errors.company && <p className="error">{errors.company}</p>}
        </div>
      </FormGroup>
      <FormGroup>
        <label htmlFor="fullname" className='new_account_label2'>氏名</label>
        <input type="text" name="fullname" id="fullname" className='new_account_input2' onChange={onChange} value={state.fullname || ''} />
        <div className='new_error2' id='name_error2'>
        {errors.fullname && <p className="error">{errors.fullname}</p>}
        </div>
      </FormGroup>
      <FormGroup className='member_new_form'>
        <label htmlFor="kananame" className='new_account_label2'>ヨミガナ</label>
        <input type="text" name="kananame" id="kananame" className='new_account_input2' onChange={onChange} value={state.kananame || ''} />
        <div className='new_error2' id='kananame_error2'>
        {errors.kananame && <p className="error">{errors.kananame}</p>}
        </div>
      </FormGroup>
      <FormGroup>
        <label htmlFor="email" className='new_account_label2'>Email</label>
        <input type="email" name="email" id="email" className='new_account_input2' onChange={onChange} value={state.email || ''} />
        <div className='new_error2' id='email_error2'>
        {errors.email && <p className="error">{errors.email}</p>}
        </div>
      </FormGroup>
      <FormGroup>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '5vh' }}>
          <label htmlFor="team" className='new_account_label' style={{ marginRight: '5px' }}>所属チーム</label>
          <Autocomplete options={teamOptions} getOptionLabel={(option) => option.label} onChange={teamOnChange} value={teamOptions.find(option => option.label === teamState.team) || null}
          renderInput={(params) => (
          <TextField {...params} name="team" id="team" className='new_account_input' label="その他の場合はテキストを入力" onChange={onChange} 
          sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#808080', // ボーダーを透明に設定
          },'&:hover fieldset': {
          borderColor: '#808080', // ホバー時のボーダーを透明に設定
          },
          '&.Mui-focused fieldset': {
            borderColor: '#808080', // フォーカス時のボーダーを透明に設定
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
        <div className='new_error2' id='team_error2'>
          {errors.team && <p className="error">{errors.team}</p>}
        </div>
      </FormGroup>
      <FormGroup>
        <label htmlFor="authority" className='new_account_label2'>利用権限</label>
        <input type="text" name="authority" placeholder='管理者のみ入力' id="authority" className='new_account_input2' onChange={onChange} value={state.authority || ''} />
        <div className='new_error2' id='authority_error2'>
        {errors.authority && <p className="error">{errors.authority}</p>}
        </div>
      </FormGroup>
      <Button className='new_account_button2'>登録</Button>
    </Form>
  );
};

export default MemberForm;

