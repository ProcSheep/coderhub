const connection = require('../app/database')

class LabelService {
  // 1.创建新标签
  async create(name){
    const statement = 'INSERT INTO label (name) VALUES (?);'
    const [result] = await connection.execute(statement,[name])
    return result
  }
  // 2.根据标签名字查询label表中是否有这个数据
  async queryLabelByName(name){
    const statement = 'SELECT * FROM label WHERE name = ?;'
    const [result] = await connection.execute(statement,[name])
    return result[0]
  }
}

module.exports = new LabelService()