//プロジェクト情報を登録
const projectsData = async (req, res, db) => {
  const { accounts_id, project, details, company, name, create_date } = req.body;
  const projectUser = await db('projectdata').where({ accounts_id, create_date:create_date }).first();
  if(projectUser){
    await db('projectdata').where({ accounts_id, create_date }).update({ project, details, company, name })
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
  }else {
    await db('projectdata').insert({accounts_id, project, details, company, name, create_date})
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
  }
}

const projectsPut = async (req, res, db) => {
  const { accounts_id, create_date, create_day } = req.body;
  const projectUser = await db('projectdata').where({ accounts_id, create_date:create_date }).first();
  if(projectUser){
    await db('projectdata').where({ accounts_id, create_date }).update({ create_day, app_flag:true })
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
  }else {
    await db('projectdata').insert({accounts_id, create_date, create_day, app_flag:true})
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
  }
}

// プロジェクト情報を取得
const projectUser = async (req, res, db) => {
  const { accounts_id, year, month } = req.params;
  const create_date = `${year}-${month}`;
  try {
    const item = await db('projectdata').where({ accounts_id, create_date }).first();
    if (item) {
      res.json(item);
    } else {
      res.json({});
    }
  } catch (error) {
    console.error('Error fetching project data:', error);
    res.status(500).json({ error: 'サーバーエラー: ' + error.message });
  }
};

module.exports = {
  projectsData,
  projectsPut,
  projectUser
}
  