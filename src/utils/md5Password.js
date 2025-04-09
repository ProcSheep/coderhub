// 使用md5加密密码(不可逆的)
// 需要第三方库,node内置的库
const crypto = require('crypto')
function md5Password(password){
  // 创建md5的hash加密算法
  const md5 = crypto.createHash('md5')
  // 把加密的结果转为十六进制
  return md5.update(password).digest('hex')
}

module.exports = md5Password