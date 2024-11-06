import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useNavigate,useParams } from 'react-router-dom';
import { TextField, Autocomplete } from '@mui/material';


const UserForm = (props) => {
  const [items, setItems] = useState([]); //プロジェクト情報
  const [projects, setProjects] = useState('');
  const [details, setDetails] = useState('');
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');

    //プロジェクト情報
    useEffect(() => {
      const fetchUser = async () => {
      const accounts_id = localStorage.getItem('user');
      try {
          const response = await fetch(`http://localhost:3000/projects/${accounts_id}`);
          const data = await response.json();
          setItems(data);
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

    //プロジェクト情報登録
  const submitFormAdd = async (e) => {
    e.preventDefault();
    const accounts_id = localStorage.getItem('user');
    const data = {
      accounts_id,
      project: projects,
      details: details,
      company: company,
      name: name
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
    <form onSubmit={submitFormAdd}>
      <div id='projects_area'>
        <div className='projects_area_box'>
          <label className='pj_label'>プロジェクト名称 : </label>
          <input type='text' className='projects_input' value={projects} onChange={(e) => setProjects(e.target.value)} />
        </div>
        <div className='projects_area_box'>
          <label className='pj_label'>プロジェクト詳細 : </label>
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
    );
};

export default UserForm;


