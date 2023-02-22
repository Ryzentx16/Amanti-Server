const mysql = require("mysql");

// create a connection to the database
const connection = mysql.createPool({
  host: "sql876.main-hosting.eu",
  user: "u138139769_ryzentx",
  password: "Abdo@12m",
  database: "u138139769_akhlaquna",
});

async function makeQuery(query) {
  return new Promise((resolve, reject) => {
    connection.query(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

const DataAccessLayer = {
  SelectData: async (query, values = null) => {
    try {
      var sql = mysql.format(query, values);
      var res = await makeQuery(sql);

      if (res.length > 0) return res;
      else return null;
    } catch (error) {
      return error;
    }
  },

  IsExist: async (query, values = null) => {
    try {
      var sql = mysql.format(query, values);
      var res = await makeQuery(sql);

      if (res.length > 0) return true;
      else return false;
    } catch (error) {
      return error;
    }
  },
  ExcuteCommand: async (query, values = null) => {
    try {
      var sql = mysql.format(query, values);
      var res = await makeQuery(sql);

      if (res.affectedRows > 0) return true;
      else return false;
    } catch (error) {
      return error;
    }
  },
};

module.exports = DataAccessLayer;
