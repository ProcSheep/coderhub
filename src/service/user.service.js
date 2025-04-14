const connection = require('../app/database.js')

class UserService {
  async create(user) {
    // 执行sql语句,把用户的数据(user)保存进入数据库
    const {name,password} = user
    const statement = 'INSERT INTO `user` (name,password) VALUES (?,?);'
    // 操作数据库是异步的,解构出关键信息
    const [result] = await connection.execute(statement,[name,password])
    return result 
  }

  async findUserByName(name){
    const statement = 'SELECT * FROM `user` WHERE NAME = ?;'
    const [values] = await connection.execute(statement,[name])
    return values 
  }

  async queryAvatarByUserId(userId){
    // 用户可能上传多张图片,只拿最后一条数据的值(以最新头像为准)
    const statement = 'SELECT * FROM avatar WHERE user_id = ?;'
    const [result] = await connection.execute(statement,[userId])
    return result.pop()
  }

  // 更新用户的头像url地址
  async updateUserAvatar(avatarUrl,user_id){
    const statement = 'UPDATE user SET avatar_url = ? WHERE id = ?;'
    const [result] = await connection.execute(statement,[avatarUrl,user_id])
    return result
  }
}

module.exports = new UserService();
