import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FirstForm = (props) => {
const [pass, setPass] = useState('');
const [errors, setErrors] = useState({});
const navigate = useNavigate();

const validateForm = () => {
    const newErrors = {};
    if (!pass) newErrors.pass = 'パスワードを入力してください';
    return newErrors;
};

const submitFormEdit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
    setErrors(formErrors);
    return;
    }

    const accounts_id = localStorage.getItem('user');
    const currentDate = new Date().toISOString().split('T')[0];

    try {
    const response = await fetch(`http://localhost:3000/pass/${accounts_id}`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accounts_id, date: currentDate, admin_password: pass })
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
    <form onSubmit={submitFormEdit}>
        <div className='admin_area'>
            <div className='admin_area_box'>
                <label className='admin_label'>新しい管理者パスワード</label>
            <div>
                <input
                    type='text'
                    className='admin_input'
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                />
            </div>
            <div>
                {errors.pass && <p>{errors.pass}</p>}
            </div>
            </div>
            <div id='projects_bt'>
                <button type='submit' className='admin_button'>登録</button>
            </div>
        </div>
    </form>
);
};

export default FirstForm;











