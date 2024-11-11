import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { TextField, Autocomplete } from '@mui/material';
import axios from 'axios';

const options = [
  { label: '通信費', value: '通信費' },
  { label: '接待交際費', value: '接待交際費' },
  { label: '消耗品費', value: '消耗品費' },
  { label: '修繕費', value: '修繕費' },
  { label: '雑費', value: '雑費' },
  { label: '仮払金', value: '仮払金' },
  { label: '交通費', value: '交通費' },
  { label: '旅費交通費', value: '旅費交通費' },
];

const CostForm = (props) => {

  const accounts_id = localStorage.getItem('user');
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    accounts_id: accounts_id,
    date: '',
    category: '',
    amount: '',
    description: '',
    receipt: null
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (props.item) {
      const { id, date, category, amount, description } = props.item;
      setFormData({ id, date, category, amount, description });
    }
  }, [props.item]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    const numericRegex = /^[0-9]*$/; // 数字のみを許可する正規表現
    const dateRegex = /^\d{4}\/\d{2}\/\d{2}$/; // yyyy/mm/dd形式を許可する正規表現

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
  };

  const submitFormEdit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
  try {
    const response = await fetch('http://localhost:3000/put', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: formData.id,
        date: formData.date,
        category: formData.category,
        amount: formData.amount,
        description: formData.description,
      })
    });
    const item = await response.json();
    if (item) {
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
    <div>
      <Form onSubmit={props.item ? submitFormEdit : submitFormAdd}>
        <FormGroup>
          <label htmlFor="date" className='new_account_label2'>日付</label>
          <input type="date" name="date" id="date" className='new_account_input2' onChange={onChange} value={formData.date || ''} placeholder='YYYY/MM/DD' />
          <div className='new_error2' id='date_error2'>
            {errors.date && <p className="error">{errors.date}</p>}
          </div>
        </FormGroup>
        <FormGroup>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '5vh' }}>
            <label htmlFor="category" className='new_account_label' style={{ marginRight: '5px' }}>経費科目</label>
            <Autocomplete
              options={options}
              getOptionLabel={(option) => option.label}
              onChange={(event, value) => {
                setFormData({ ...formData, category: value ? value.label : '' });
              }}
              value={options.find(option => option.label === formData.category) || null}
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