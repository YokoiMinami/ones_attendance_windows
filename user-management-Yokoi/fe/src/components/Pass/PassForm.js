import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PassForm = (props) => {
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
      const response = await fetch(`http://localhost:3000/pass_edit/${accounts_id}`, {
        method: 'PUT',
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

export default PassForm;












// import React, { useState, useEffect } from 'react';
// import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
// import { useNavigate,useParams } from 'react-router-dom';
// import { TextField, Autocomplete } from '@mui/material';

// const PassForm = (props) => {

//     const [year, setYear] = useState(new Date().getFullYear());
//     const [month, setMonth] = useState(new Date().getMonth() + 1);
//     const [date, setDate] = useState(new Date());
//     const [pass, setPass] = useState('');
//     const [state, setState] = useState({
//       id: 0,
//     });

//     const submitFormEdit = async (e) => {
//       const accounts_id = localStorage.getItem('user');
//       const currentDate = date.toISOString().split('T')[0];

//       e.preventDefault();
//       const formErrors = validateForm();
//       if (Object.keys(formErrors).length > 0) {
//         setErrors(formErrors);
//         return;
//       }

//       try {
//         const response = await fetch(`http://localhost:3000/pass_edit/${accounts_id}`, {
//           method: 'put',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({
//             id: state.id,
//             accounts_id,
//             data:currentDate,
//             admin_password:pass
//           })
//         });
        
//         const item = await response.json();
        
//         if (item) {
//           props.updateState(item);
//           props.toggle();
//           window.location.reload();
//         } else {
//           console.log('failure');
//         }
//       } catch (err) {
//         console.log(err);
//       }
//     };
    
//     return (
//     <form onSubmit={submitFormEdit}>
//       <div id='projects_area'>
//         <div className='projects_area_box'>
//           <label className='pj_label'>新しい管理者パスワード : </label>
//           <input type='text' className='projects_input' value={pass} onChange={(e) => setPass(e.target.value)} />
//         </div>
//         <div id='projects_bt'>
//           <button type='submit' id='projects_button'>登録</button>
//         </div>
//       </div>
//     </form>
//     );
// };

// export default PassForm;


