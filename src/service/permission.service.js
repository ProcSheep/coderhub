const connection = require('../app/database')

class PermissionService {
  // async checkMomentPermission(momentId,user_id){
  //   // 当momentId(id)和用户user_id都满足条件时,会查询到数据,这就是有权限
  //   const statement = 'SELECT * FROM moment WHERE id = ? AND user_id = ?;'
  //   const [result] = await connection.execute(statement,[momentId,user_id])
  //   return !!result.length // 转为布尔,0为false,其余为true
  // }

  // 鉴定有没有权限
  async checkPermission(resourceName,resourceId,user_id){
    const statement = `SELECT * FROM ${resourceName} WHERE id = ? AND user_id = ?;`
    const [result] = await connection.execute(statement,[resourceId,user_id])
    return !!result.length
  }

  // 鉴定有没有数据
  async checkExists(resourceName,resourceId){
    const statement = `SELECT * FROM ${resourceName} WHERE id = ?;`
    const [result] = await connection.execute(statement,[resourceId])
    return !!result.length // 转为布尔,0为false,其余为true
  }
}

module.exports = new PermissionService()