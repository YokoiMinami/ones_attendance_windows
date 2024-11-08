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
    const [state, setState] = useState({
        id: 0,
        date: '',
        subject: '',
        money: '',
        details: '',
    });

    const [subjectState, setSubjectState] = useState({ subject: '' });
    const [errors, setErrors] = useState({});
    const [file, setFile] = useState(null);

    useEffect(() => {
        if (props.item) {
        const { id, date, subject, money, details } = props.item;
        setState({ id, date, subject, money, details });
        setSubjectState({ subject });
        }
    }, [props.item]);

    const onChange = (e) => {
        setState({ ...state, [e.target.name]: e.target.value });
    };

    const subjectOnChange = (event, value) => {
        setSubjectState({ subject: value ? value.label : '' });
    };

    const validateForm = () => {
        const newErrors = {};
        const numericRegex = /^[0-9]*$/; // 数字のみを許可する正規表現
        const dateRegex = /^\d{4}\/\d{2}\/\d{2}$/; // yyyy/mm/dd形式を許可する正規表現

        if (!state.date) {
            newErrors.date = '日付を入力してください';
        } else if (!dateRegex.test(state.date)) {
            newErrors.date = '日付はYYYY/MM/DD形式で入力してください';
        }
        if (!subjectState.subject) newErrors.subject = '経費科目を入力してください';
        
        if (!state.money) {
            newErrors.money = '金額を入力してください';
        } else if (!numericRegex.test(state.money)) {
            newErrors.money = '金額は半角数字のみ入力してください';
        }
        if (!state.details) {
            newErrors.details = '内容を入力してください';
        } 
        
        return newErrors;
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     const formData = new FormData();
    //     formData.append('image', file);
    
    //     try {
    //         const response = await axios.post('http://localhost:3000/upload', formData, {
    //         headers: {
    //             'Content-Type': 'multipart/form-data',
    //         },
    //         });
    //         console.log(response.data);
    //     } catch (error) {
    //         console.error('Error uploading image:', error);
    //     }
    // };

    // const submitFormAdd = async (e) => {
    //     e.preventDefault();
        
    //     const formErrors = validateForm();
    //     if (Object.keys(formErrors).length > 0) {
    //         setErrors(formErrors);
    //         return;
    //     }
    
    //     const fileDate = state.date;
    //     // ファイルアップロードの処理
    //     const formData = new FormData();
    //     formData.append('image', file);
    
    //     try {
    //         let uploadResponse;
    //         try {
    //             uploadResponse = await axios.post(`http://localhost:3000/upload/${accounts_id}/${fileDate}`, formData, {
    //                 headers: {
    //                     'Content-Type': 'multipart/form-data',
    //                 },
    //             });
    //             console.log(uploadResponse.data);
    //         } catch (uploadError) {
    //             console.error('Error uploading image:', uploadError);
    //         }
    
    //         // フォームデータの送信
    //         const response = await fetch('http://localhost:3000/cost_post', {
    //             method: 'post',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify({
    //                 accounts_id,
    //                 date: state.date,
    //                 subject: subjectState.subject,
    //                 money: state.money,
    //                 details: state.details,
    //             })
    //         });
    //         const item = await response.json();
    //         if (item) {
    //             props.addItemToState(item[0]);
    //             props.toggle();
    //         } else {
    //             console.log('failure');
    //         }
    //     } catch (error) {
    //         console.error('Error submitting form:', error);
    //     }
    // };
    

    const submitFormAdd = async (e) => {
        e.preventDefault();
        
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }
    
        const fileDate = state.date;
        const formData = new FormData();
        formData.append('image', file);
    
        try {
            // 画像アップロードの処理
            const uploadResponse = await axios.post('http://localhost:3000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(uploadResponse.data);
    
            // フォームデータの送信
            const response = await fetch('http://localhost:3000/cost_post', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    accounts_id,
                    date: state.date,
                    subject: subjectState.subject,
                    money: state.money,
                    details: state.details,
                })
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const item = await response.json();
            if (item) {
                props.addItemToState(item[0]);
                props.toggle();
            } else {
                console.log('failure');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
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
            id: state.id,
            date: state.date,
            subject: subjectState.subject,
            money: state.money,
            details: state.details,
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
                <input type="text" name="date" id="date" className='new_account_input2' onChange={onChange} value={state.date || ''} placeholder='YYYY/MM/DD' />
                <div className='new_error2' id='date_error2'>
                {errors.date && <p className="error">{errors.date}</p>}
                </div>
            </FormGroup>
            <FormGroup>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '5vh' }}>
                    <label htmlFor="subject" className='new_account_label' style={{ marginRight: '5px' }}>経費科目</label>
                    <Autocomplete options={options} getOptionLabel={(option) => option.label} onChange={subjectOnChange} value={options.find(option => option.label === subjectState.subject) || null}
                    renderInput={(params) => (
                    <TextField {...params} name="subject" id="company" label="その他の場合はテキストを入力" onChange={onChange}
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
                    {errors.subject && <p className="error">{errors.subject}</p>}
                </div>
            </FormGroup>
            <FormGroup className='money_form'>
                <label htmlFor="money" id='money_label'>金額(税込)</label>
                <input type="text" name="money" className='new_account_input2' onChange={onChange} value={state.money || ''} placeholder='数字のみ入力' />
                <div className='new_error2' id='money_error2'>
                {errors.money && <p className="error">{errors.money}</p>}
            </div>
            </FormGroup>
            <FormGroup>
                <input type="file" onChange={handleFileChange} />
            </FormGroup>
            <FormGroup>
                <div>
                    <label htmlFor="details" className='new_account_label2'>内容</label>
                </div>
                <textarea name="details" id="textarea-cost" onChange={onChange} value={state.details || ''} />
                <div id='details_error'>
                {errors.details && <p className="error">{errors.details}</p>}
                </div>
            </FormGroup>
            <Button className='new_account_button2'>登録</Button>
        </Form>
        {/* <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
        </form> */}
        </div>
    );
};

export default CostForm;
