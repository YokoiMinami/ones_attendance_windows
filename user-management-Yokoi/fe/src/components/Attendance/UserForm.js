import React, { useState, useEffect } from 'react';

const UserForm = (props) => {
  const [items, setItems] = useState([]); //プロジェクト情報
  const [projects, setProjects] = useState('');
  const [details, setDetails] = useState('');
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const currentDate = `${year}-${month}`;

  //プロジェクト情報
  useEffect(() => {
    const fetchUser = async () => {
      const accounts_id = localStorage.getItem('user');
      try {
        const response = await fetch(`http://localhost:3000/projects/${accounts_id}/${year}/${month}`);
        const data = await response.json();
        setItems(data);
        setProjects(data.project);
        setDetails(data.details);
        setCompany(data.company);
        setName(data.name);
        setDate(data.create_date);
      } catch (error) {
        console.error('Error fetching holiday data:', error);
        setItems();
        setProjects('');
        setDetails('');
        setCompany('');
        setName('');
        setDate('');
      }
    };
    fetchUser();
  }, [year, month]);

  //プロジェクト情報登録
  const submitFormAdd = async (e) => {
    e.preventDefault();
    const accounts_id = localStorage.getItem('user');
    const data = {
      accounts_id,
      project: projects,
      details: details,
      company: company,
      name: name,
      create_date: currentDate
    };
    try {
      const response = await fetch('http://localhost:3000/projects', {
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
    } catch (error) {
      console.error('Error saving data:', error);
      alert('データの保存に失敗しました');
    }
  };

//   const addItemToState = (item) => {
//     window.location.reload();
//     setItems(prevItems => [...prevItems, item]);
// };


    return (
      <div>
        <div id='cost_ym'> 
        <input id='at_year2' type="number" value={year} onChange={(e) => setYear(e.target.value)} /> /
        <input id='at_month2' type="number" value={month} onChange={(e) => setMonth(e.target.value)} min="1" max="12" /> 
      </div> 
        <form onSubmit={submitFormAdd}>
      <div id='projects_area'>
        <div className='projects_area_box'>
          <label className='pj_label'>PJ名称 : </label>
          <input type='text' className='projects_input' value={projects} onChange={(e) => setProjects(e.target.value)} />
        </div>
        <div className='projects_area_box'>
          <label className='pj_label'>PJ詳細 : </label>
          <input type='text' className='projects_input' value={details} onChange={(e) => setDetails(e.target.value)} />
        </div>
        <div className='projects_area_box'> 
          <label className='pj_label'>所属会社 : </label>
          <input type='text' className='projects_input' value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <div className='projects_area_box'>
          <label className='pj_label'>氏名 : </label>
          <input type='text' className='projects_input' value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div id='projects_bt'>
          <button type='submit' id='projects_button'>登録</button>
        </div>
      </div>
      </form>
      </div>
    );
};

export default UserForm;


