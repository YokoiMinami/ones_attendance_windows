import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUserData, fetchProjectData, fetchExpensesData2, approveExpense } from '../../apiCall/apis';

const MemberCostForm = (props) => {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [approver, setApprover] = useState('');
  const [president, setPresident] = useState('');
  const [remarks, setRemarks] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [projectId, setprojectId] = useState();
  const today = new Date();
  const currentDate2 = `${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`;
  const [errors, setErrors] = useState({});
  const [expenses, setExpenses] = useState([]);

  // ユーザー情報を取得
  useEffect(() => {
    const getUserData = async () => {
      try {
        const data = await fetchUserData(id);
        setUserData(data);
      } catch (err) {
        console.log(err);
      }
    };
    getUserData();
  }, [id]);

  // プロジェクト情報取得
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await fetchProjectData(id, year, month);
        setprojectId(data.id);
      } catch (error) {
        console.error('Error fetching project data:', error);
        setprojectId();
      }
    };
    fetchUser();
  }, [year, month, id]);

  //ユーザーの経費情報を取得
  useEffect(() => {
    const fetchExpenses2 = async () => {
      try {
        const data = await fetchExpensesData2(id, year, month);
        setExpenses(data);
      } catch (error) {
        console.error('Error fetching expenses data:', error);
      }
    };
    fetchExpenses2();
  }, [year, month, id]);

  const validateForm = () => {
    const newErrors = {};
    if (!approver) { newErrors.approver = '承認者を入力してください'; } 
    if (!president) { newErrors.president = '社長名を入力してください'; } 
    return newErrors;
  };

  //経費承認
  const submitFormAdd = async (e) => {
    e.preventDefault();
  
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
  
    if (!expenses.length) {
      alert('承認月は経費が登録されていません');
      return;
    }
  
    const registration = userData.fullname;
    const data = {
      id: projectId,
      registration: registration,
      registration_date: currentDate2,
      approver: approver,
      president: president,
      remarks: remarks
    };
  
    try {
      const success = await approveExpense(data);
      if (success) {
        alert('経費を承認しました');
        window.location.reload();
      } else {
        alert('経費の承認に失敗しました');
      }
    } catch (error) {
      alert('経費の承認に失敗しました');
    }
  };

  return (
    <div>
      <div id='cost_ym'> 
        <input id='at_year2' type="number" value={year} onChange={(e) => setYear(e.target.value)} /> /
        <input id='at_month2' type="number" value={month} onChange={(e) => setMonth(e.target.value)} min="1" max="12" /> 
      </div> 
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
            <button type='submit' id='projects_button'>承認</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MemberCostForm;


