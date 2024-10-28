import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FirstForm = (props) => {
    const id = localStorage.getItem('user');
    const [userData, setUserData] = useState(null);
    const [pass, setPass] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    // ユーザー情報を取得
    useEffect(() => {

        fetch(`http://localhost:3000/user/${id}`, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json'
        }
        })
        .then(response => response.json())
        .then(data => setUserData(data))
        .catch(err => console.log(err));
    }, [id]);

    const admin = userData.fullname;

    const validateForm = () => {
        const newErrors = {};
        if (!pass) newErrors.pass = 'パスワードを入力してください';
        return newErrors;
    };

    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-'); // '-'で分割
        return `${year}/${month}/${day}`; // フォーマットを変更
    };

    const submitFormEdit = async (e) => {

        e.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        return;
        }

        const currentDate = new Date().toISOString().split('T')[0];
        const formattedDate = formatDate(currentDate);

        const data = {
            fullname:admin,
            date: formattedDate,
            admin_password: pass,
        };

        try {
            const response = await fetch('http://localhost:3000/pass_post', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('データを保存しました');
                window.location.reload();
            } else {
                alert('データの保存に失敗しました');
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
                <div id='admin_error_area'>
                    {errors.pass && <p className='admin_error'>{errors.pass}</p>}
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











