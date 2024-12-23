import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup } from 'reactstrap';
import { TextField, Autocomplete } from '@mui/material';
import axios from 'axios';
import { costOptions } from '../../constants/selectForm';
import { fetchProjectData } from '../../apiCall/apis';

const CostForm = (props) => {

  const accounts_id = localStorage.getItem('user');
  const [expenses, setExpenses] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [registrationData, setRegistrationData] = useState(false);
  const [idData, setIdData] = useState('');
  const [formData, setFormData] = useState({
    accounts_id: '',
    date: '',
    category: '',
    amount: '',
    description: '',
    receipt_image: null,
    id: '',
    registration:false
  });
  const [errors, setErrors] = useState({});

  // プロジェクト情報取得
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await fetchProjectData(accounts_id, year, month);
        const Id = data.id;
        if (Id) {
          setIdData(Id);
        }
        if (data.registration) {
          setRegistrationData(true);
        }
        setFormData(prevFormData => ({ ...prevFormData, accounts_id: accounts_id }));
      } catch (error) {
        console.error('Error fetching project data:', error);
        setFormData(false);
        setFormData(prevFormData => ({ ...prevFormData, accounts_id: accounts_id }));
      }
    };
    fetchUser();
  }, [year, month, accounts_id]);

  useEffect(() => {
    if (props.item) {
      const { id, date, category, amount, description } = props.item;
      setFormData({ id, date, category, amount, description });
    }
  }, [props.item]);

  const onChange = (e) => {
    const { name, value } = e.target;
    
    // 更新可能なフィールドのみを更新する
    if (name !== 'accounts_id' && name !== 'receipt_image' && name !== 'registration') {
      setFormData(prevFormData => ({ ...prevFormData, [e.target.name]: value, accounts_id: accounts_id,id:idData,registration:registrationData }));
    }

    // 日付が変更された場合にコンソールに出力
    if (name === 'date') {
      const [year, month] = value.split('-');
      const formattedMonth = parseInt(month, 10); // 月を数値に変換して0を消す
      setYear(year);
      setMonth(formattedMonth);
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    const numericRegex = /^[0-9]*$/; // 数字のみを許可する正規表現

    if (!formData.date) {
      newErrors.date = '日付を入力してください';
    }
    if (!formData.category) newErrors.category = '経費科目を入力してください';
    
    if (!formData.amount) {
      newErrors.amount = '金額を入力してください';
    } else if (!numericRegex.test(formData.amount)) {
      newErrors.amount = '金額は半角数字のみ入力してください';
    }
    if (!formData.description) {
      newErrors.description = '内容を入力してください';
    } 
    return newErrors;
  };
  
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      receipt_image: e.target.files[0]
    });
  };

  const submitFormAdd = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    if(formData.registration){
      let confirmDelete = window.confirm('新しい経費を登録すると、再度承認が必要になります。新しく経費を登録しますか？');
      if (confirmDelete) {
        
        const data = new FormData();
        for (const key in formData) {
          data.append(key, formData[key]);
        }
        axios.post('http://localhost:3000/api/expenses', data)
        .then(response => {
          setExpenses([...expenses, response.data]);
          window.location.reload();
        })
        .catch(error => {
          console.error('There was an error adding the expense!', error);
        });
      }
    }else{
      let confirmDelete = window.confirm('入力した内容で経費を登録しますか？');
      if(confirmDelete){
        const data = new FormData();
        for (const key in formData) {
          data.append(key, formData[key]);
        }
        axios.post('http://localhost:3000/api/expenses', data)
        .then(response => {
          setExpenses([...expenses, response.data]);
          window.location.reload();
        })
        .catch(error => {
          console.error('There was an error adding the expense!', error);
        });
      }
    }
  };

  return (
    <div>
      <Form onSubmit={submitFormAdd} >
        <FormGroup>
          <label htmlFor="date" className='new_account_label2'>日付</label>
          <input type="date" name="date" id="date" className='new_account_input2' onChange={onChange} value={formData.date || ''}/>
          <div className='new_error2' id='date_error2'>
            {errors.date && <p className="error">{errors.date}</p>}
          </div>
        </FormGroup>
        <FormGroup>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '5vh' }}>
            <label htmlFor="category" className='new_account_label' style={{ marginRight: '5px' }}>経費科目</label>
            <Autocomplete
              options={costOptions}
              getOptionLabel={(option) => option.label}
              onChange={(event, value) => {
                setFormData({ ...formData, category: value ? value.label : '' });
              }}
              value={costOptions.find(option => option.label === formData.category) || null}
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="category"
                  id="company"
                  label="その他の場合はテキストを入力"
                  onChange={onChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#808080' },
                      '&:hover fieldset': { borderColor: '#808080' },
                      '&.Mui-focused fieldset': { borderColor: '#808080' },
                      height: '50px',
                      borderRadius: '0px'
                    },
                    '& .MuiAutocomplete-endAdornment': { display: 'none' }
                  }}
                />
              )}
              sx={{
                width: 300,
                backgroundColor: 'white',
                borderRadius: '0px',
                '& .MuiInputBase-root': {
                  height: '40px',
                  borderBottom: 'none'
                },
              }}
            />
          </div>
          <div className='new_error2' id='company_error2'>
            {errors.category && <p className="error">{errors.category}</p>}
          </div>
        </FormGroup>
        <FormGroup>
          <label htmlFor="amount" id='amount_label'>金額(税込)</label>
          <input type="number" name="amount" className='new_account_input2' onChange={onChange} value={formData.amount || ''} placeholder='数字のみ入力' />
          <div className='new_error2'>
            {errors.amount && <p className="error">{errors.amount}</p>}
          </div>
        </FormGroup>
        <FormGroup>
          <div>
              <label htmlFor="description" className='new_account_label2'>内容</label>
          </div>
          <textarea name="description" id="textarea-cost" onChange={onChange} value={formData.description || ''} />
          <div id='description_error'>
            {errors.description && <p className="error">{errors.description}</p>}
          </div>
        </FormGroup>
        <FormGroup>
          <div>
            <label htmlFor="receipt_image" id='receipt_label'>レシート</label>
          </div>
          <input type="file" id='receipt_image' name="receipt_image" onChange={handleFileChange}/>
        </FormGroup>
        <p className='receipt_text' id='receipt_text_top'>・画像から情報が鮮明に確認できること</p>
        <p className='receipt_text' id='receipt_text_mid'>・税額の内数が記載されていること</p>
        <p className='receipt_text' id='receipt_text_botom'>・登録事業者管理番号が記載されていること</p>
        <Button className='new_account_button2'>登録</Button>
      </Form>
    </div>
  );
};

export default CostForm;