const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const secretKey = 'yourSecretKey';

//ログイン機能
const loginData = async (req, res, db) => {
  const { email, password } = req.body;
  try {
    const item = await db('accounts').where({ email }).first();
    const user = item.id;
    if (item) {
      const isMatch = await bcrypt.compare(password, item.password);
      if (isMatch) {
        const token = jwt.sign({ id: item.id }, secretKey, { expiresIn: '1h' });
        res.json({ token, user });
      } else {
        res.json({});
      }
    } else {
      res.json({});
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  loginData
}
  