// メンバーの経費申請状況を取得
const memberCostData = async (req, res, db) => {
  const { accounts_id, date2 } = req.params;
  const numericAccountsId = parseInt(accounts_id, 10); 
  try {
    const memberCost = await db('projectdata').where({ accounts_id: numericAccountsId, create_date: date2 });
    if (memberCost.length > 0) {
      res.json(memberCost);
      console.log(memberCost);
    } else {
      res.json([]); 
    }
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({ error: 'サーバーエラー' }); 
  }
};

//経費承認取り消し
const appDelete = async (req, res, db) => {
  const { registration, registration_date, id } = req.body;
  
  await db('projectdata').where({ id }).update({ app_flag:true, registration:registration, registration_date:registration_date, approver:null, president:null, remarks:null })
  .returning('*')
  .then(item => {
    res.json(item);
  })
  .catch(err => res.status(400).json({
    dbError: 'error'
  }));
}

const projectsFlag = async (req, res, db) => {
  const { id, registration, registration_date, approver, president, remarks} = req.body;
  const projectUser = await db('projectdata').where({ id }).first();
  if(projectUser){
    await db('projectdata').where({ id }).update({ registration:registration, registration_date:registration_date, approver:approver, president:president, remarks:remarks, app_flag:false })
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
  }
}

//経費
const projectsDelete = async (req, res, db) => {
  const { id } = req.body;
  try {
    const projectData = await db('projectdata').where({ id }).first();
    if (projectData) {
      await db('projectdata').where({ id }).update({
        create_day: null,
        app_flag: false,
        registration: null,
        registration_date: null,
        approver: null,
        president: null,
        remarks: null
      });
      res.status(200).json({ message: 'Project deleted successfully' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
};

const imagePost = async (req, res, db) => {
  const { accounts_id, date, category, description, amount, id, registration } = req.body;
  const receipt_url = req.file ? req.file.filename : '';
  
  try {
    if(registration && id){
      const projectData = await db('projectdata').where({ id }).first();
      if(projectData){
        await db('projectdata').where({ id }).update({
          create_day: null,
          app_flag: false,
          registration: null,
          registration_date: null,
          approver: null,
          president: null,
          remarks: null
        });
      }
      await db('images_table').insert({ 
        accounts_id,
        date,
        category,
        description,
        amount,
        receipt_url 
      });  
    }else{
      await db('images_table').insert({ 
        accounts_id,
        date,
        category,
        description,
        amount,
        receipt_url 
      });  
    }
    res.status(200).json({ message: 'Image uploaded successfully' });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
}

const imageData = async (req, res, db) => {
  const { accounts_id, year, month } = req.params;
  db('images_table')
  .whereRaw('EXTRACT(YEAR FROM date) = ?', [year])
  .whereRaw('EXTRACT(MONTH FROM date) = ?', [month])
  .andWhere('accounts_id', accounts_id)
  .then(expenses => {
    // 日付をローカルタイムゾーンに変換
    const adjustedExpenses = expenses.map(expense => ({
      ...expense,
      date: new Date(expense.date).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
    }));
    res.json(adjustedExpenses);
  })
  .catch(error => {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  });
};

const costDelete = (req, res, db) => {
  const { id } = req.body;
  db('images_table').where({ id }).del()
  .then(() => {
    res.json({
      delete: 'true'
    });
  })
  .catch(err => res.status(400).json({
    dbError: 'error'
  }));
}

module.exports = {
  memberCostData,
  appDelete,
  projectsFlag,
  projectsDelete,
  imagePost,
  imageData,
  costDelete
}
  