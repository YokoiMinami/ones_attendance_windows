import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CostModal from './CostModal';

const CostPage = () => {
  const id = localStorage.getItem('user');
  const [userData, setUserData] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [items, setItems] = useState([]);
  const [items2, setItems2] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [deleteImage, setdeleteImage] = useState([]);
  const [details, setDetails] = useState();
  const [company, setCompany] = useState();
  const [name, setName] = useState();
  const [date, setDate] = useState('');
  const [appDay, setAppDay] = useState('');
  const [appState , setAppState ] = useState(false);
  const [appUser , setAppUser ] = useState('');
  const [appDate , setAppDate ] = useState('');
  const [appFlag , setAppFlag ] = useState('');
  const [registration, setRegistration] = useState('');
  const [registrationDate, setregistrationDate] = useState('');
  const [approver, setApprover] = useState('');
  const [president, setPresident] = useState('');
  const [remarks, setRemarks] = useState('');
  const [appText , setAppText ] = useState('');
  const [year2, setYear2] = useState(new Date().getFullYear());
  const [month2, setMonth2] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState(new Date().getDate());
  const currentDate = `${year2}/${month2}/${day}`;
  const [showImage, setShowImage] = useState(false); //画像の表示、非表示
  const [expenses, setExpenses] = useState([]);
  const [selectedImage, setSelectedImage] = useState(''); 
  const [total, setTotal] = useState(); 
  const [projectId, setProjectId] = useState();
  const [errors, setErrors] = useState({});

  //ユーザーの経費情報を取得
  useEffect(() => {
    const fetchExpenses = async () => {
      const accounts_id = localStorage.getItem('user');
      try {
        const response = await fetch(`http://localhost:3000/api/expenses2/${accounts_id}/${year}/${month}`);
        const data = await response.json();
        setExpenses(data)
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };
    fetchExpenses();
  }, [year, month]);

  const toggleImage = (filePath, index) => { 
    setShowImage(prevShowImage => ({ 
      ...prevShowImage, 
      [index]: !prevShowImage[index],
    }));
    setSelectedImage(showImage[index] ? '' : filePath); 
  };
  
  useEffect(() => {
    const displayedIndex = Object.keys(showImage).find(key => showImage[key]);
    if (displayedIndex !== undefined) {
      setSelectedImage(`http://localhost:3000/uploads/${expenses[displayedIndex].receipt_url}`);
    } else {
      setSelectedImage('');
    }
  }, [showImage, expenses]);
  

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
        const response = await fetch(`http://localhost:3000/projects/${accounts_id}/${year}/${month}`);
        const data = await response.json();
        setItems2(data);
        setProjectId(data.id);
        setDetails(data.details);
        setCompany(data.company);
        setName(data.name);
        setDate(data.create_date);
        setAppDay(data.create_day);
        setAppFlag(data.app_flag);
        setRegistration(data.registration);
        setregistrationDate(data.registration_date);
        setApprover(data.approver);
        setPresident(data.president);
        setRemarks(data.remarks);

        if(data.app_flag){
          setAppText('承認待ち');
          setAppState(true);
        }else if(data.create_day && !data.app_flag){
          setAppText('承認済み');
          setAppState(true);
          setAppUser(data.registration);
          setAppDate(data.registration_date);
        }else{
          setAppText('未申請');
          setAppState(false);
        }
      } catch (error) {
        console.error('Error fetching holiday data:', error);
        setItems2();
        setDetails();
        setCompany();
        setName();
        setDate();
        setAppDay();
        setAppFlag();
        setRegistration();
        setregistrationDate();
        setApprover();
        setPresident();
        setRemarks();
        setAppText('未申請')
      }
    };
    fetchUser();
  }, [year, month]);

  const handleCheckboxChange = (event, itemId, itemUrl) => {
    if (event.target.checked) {
      setSelectedItems(prevSelected => [...prevSelected, itemId]);
      setdeleteImage(prevSelected => [...prevSelected, itemUrl]);
    } else {
      setSelectedItems(prevSelected => prevSelected.filter(id => id !== itemId));
    }
  };

  const addItemToState = (item) => {
    window.location.reload();
    setItems(prevItems => [...prevItems, item]);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!company){newErrors.company = '所属社名を登録してください'};
    if (!name) {newErrors.name = '金額を登録してください'};
    if (!details) {newErrors.details = 'プロジェクトを登録してください'}; 
    return newErrors;
  };

  //プロジェクト情報登録
  const putItems = async (e) => {

    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    if (!total) {
      alert('経費を登録してください');
      return;
    }
    
    let confirmDelete = window.confirm('入力した内容で経費を申請しますか？');
    if (confirmDelete) {
      const accounts_id = localStorage.getItem('user');
      const create_day = `${year}/${month}/${day}`;
      const data = {
        accounts_id,
        create_date: date,
        create_day: create_day
      };
      try {
        const response = await fetch('http://localhost:3000/projects_put', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        if (response.ok) {
          alert('経費を申請しました');
          window.location.reload();
        } else {
          alert('経費の申請に失敗しました');
        }
      } catch (error) {
        console.error('Error saving data:', error);
        alert('経費の申請に失敗しました');
      }
    }
  };

  const deleteItems = async () => {
    if (selectedItems.length === 0) {
      alert('経費が選択されていません');
      return;
    }
  
    const confirmDelete = window.confirm(
      registration
        ? '承認済みの経費を削除すると、再度承認が必要になります。チェックした経費を削除しますか？'
        : 'チェックした経費を削除しますか？'
    );

    if (!confirmDelete) return;
  
    try {
      if (registration) {
        await deleteProject();
        await deleteImages();
        await deleteSelectedItems();
      }else{
        await deleteImages();
        await deleteSelectedItems();
      }
  
      // チェックボックスのリセット
      setSelectedItems([]);
      setdeleteImage([]);
      window.location.reload();
    } catch (error) {
      console.error('Error deleting items:', error);
    }
  };
  
  const deleteImages = async () => {
    const deleteImagePromises = deleteImage.map(async (image) => {
      if (image.length > 0) {
        const response = await fetch(`http://localhost:3000/uploads/${image}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ receipt_url: image }),
        });
        return response.json();
      } else {
        console.log('画像がありません');
      }
    });
  };
  
  const deleteSelectedItems = async () => {
    const deleteItemPromises = selectedItems.map(async (itemId) => {
      const response = await fetch('http://localhost:3000/cost_delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: itemId }),
      });
      const result = await response.json();
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      return result;
    });
  };
  
  const deleteProject = async () => {
    const data = { id: projectId };

    const response = await fetch('http://localhost:3000/project_delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      alert('経費の削除に失敗しました');
      throw new Error('Failed to delete project');
    }
  };
  
  const formatDate = (dateString) => { 
    const date = new Date(dateString); 
    const year = date.getFullYear(); 
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0'); 
    return `${year}/${month}/${day}`; 
  };

  const formatAmount = (amount) => { 
    const flooredAmount = Math.floor(amount); 
    return flooredAmount.toLocaleString('ja-JP', { minimumFractionDigits: 0 }); 
  };

  const formatAmount2 = (amount) => { 
    return Math.floor(amount);
  };

  const formatAmount3 = (amount) => {
    return amount.toLocaleString('ja-JP', { minimumFractionDigits: 0 });
  };
  
  useEffect(() => { // expensesが更新されるたびに合計金額を計算する 
    const calculateTotalAmount = () => { 
      return expenses.reduce((total, item) => total + formatAmount2(item.amount), 0); 
    }; 
    const totalAmount = calculateTotalAmount(); 
    if(totalAmount > 0){
      setTotal(formatAmount3(totalAmount)); 
    }else {
      setTotal();
    }
  }, [expenses]);

  const sortByDate = (expenses) => { 
    return expenses.sort((a, b) => new Date(a.date) - new Date(b.date)); 
  };

  const getTextColor = () => { switch (appText) { case '承認待ち': return 'crimson'; case '承認済み': return '#266ebd'; default: return '#808080'; } };

  return ( 
    <div id='cost_page'> 
      <div id='expenses_user_area'> 
        {userData && <p id='atUser'>{userData.fullname} さん</p>} 
      </div> 
      <h1 id='cost_h1'>経費精算</h1> 
      <div id='cost_ym'> 
        <input id='at_year' type="number" value={year} onChange={(e) => setYear(e.target.value)} /> 
        <input id='at_month' type="number" value={month} onChange={(e) => setMonth(e.target.value)} min="1" max="12" /> 
      </div> 
      <div id='cost_H2_area'> 
        <h2>{year}年 {month}月</h2> 
      </div> 
      <div id='cost_state_box'>
        <div id='cost_state'>
          <span className='cost_state_label'>ステータス : </span>
          <span className='cost_state_data' style={{ color: getTextColor() }}>{appText}</span>
        </div>
        {appUser && (
          <div id='cost_state2'>
            <span className='cost_state_label'>更新者 : </span>
            <span className='cost_state_data'>{appUser} さん</span>
          </div>
        )}
        {appDate && (
          <div>
            <span className='cost_state_label'>更新日 : </span>
            <span className='cost_state_data'>{appDate}</span>
        </div>
        )}
        <div id='cost_state3'></div>
      </div>
      <div className='cost_flex'> 
        <div id='cost_box1'> 
          <div id='cost_button_area'> 
            <button className='cost_button' onClick={putItems}>申請</button> 
            <CostModal buttonLabel="登録" addItemToState={addItemToState} /> 
            <button className='cost_button' onClick={deleteItems}>削除</button> 
          </div> 
        </div> 
        <div id='cost_box2'> 
          <div id='cost_paper'> 
            <div className='cost_flex' id='cost_making'> 
              <div id='cost_label1'> 作成日 </div> 
              {appState? <span className='appState'>{appDay}</span> : 
                <div id='cost_data1'>
                  <input id='cost_year' type="number" value={year} onChange={(e) => setYear(e.target.value)} />/
                  <input id='cost_month' type="number" value={month} onChange={(e) => setMonth(e.target.value)} min="1" max="12" />/
                  <input id='cost_day' type="number" value={day} onChange={(e) => setDay(e.target.value)} min="1" max="31" />
                </div>
              } 
            </div> 
            <div id='cost_title'>経費明細書</div> 
            <div className='cost_flex' id='cost_company'> 
              <div id='cost_label2'> 所属社名 </div> 
              <div id='cost_data2'> 
                <span id='cost_company_data' className={errors.company ? 'cost_error' : ''}>
                  {errors.company ? errors.company : company}
                </span>
              </div> 
            </div> 
            <div className='cost_flex' id='cost_name'> 
              <div id='cost_label3'> 氏名 </div> 
              <div id='cost_data3'> 
                <span id='cost_name_data' className={errors.name ? 'cost_error' : ''}>
                  {errors.name ? errors.name : name}
                </span>
                <span id='cost_sign'>㊞</span> 
              </div> 
            </div> 
            <div className='cost_flex' id='cost_project'> 
              <div id='cost_label4'> プロジェクト </div> 
              <div id='cost_data4'> 
                <span id='cost_project_data' className={errors.details ? 'cost_error' : ''}>
                  {errors.details ? errors.details : details}
                </span> 
              </div> 
            </div> 
            <table id="cost_table"> 
              <thead id="cost_Th"> 
                <tr> 
                  <th id='cost_check' style={{ textAlign: 'center', width: '5%'}}></th> 
                  <th className='cost_empty' style={{ textAlign: 'center', width: '15%'}}>日付</th> 
                  <th className='cost_empty' style={{ textAlign: 'center', width: '15%'}}>経費科目</th> 
                  <th className='cost_empty' style={{ textAlign: 'center' }}>内容</th> 
                  <th className='cost_empty' style={{ textAlign: 'center', width: '15%'}}>金額(税込)</th> 
                  <th className="receipt" style={{ textAlign: 'center', width: '10%'}}>レシート</th> 
                </tr> 
              </thead> 
              <tbody>{sortByDate(expenses).map((item, index) => { 
                const encodedFileName = item.receipt_url; 
                const filePath = encodedFileName ? `http://localhost:3000/uploads/${encodedFileName}` : null;
                return ( 
                  <tr key={item.id}> 
                    <td className='cost_empty' style={{ textAlign: 'center' }}> 
                      <input type="checkbox" onChange={(event) => handleCheckboxChange(event, item.id, item.receipt_url)} /> 
                    </td> 
                    <td className='cost_empty'>{formatDate(item.date)}</td> 
                    <td className='cost_empty'>{item.category}</td> 
                    <td className='cost_empty'>{item.description}</td> 
                    <td className='amount_td' style={{ textAlign: 'right' }}>{formatAmount(item.amount)}</td> 
                    <td className='cost_empty' style={{ textAlign: 'center' }}> 
                      {filePath && ( 
                        <span onClick={() => toggleImage(filePath, index)} id="image_text" style={{ cursor: 'pointer' }}> 
                          {showImage[index] ? '非表示' : '表示'} 
                        </span> 
                      )}
                    </td> 
                  </tr> 
                ); 
              })}{expenses.length < 4 && 
                Array.from({ length: 4 - expenses.length }).map((_, index) => ( 
                  <tr key={`empty-${index}`}> 
                    <td className='cost_empty'></td> 
                    <td className='cost_empty'></td> 
                    <td className='cost_empty'></td> 
                    <td className='cost_empty'></td> 
                    <td className='cost_empty'></td> 
                    <td className='cost_empty'></td> 
                  </tr> 
                )) 
              }</tbody>
            </table> 
            <div className='cost_flex' id='cost_total'> 
              <div id='cost_label5'> 経費合計 </div> 
              <div id='cost_data5'> 
                <span id='cost_total_data'>{total}</span> 
              </div> 
            </div> 
            <div id='sign_company'>
              株式会社ワンズブルーム記載欄
            </div>
            <div id='sign_area'>
              <div id='sign_label1'>承認者</div>
              <div id='sign_label2'>社長</div>
              <div id='sign_label3'>備考</div>
            </div>
            <div id='sign_area2'>
              <div id='sign_data1'>
                {approver? <span className='inkan'>{approver}</span> : <span></span>} 
              </div>
              <div id='sign_data2'>
                {president? <span className='inkan'>{president}</span> : <span></span>} 
              </div>
              <div id='sign_data3'>
                {remarks}
              </div>
            </div>
            {selectedImage && <img src={selectedImage} alt="Receipt" id="overlay_image" style={{ maxWidth: '800px', maxHeight: '400px' }}/>}
          </div> 
        </div> 
      </div> 
      <div id='cost_link_area'> 
        <Link to="/attendance_table" id='expenses_link'>← 勤怠一覧ページ</Link> 
      </div> 
    </div> 
  );
};

export default CostPage;