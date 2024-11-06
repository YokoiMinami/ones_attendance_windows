import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useNavigate,useParams } from 'react-router-dom';
import { TextField, Autocomplete } from '@mui/material';


const CostForm = (props) => {

    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [input_year, setInputYear] = useState('');
    const [input_month, setInputMonth] = useState('');
    const [day, setDay] = useState('');
    const [weekday, setWeekday] = useState('');


    const calculateWeekday = () => {
        const date = new Date(year, month - 1, day);
        const days = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
        setWeekday(days[date.getDay()]);
    };

    // 年、月、日が変更されたときに曜日を計算
    useEffect(() => {
        if (input_year && input_month && day) {
            calculateWeekday();
        }
    }, [input_year, input_month, day]);

    const submitFormAdd = async (e) => {
        e.preventDefault();
        const accounts_id = localStorage.getItem('user');

        const data = {
            accounts_id,
            year:input_year,
            month:input_month,
            day:day,
            week: weekday
        };
        try {
            const response = await fetch('http://localhost:3000/holiday', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
            });
            if (response.ok) {
                window.location.reload();
            } else {
            alert('データの保存に失敗しました');
            }
        } catch (error) {
            console.error('Error saving data:', error);
            alert('データの保存に失敗しました');
        }
    };

    return (
    <form onSubmit={submitFormAdd}>
                        <div>
                        <input
                        type="number"
                        placeholder="年"
                        value={input_year}
                        className='h_input'
                        onChange={(e) => setInputYear(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="月"
                            value={input_month}
                            className='h_input'
                            onChange={(e) => setInputMonth(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="日"
                            value={day}
                            className='h_input'
                            onChange={(e) => setDay(e.target.value)}
                        />
                        <span>&nbsp;&nbsp;{weekday}&nbsp;&nbsp;</span>
                        </div>
                        <div id='h_button_area'>
                            <button type='submit' id='h_button'>登録</button>
                        </div>
                    </form>
    );
};

export default CostForm;


