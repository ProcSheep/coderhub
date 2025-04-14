const connection = require('../app/database')

class FileService {
  async create(filename,mimetype,size,user_id){
    const statement = 'INSERT INTO avatar (filename,mimetype,size,user_id) VALUES (?,?,?,?);'
    const [result] = await connection.execute(statement,[filename,mimetype,size,user_id])
    return result
  }
}

module.exports = new FileService()