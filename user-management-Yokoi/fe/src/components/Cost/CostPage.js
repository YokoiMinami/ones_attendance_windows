import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CostModal from './CostModal';
import OnesLogo from '../../images/ones-logo.png';
import axios from 'axios';

const CostPage = () => {
    const id = localStorage.getItem('user');
    const accounts_id = localStorage.getItem('user');
    const [userData, setUserData] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [items2, setItems2] = useState([]); //プロジェクト情報
    const [projects, setProjects] = useState('');
    const [details, setDetails] = useState('');
    const [company, setCompany] = useState('');
    const [name, setName] = useState('');
    const now = new Date();
    const now_year = now.getFullYear();
    const now_month = String(now.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1
    const day = String(now.getDate()).padStart(2, '0'); // 日付
    const currentDate = `${year}/${month}/${day}`;

    const [file, setFile] = useState(null);
    const [images, setImages] = useState([]);
    const [showImage, setShowImage] = useState(false); //画像の表示、非表示

    const handleClick = () => {
        setShowImage(!showImage);
    };


    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('image', file);
    
        try {
            const response = await axios.post('http://localhost:3000/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            });
            console.log(response.data);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };
    

    useEffect(() => {
        const fetchImages = async () => {
        try {
            const response = await axios.get('http://localhost:3000/images');
            setImages(response.data);
        } catch (error) {
            console.error('Error fetching images:', error);
        }
        };
    
        fetchImages();
    }, []);

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

    //プロジェクト情報
    useEffect(() => {
        const fetchUser = async () => {
        const accounts_id = localStorage.getItem('user');
        try {
            const response = await fetch(`http://localhost:3000/projects/${accounts_id}`);
            const data = await response.json();
            setItems2(data);
            if (data.project ) setProjects(data.project);
            if (data.details ) setDetails(data.details);
            if (data.company) setCompany(data.company);
            if (data.name) setName(data.name);
        } catch (error) {
            console.error('Error fetching holiday data:', error);
        }
        };
        fetchUser();
    }, []);

    //ユーザーの代休情報を取得
    useEffect(() => {
        const fetchHoliday = async () => {
        const accounts_id = localStorage.getItem('user');
        try {
            const response = await fetch(`http://localhost:3000/holiday/${accounts_id}`);
            const data = await response.json();
            setItems(data);
            //setAttendanceData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching holiday data:', error);
            //setAttendanceData([]);
        }
        };
        fetchHoliday();
    }, [id]);

    const handleCheckboxChange = (event, itemId) => {
        if (event.target.checked) {
            setSelectedItems(prevSelected => [...prevSelected, itemId]);
        } else {
            setSelectedItems(prevSelected => prevSelected.filter(id => id !== itemId));
        }
    };

    const addItemToState = (item) => {
        window.location.reload();
        setItems(prevItems => [...prevItems, item]);
    };

    const deleteItems = () => {
        if (selectedItems.length === 0) {
        alert('代休が選択されていません');
        return;
        }
        let confirmDelete = window.confirm('チェックした代休を削除しますか？');
        if (confirmDelete) {
        selectedItems.forEach(itemId => {
            fetch('http://localhost:3000/holiday_delete', {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: itemId })
            })
            .then(response => response.json())
            .then(() => {
                setItems(prevItems => prevItems.filter(item => item.id !== itemId));
            })
            .catch(err => console.log(err));
        });
            // チェックボックスのリセット
            setSelectedItems([]);
        }
    };

    const data = [
        { label: '項目1', value: 'データ1' },
        { label: '項目2', value: 'データ2' },
        { label: '項目3', value: 'データ3' },
    ];

    return (
        <div id='cost_page'>
            <div id='expenses_user_area'>
                {userData && <p id='atUser'>{userData.fullname} さん</p>}
            </div>
            <h1>経費精算</h1>
            <div id='cost_ym'>
                <input
                id='at_year'
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                />
                <input
                id='at_month'
                type="number"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                min="1"
                max="12"
                />
            </div>
            <div id ='cost_H2_area'>
                <h2 id ='atH2'>{year}年 {month}月</h2>
            </div>
            <div className='cost_flex'>
                <div id='cost_box1'>
                    <div id='cost_button_area'>
                        <button className='cost_button' onClick={deleteItems}>申請</button>
                        <CostModal buttonLabel="登録" addItemToState={addItemToState} />
                        <button className='cost_button' onClick={deleteItems}>削除</button>
                    </div>
                </div>
                <div id ='cost_box2'>
                    <div id='cost_paper'>
                        <div className='cost_flex' id='cost_making'>
                            <div id='cost_label1'>
                                作成日
                            </div>
                            <div id='cost_data1'>
                                {currentDate}
                            </div>
                        </div>
                        <div id='cost_title'>経費明細書</div>
                        <div className='cost_flex' id='cost_company'>
                            <div id='cost_label2'>
                                所属社名
                            </div>
                            <div id='cost_data2'>
                                <span id='cost_company_data'>
                                    {items2.company}
                                </span>
                            </div>
                        </div>
                        <div className='cost_flex' id='cost_name'>
                            <div id='cost_label3'>
                                氏名
                            </div>
                            <div id='cost_data3'>
                                <span id='cost_name_data'>{items2.name}</span><span id='cost_sign'>㊞</span>			
                            </div>
                        </div>
                        <div className='cost_flex' id='cost_project'>
                            <div id='cost_label4'>
                                プロジェクト
                            </div>
                            <div id='cost_data4'>
                                <span id='cost_project_data'>{items2.details}</span>		
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <input type="file" onChange={handleFileChange} />
                        <button type="submit">Upload</button>
                    </form>

                    <div>
                        {images.map((image, index) => (
                        <img key={index} src={`data:image/png;base64,${image.data}`} alt={`Uploaded ${index}`} />
                        ))}
                    </div>
                    <div className="App">
                        <p onClick={handleClick} style={{ cursor: 'pointer', color: 'blue' }}>
                            クリックして画像を表示
                        </p>
                        {showImage && <img src={OnesLogo} alt="Ones" />}
                    </div>
                    
                    {/* <div className='cost_flex'>
                        <div className='cost_label'>
                            所属社名
                        </div>
                        <div className='cost_data'>
                            <span id='cost_company_data'>
                                {items2.company}
                            </span>
                        </div>
                    </div>
                    <div className='cost_flex' id='cost_name'>
                        <div className='cost_label'>
                            氏名
                        </div>
                        <div className='cost_data2'>
                            <span id='cost_name_data'>{items2.name}</span><span id='cost_sign'>㊞</span>			
                        </div>
                    </div>
                    
                    <table id ='cost_table'>
                        <thead id ='cost_Th'>
                            <tr>
                                <th colSpan="5">経費精算</th>
                            </tr>
                        </thead>
                        <tbody id='cost_tbody'>
                            { items && items.length > 0 ? (
                                items.map((holiday, index) => (
                                    <tr key={index}>
                                        <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(holiday.id)}
                                            onChange={(event) => handleCheckboxChange(event, holiday.id)}
                                        />
                                        </td>
                                        <td>{holiday.year} 年</td>
                                        <td>{holiday.month} 月</td>
                                        <td>{holiday.day} 日</td>
                                        <td>{holiday.week}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">代休情報がありません</td>
                                </tr>
                            )}
                        </tbody>
                    </table> */}
                </div>
            </div>
            <div id='expenses_link_area'>
                <Link to="/attendance_table" id='expenses_link'>← 勤怠一覧ページ</Link>
            </div>
        </div>
    );
};

export default CostPage;
