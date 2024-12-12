//交通費情報を取得
const expensesData = async (req, res, db) => {
  const { accounts_id, year, month } = req.params;
  db('expenses')
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

//交通費情報を登録
const newExpenses = async (req, res, db) => {
  const { accounts_id, date, route, train, bus, tax, aircraft, other, total, stay, grand_total, expenses_remarks} = req.body;
  const expensesUser = await db('expenses').where({ accounts_id, date }).first();
  
  if(expensesUser){
    if(route === ''){
      await db('expenses').where({ accounts_id, date }).del() 
      .then(() => { res.status(200).send('データ削除完了'); }) 
      .catch(err => res.status(400).json({ 
        dbError: '削除エラー' 
      }));
    }else if (grand_total === 0){
      await db('expenses').where({ accounts_id, date }).update({ route, train:null, bus:null, tax:null, aircraft:null, other:null, total:null, stay:null, grand_total:null, expenses_remarks }) 
      .then(() => { res.status(200).send('grand_totalデータ削除完了'); })
      .catch(err => res.status(400).json({ 
        dbError: '削除エラー' 
      }));
    }else if (total === 0){
      await db('expenses').where({ accounts_id, date }).update({ route, train:null, bus:null, tax:null, aircraft:null, other:null, total:null, stay, grand_total, expenses_remarks }) 
      .then(() => { res.status(200).send('totalデータ削除完了'); })
      .catch(err => res.status(400).json({ 
        dbError: '削除エラー' 
      }));
    }else if (train === ''){
      await db('expenses').where({ accounts_id, date }).update({ route, train:null, bus, tax, aircraft, other, total, stay, grand_total, expenses_remarks }) // trainフィールドのみをnullに更新
      .then(() => { res.status(200).send('trainデータ削除完了'); })
      .catch(err => res.status(400).json({ 
        dbError: '削除エラー' 
      }));
    }else if (bus === ''){
      await db('expenses').where({ accounts_id, date }).update({ route, train, bus:null, tax, aircraft, other, total, stay, grand_total, expenses_remarks }) 
      .then(() => { res.status(200).send('busデータ削除完了'); })
      .catch(err => res.status(400).json({ 
        dbError: '削除エラー' 
      }));
    }else if (tax === ''){
      await db('expenses').where({ accounts_id, date }).update({ route, train, bus, tax:null, aircraft, other, total, stay, grand_total, expenses_remarks }) 
      .then(() => { res.status(200).send('taxデータ削除完了'); })
      .catch(err => res.status(400).json({ 
        dbError: '削除エラー' 
      }));
    }else if (aircraft === ''){
      await db('expenses').where({ accounts_id, date }).update({ route, train, bus, tax, aircraft:null, other, total, stay, grand_total, expenses_remarks }) 
      .then(() => { res.status(200).send('aircraftデータ削除完了'); })
      .catch(err => res.status(400).json({ 
        dbError: '削除エラー' 
      }));
    }else if (other === ''){
      await db('expenses').where({ accounts_id, date }).update({ route, train, bus, tax, aircraft, other:null, total, stay, grand_total, expenses_remarks }) 
      .then(() => { res.status(200).send('otherデータ削除完了'); })
      .catch(err => res.status(400).json({ 
        dbError: '削除エラー' 
      }));
    }else if (stay === ''){
      await db('expenses').where({ accounts_id, date }).update({ route, train, bus, tax, aircraft, other, total, stay:null, grand_total, expenses_remarks }) 
      .then(() => { res.status(200).send('stayデータ削除完了'); })
      .catch(err => res.status(400).json({ 
        dbError: '削除エラー' 
      }));
    }
    else{
      await db('expenses').where({ accounts_id, date }).update({ route, train, bus, tax, aircraft, other, total, stay, grand_total, expenses_remarks })
      .returning('*')
      .then(item => {
        res.json(item);
      })
      .catch(err => res.status(400).json({
        dbError: 'error'
      }));
    }
  }else {
    if(route === ''){
      await db('expenses').where({ accounts_id, date }).del() 
      .then(() => { res.status(200).send('データ削除完了'); }) 
      .catch(err => res.status(400).json({ 
        dbError: '削除エラー' 
      }));
    }else{
      await db('expenses').insert({accounts_id, date, route, train, bus, tax, aircraft, other, total, stay, grand_total, expenses_remarks })
      .returning('*')
      .then(item => {
        res.json(item);
      })
      .catch(err => res.status(400).json({
        dbError: 'error'
      }));
    }
  }
};

module.exports = {
  expensesData,
  newExpenses
}
  