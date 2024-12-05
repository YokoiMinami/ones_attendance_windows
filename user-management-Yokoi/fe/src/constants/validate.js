// export const validateForm = () => {
//   const newErrors = {};
//   const katakanaRegex = /^[ァ-ヶー　]*$/; // カタカナのみを許可する正規表現
//   const alphanumericRegex = /^[a-zA-Z0-9]*$/; // 英数字のみを許可する正規表現

//   if (!company_state.company) newErrors.company = '会社名を入力してください';
//   if (!state.fullname) newErrors.fullname = '氏名を入力してください';
//   if (!state.kananame) {
//     newErrors.kananame = 'ヨミガナを入力してください';
//   } else if (!katakanaRegex.test(state.kananame)) {
//     newErrors.kananame = 'ヨミガナはカタカナで入力してください';
//   }
//   if (!state.email) {
//     newErrors.email = 'Emailを入力してください';
//   } else if (!/\S+@\S+\.\S+/.test(state.email)) {
//     newErrors.email = '有効なEmailを入力してください';
//   }
//   if (!team_state.team) newErrors.team = '所属するチームを入力してください';
//   if (!state.password) {
//     newErrors.password = 'パスワードを入力してください';
//   } else if (!alphanumericRegex.test(state.password)) {
//     newErrors.password = 'パスワードは英数字のみで入力してください';
//   }

//   return newErrors;
// };