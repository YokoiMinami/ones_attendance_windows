//代休を登録
const holidayPost = async (req, res, db) => {
  const { accounts_id, date, week  } = req.body;
  await db('holiday').insert({accounts_id, date, week})
  .returning('*')
  .then(item => {
    res.json(item);
  })
  .catch(err => res.status(400).json({
    dbError: 'error'
  }));
}

//代休を取得
const holidayData = async (req, res, db) => {
  const { accounts_id } = req.params;
  try {
    const item = await db('holiday').where({ accounts_id });
    console.log(item);
    if (item) {
      res.json( item );
    } else {
      res.status(404).send('保存データが見つかりません。');
    }
  } catch (error) {
    console.error('Error fetching check-in time:', error);
    res.status(500).send('サーバーエラー');
  }
}

//代休を削除
const delHolidayData = (req, res, db) => {
  const { id } = req.body;
  db('holiday').where({ id }).del()
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
  holidayPost,
  holidayData,
  delHolidayData
}
