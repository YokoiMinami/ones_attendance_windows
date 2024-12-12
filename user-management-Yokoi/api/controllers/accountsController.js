const bcrypt = require('bcryptjs'); 
const { console } = require('inspector');
const path = require('path');
const fs = require('fs');
const { checkAdminPassword  } = require('../common/utils.js');

//アカウント登録
const postData = async (req, res, db) => {
  const { company, fullname, kananame, email, team, password, authority } = req.body;
  const date = new Date();
  const hashedPassword = await bcrypt.hash(password, 10);

  // メールアドレスが既に存在するか確認
  const emailUser = await db('accounts').where({ email }).first();

  // 管理者パスワードを取得 
  const isAdmin = await checkAdminPassword(db, authority);
  if (emailUser) {
    return res.status(400).json({ dbError: 'このメールアドレスは既に登録されています' });
  } else {
    await db('accounts').insert({ company, fullname, kananame, email, team, date, password: hashedPassword, authority: isAdmin })
      .returning('*')
      .then(item => {
        res.json(item);
      })
      .catch(err => res.status(400).json({ dbError: 'error' }));
  }
}

//アカウント登録修正
const putData = async (req, res, db) => {
  const { id, company, fullname, kananame, email, team, authority } = req.body;

  // メールアドレスが既に存在するか確認
  const emailUser = await db('accounts').where({ email }).andWhereNot({ id }).first();
  if (emailUser) {
    return res.status(400).json({ dbError: 'このメールアドレスは既に登録されています' });
  }

  // 管理者パスワードを取得 
  const isAdmin = await checkAdminPassword(db, authority);

  await db('accounts').where({ id }).update({ company, fullname, kananame, email, team, authority: isAdmin })
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
};

//アカウント登録後ページ
const newData = async (req, res, db) => {
  const userId = req.params.id;
  try {
    const item = await db('accounts').where({ id:userId }).first();
    if (item) {
      res.json(item);
    } else {
      res.status(400).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//アカウント情報を全て取得
const getData = (req, res, db) => {
  db.select('*').from('accounts')
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

const delData = (req, res, db) => {
  const { id } = req.body;

  db.transaction(async trx => {
    try {
      // 画像URLを取得
      const imageURLs = await trx('images_table').where({ accounts_id: id }).select('receipt_url');
      const deletePromises = imageURLs.map(row => {
        const filePath = path.join(__dirname, '../uploads', row.receipt_url);
        
        if (fs.existsSync(filePath)) {
          return new Promise((resolve, reject) => {
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error('ファイルの削除中にエラーが発生しました:', err);
                reject('ファイルの削除に失敗しました');
              } else {
                console.log('File deleted successfully:', filePath);
                resolve();
              }
            });
          });
        } else {
          console.error('ファイルが見つかりません:', filePath);
          return Promise.resolve(); // ファイルが見つからない場合も削除の一環として成功とみなす
        }
      });

      await Promise.all(deletePromises);

      // 各テーブルからデータを削除
      await trx('attendance').where({ accounts_id: id }).del();
      await trx('overdata').where({ accounts_id: id }).del();
      await trx('projectdata').where({ accounts_id: id }).del();
      await trx('expenses').where({ accounts_id: id }).del();
      await trx('images_table').where({ accounts_id: id }).del();
      await trx('holiday').where({ accounts_id: id }).del();
      await trx('accounts').where({ id }).del();

      await trx.commit();
      res.json({ delete: 'true' });
    } catch (err) {
      console.error('トランザクション内でエラーが発生しました:', err);
      await trx.rollback();
      res.status(400).json({ dbError: 'error', message: err.message });
    }
  }).catch(err => {
    console.error('トランザクションが開始できませんでした:', err);
    res.status(400).json({ dbError: 'transaction error', message: err.message });
  });
};

module.exports = {
  getData,
  postData,
  putData,
  delData,
  newData,
}
  