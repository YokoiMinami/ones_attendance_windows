//管理者パスワード取得
const passData = (req, res, db) => {
  db.select('*').from('passdata')
  .then(items => {
    if (items.length) {
      res.json(items);
    } else {
      res.json({
        dataExists: 'false'
      });
    }
  })
  .catch(err => res.status(400).json({
    dbError: 'error'
  }));
}

//管理者パスワードを変更
const passPut = async (req, res, db) => {
  const { id, fullname, date, admin_password } = req.body;

  console.log('Received data:', { id, fullname, date, admin_password });

  await db('passdata').where({ id }).update({ fullname, date, admin_password })
  .returning('*')
  .then(item => {
    console.log('Database update successful:', item);
    res.json(item);
  })
  .catch(err => {
    console.error('Database update error:', err);
    res.status(400).json({
      dbError: 'error'
    });
  });
};

module.exports = {
  passData,
  passPut
}
