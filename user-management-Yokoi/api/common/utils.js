const checkAdminPassword = async (db, authority) => {
  const passData = await db('passdata').select('admin_password').first();
  const adminPassword = passData.admin_password;
  return authority === adminPassword;
};

module.exports = {
  checkAdminPassword
};