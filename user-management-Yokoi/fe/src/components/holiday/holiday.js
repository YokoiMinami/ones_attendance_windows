import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const HolidayPage = () => {
    const id = localStorage.getItem('user');
    const [userData, setUserData] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [input_year, setInputYear] = useState('');
    const [input_month, setInputMonth] = useState('');
    const [day, setDay] = useState('');
    const [weekday, setWeekday] = useState('');
    const [userHoliday, setUserHoliday] = useState();

    const calculateWeekday = () => {
        const date = new Date(year, month - 1, day);
        const days = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
        setWeekday(days[date.getDay()]);
    };

    // 年、月、日が変更されたときに曜日を計算
    useEffect(() => {
        if (year && month && day) {
            calculateWeekday();
        }
    }, [year, month, day]);

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

    //ユーザーの代休情報を取得
    useEffect(() => {
        const fetchHoliday = async () => {
        const accounts_id = localStorage.getItem('user');
        try {
            const response = await fetch(`http://localhost:3000/holiday/${accounts_id}`);
            const data = await response.json();
            setUserHoliday(data);
            //setAttendanceData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching holiday data:', error);
            //setAttendanceData([]);
        }
        };
        fetchHoliday();
    }, [id]);

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
            alert('データが保存されました');
            } else {
            alert('データの保存に失敗しました');
            }
        } catch (error) {
            console.error('Error saving data:', error);
            alert('データの保存に失敗しました');
        }
    };

    return (
        <div id='expenses_page'>
            <div id='expenses_user_area'>
                {userData && <p id='atUser'>ユーザー名: {userData.fullname} さん</p>}
            </div>
            <h1>代休未消化記録表</h1>
            <div id='expenses_H2_area'>
                <h2 id='atH2'>{year}年 {month}月</h2>
            </div>
            <div id='h_flex'>
                <div id='h_box1'>
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
                        <div>
                            <button type='submit' id='h_button'>登録</button>
                        </div>
                    </form>
                </div>
                <div id ='h_box2'>
                    <table id ='h_table'>
                        <thead id ='expenses_Th'>
                            <tr>
                                <th colSpan="4">代休未消化記録表</th>
                            </tr>
                        </thead>
                        <tbody id='h_tbody'>
                            {userHoliday && userHoliday.length > 0 ? (
                                userHoliday.map((holiday, index) => (
                                    <tr key={index}>
                                        <td>{holiday.year} 年</td>
                                        <td>{holiday.month} 月</td>
                                        <td>{holiday.day} 日</td>
                                        <td>{holiday.week}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">代休情報がありません</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div id='expenses_link_area'>
                <Link to="/attendance_table" id='expenses_link'>← 勤怠一覧ページ</Link>
            </div>
        </div>
    );
};

export default HolidayPage;
