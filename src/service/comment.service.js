const connection = require('../app/database')

class CommentService {
  async create(content,momentId,userid){
    const statement = 'INSERT INTO comment (content,moment_id,user_id) VALUES (?,?,?);'
    const [result] = await connection.execute(statement,[content,momentId,userid])
    return result
  }

  async reply(content,momentId,commentId,userid){
    const statement = 'INSERT INTO comment (content,moment_id,comment_id,user_id) VALUES (?,?,?,?);'
    const [result] = await connection.execute(statement,[content,momentId,commentId,userid])
    return result
  }
}

module.exports = new CommentService()