const express = require('express'); //ウェブフレームワーク
const app = express();
const accountsController = require('./controllers/accountsController'); //dbクエリ
require('dotenv').config();

//ミドルウェアを設定する
const cors = require('cors'); //CORS(Cross-Origin Resource Sharing)を有効にする
const whitelist = ['http://localhost:3001', 'http://localhost:3000'];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
// const corsOptions = { origin: '*', // 全てのオリジンを許可 
//   methods: ['GET', 'POST', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] 
// };

// Cross-Origin関連ヘッダーを設定するミドルウェアを追加 
app.use((req, res, next) => { 
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); 
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp'); //追加 
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin'); //追加 
  next(); 
});

app.use(cors(corsOptions));

const cron = require('cron');
const bodyParser = require('body-parser'); //レスポンスのフォーマットを変換する
const morgan = require('morgan'); //HTTPレクエストロガー
const helmet = require('helmet'); //Cross-Site-Scripting(XSS)のような攻撃を防ぐ、参考に：https://www.geeksforgeeks.org/node-js-securing-apps-with-helmet-js/
const multer = require('multer');
const path = require('path');
const fs = require('fs');

let db = require('knex')({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'postgres', // 自分のOSのユーザに変更
    password: '07310727',
    database: 'attendancedb',
    charset: 'utf8' 
  }
});

app.use(helmet());
app.use(bodyParser.json());
app.use(express.json({ type: 'application/json; charset=utf-8' }));
app.use(express.urlencoded({ extended: true, type: 'application/x-www-form-urlencoded; charset=utf-8' }));
app.use(morgan('combined'));
// 静的ファイルの提供 
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { 
  setHeaders: (res) => { res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); 

  } }));

// Multerの設定
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const utf8FileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, Date.now() + '-' + utf8FileName);
  }
});
const upload = multer({ storage: storage });

const resetCheckInFlags = async () => {
  try {
    await db('attendance').update({ is_checked_in: false });
    console.log('is_checked_in flags reset successfully');
  } catch (error) {
    console.error('Error resetting is_checked_in flags:', error);
  }
};

// 毎日深夜3時に実行
const job = new cron.CronJob('0 3 * * *', resetCheckInFlags, null, true, 'Asia/Tokyo');
job.start();


//ルーター
app.get('/', (req, res) => res.send('サーバーが実行中です!'));
app.get('/get', (req, res) => accountsController.getData(req, res, db));
app.post('/post', (req, res) => accountsController.postData(req, res, db));
app.put('/put', (req, res) => accountsController.putData(req, res, db));
app.delete('/delete', (req, res) => accountsController.delData(req, res, db));
app.post('/login', (req, res) => accountsController.loginData(req, res, db));
app.get('/user/:id', (req, res) => accountsController.newData(req, res, db));
//勤怠
app.post('/attendance', (req, res) => accountsController.attData(req, res, db));
app.get('/attendance/status/:id', (req, res) => accountsController.attgetData(req, res, db));
app.get('/attendance/checkin/:accounts_id/:date', (req, res) => accountsController.checkIn(req, res, db));
app.get('/attendance/attendance/:accounts_id/:date', (req, res) => accountsController.dateData(req, res, db));
app.get('/attendance/cost/:accounts_id/:date2', (req, res) => accountsController.memberCostData(req, res, db));
app.get('/attendance/:accounts_id/:year/:month', (req, res) => accountsController.monthData(req, res, db));
//標準勤務時間
app.get('/overuser/:accounts_id', (req, res) => accountsController.overUser(req, res, db));
app.post('/overtime', (req, res) => accountsController.overData(req, res, db));
//プロジェクト情報
app.post('/projects', (req, res) => accountsController.projectsData(req, res, db));
app.post('/projects_put', (req, res) => accountsController.projectsPut(req, res, db));
app.post('/projects_flag', (req, res) => accountsController.projectsFlag(req, res, db));
app.get('/projects/:accounts_id/:year/:month', (req, res) => accountsController.projectUser(req, res, db));
//メンバー勤怠
app.get('/attendance/total_hours/:accounts_id/:year/:month/:lastMonday/:lastSunday', (req, res) => accountsController.getMonthlyTotalHours(req, res, db));
app.post('/remarks', (req, res) => accountsController.newRemarks(req, res, db));
app.post('/time', (req, res) => accountsController.newTime(req, res, db));
//交通費
app.get('/expenses/:accounts_id/:month', (req, res) => accountsController.expensesData(req, res, db));
app.post('/expenses', (req, res) => accountsController.newExpenses(req, res, db));
//代休
app.post('/holiday', (req, res) => accountsController.holidayPost(req, res, db));
app.get('/holiday/:accounts_id', (req, res) => accountsController.holidayData(req, res, db));
app.delete('/holiday_delete', (req, res) => accountsController.delHolidayData(req, res, db));
//管理者パスワード
app.get('/pass', (req, res) => accountsController.passData(req, res, db));
app.put('/pass_edit', (req, res) => accountsController.passPut(req, res, db));
//経費
app.post('/api/expenses',upload.single('receipt_image'), (req, res) => accountsController.imagePost(req, res, db));
app.get('/api/expenses2/:accounts_id/:month', (req, res) => { 
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); 
  accountsController.imageData(req, res, db); 
});
// 画像を提供するためのエンドポイントにヘッダーを設定 
app.get('/uploads/:filename', (req, res) => { 
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); 
  res.sendFile(path.join(__dirname, 'uploads', req.params.filename)); 
});
//画像を削除する
app.delete('/uploads/:filename', (req, res) => { 
  const filePath = path.join(__dirname, 'uploads', req.params.filename); 
  console.log(`Deleting file at: ${filePath}`); // ファイルが存在するか確認 
  if (fs.existsSync(filePath)) { // ファイルシステムから画像を削除 
    fs.unlink(filePath, (err) => { 
      if (err) { console.error('ファイルの削除中にエラーが発生しました:', err); 
        res.status(500).json({ error: 'ファイルの削除に失敗しました' }); 
      } else { 
        console.log('File deleted successfully.'); 
        res.json({ delete: 'true' }); 
      } 
    }); 
  } else { 
    console.error('ファイルが見つかりません:', filePath); 
    res.status(404).json({ error: 'ファイルが見つかりません' }); 
  } 
});
app.delete('/cost_delete', (req, res) => accountsController.costDelete(req, res, db));

//サーバ接続
app.listen(process.env.PORT || 3000, () => {
  console.log(`port ${process.env.PORT || 3000}`);
});
