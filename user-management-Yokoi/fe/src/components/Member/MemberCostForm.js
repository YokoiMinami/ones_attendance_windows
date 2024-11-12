import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { TextField, Autocomplete } from '@mui/material';
import axios from 'axios';

const MemberCostForm = (props) => {
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [registration, setRegistration] = useState('');
    const [registrationDate, setregistrationDate] = useState('');
    const [approver, setApprover] = useState('');
    const [president, setPresident] = useState('');
    const [remarks, setRemarks] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const currentDate = `${year}-${month}`;
    const [projectId, setprojectId] = useState();
    const [year2, setYear2] = useState(new Date().getFullYear());
    const [month2, setMonth2] = useState(new Date().getMonth() + 1);
    const [day, setDay] = useState(new Date().getDate());
    const currentDate2 = `${year2}/${month2}/${day}`;

    const [errors, setErrors] = useState({});

    // ユーザー情報を取得
    useEffect(() => {
        const id = localStorage.getItem('user');
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

    //プロジェクト情報
    useEffect(() => {
        const fetchUser = async () => {
        const accounts_id = id;
        try {
            const response = await fetch(`http://localhost:3000/projects/${accounts_id}/${year}/${month}`);
            const data = await response.json();
            
            setprojectId(data.id);
        } catch (error) {
            console.error('Error fetching holiday data:', error);
            setprojectId();
        }
        };
        fetchUser();
    }, [year, month]);

    const validateForm = () => {
        const newErrors = {};
        if (!approver) {
        newErrors.approver = '承認者を入力してください';
        } 
        if (!president) {
            newErrors.president = '社長名を入力してください';
            } 
        return newErrors;
    };

    //プロジェクト情報登録
    const submitFormAdd = async (e) => {
        e.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        return;
        }

        const registration =userData.fullname;
        const data = {
            id: projectId,
            registration: registration,
            registration_date: currentDate2,
            approver: approver,
            president: president,
            remarks: remarks
        };
        try {
            const response = await fetch('http://localhost:3000/projects_flag', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
            });
            if (response.ok) {
            alert('経費を承認しました');
            window.location.reload();
            } else {
            alert('経費の承認に失敗しました');
            }
        } catch (error) {
            console.error('Error saving data:', error);
            alert('経費の承認に失敗しました');
        }
    };

    return (
        <div>
            <form onSubmit={submitFormAdd}>
                <div id='member_cost_area'>
                    <div className='member_cost_box'>
                        <label className='member_cost_label'>承認者 : </label>
                        <input type='text' className='member_cost_input' value={approver} onChange={(e) => setApprover(e.target.value)} />
                    </div>
                    <div className='member_cost_error'>
                        {errors.approver && <p className="error">{errors.approver}</p>}
                    </div>
                    <div className='member_cost_box'>
                        <label className='member_cost_label'>社長名 : </label>
                        <input type='text' className='member_cost_input' value={president} onChange={(e) => setPresident(e.target.value)} />
                    </div>
                    <div className='member_cost_error'>
                        {errors.president && <p className="error">{errors.president}</p>}
                    </div>
                    <div className='member_cost_box'>
                        <label className='member_cost_label'>備考 : </label>
                        <textarea id='textarea_member_cost' value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                    </div>
                    <div id='projects_bt'>
                        <button type='submit' id='projects_button'>登録</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default MemberCostForm;


