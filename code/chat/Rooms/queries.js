const DataAccessLayer = require("../../DAL/DataAccessLayer");
const shared = require("../../shared/shared");

const ChatRoomQueries = {
  create: async (params) => {
    // check email already exist in database or not
    const exist_res = await DataAccessLayer.SelectData(
      `select * from ${shared.dbName}.ChatRoom where (user1Id = ${params.user1Id} and user2Id = ${params.user2Id}) or 
      (user1Id = ${params.user2Id} and user2Id = ${params.user1Id})`
    );

    if (exist_res) {
      return {
        success: false,
        message: "Already exist in db",
        errors: ["Chat room already exists"],
        roomId: exist_res[0].id,
      };
    }

    var query =
      "insert into " +
      shared.dbName +
      ".ChatRoom (createdDateTime,user1Id,user2Id) values (DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'),?,?)";

    var values = [params.user1Id, params.user2Id];

    const add_chat_room_query_res = await DataAccessLayer.ExcuteCommand(
      query,
      values
    );

    if (add_chat_room_query_res.name === "Error") {
      return {
        success: false,
        message: "db error",
        errors: ["something wrong on the input"],
      };
    }
    if (!add_chat_room_query_res) {
      return {
        success: false,
        message: "Not exist in db",
        errors: [params.user1Id + " or " + params.user2Id + " not exists"],
      };
    } else if (add_chat_room_query_res) {
      const res = await DataAccessLayer.SelectData(
        `select * from ${shared.dbName}.ChatRoom where (user1Id = ${params.user1Id} and user2Id = ${params.user2Id}) or 
        (user1Id = ${params.user2Id} and user2Id = ${params.user1Id})`
      );

      return {
        success: true,
        message: "Chat Room created successful",
        roomId: res[0].id,
      };
    }
  },

  delete: async (params) => {
    var query = "delete from " + shared.dbName + ".ChatRoom where ?";

    const delete_query_res = await DataAccessLayer.ExcuteCommand(query, params);

    if (delete_query_res.name === "Error") {
      return {
        success: false,
        message: "db error",
        errors: ["something wrong on the input"],
      };
    }
    if (!delete_query_res) {
      return {
        success: false,
        message: "Not exist in db",
        errors: [params.id + " " + "not exists"],
      };
    } else if (delete_query_res) {
      return { success: true, message: "Chat Room deleted successful" };
    }
  },

  retrieve: async (page, perPage, params) => {
    const offset = (page - 1) * perPage;
    const limit = perPage;

    var query = `SELECT ${shared.dbName}.ChatRoom.id, ${shared.dbName}.ChatRoom.createdDateTime, ${shared.dbName}.Users.id as userId, 
                  MAX(${shared.dbName}.ChatMessages.id) AS lastMessageId FROM ${shared.dbName}.ChatRoom JOIN ${shared.dbName}.Users ON 
                  (${shared.dbName}.ChatRoom.user1Id = ${shared.dbName}.Users.id OR ${shared.dbName}.ChatRoom.user2Id = ${shared.dbName}.Users.id) 
                  LEFT JOIN ${shared.dbName}.ChatMessages ON ${shared.dbName}.ChatMessages.chatRoomId = ${shared.dbName}.ChatRoom.id 
                  WHERE (${shared.dbName}.ChatRoom.user1Id = ? OR ${shared.dbName}.ChatRoom.user2Id = ?) AND ${shared.dbName}.Users.id != ? 
                  GROUP BY ${shared.dbName}.ChatRoom.id,userId 
                  ORDER BY ${shared.dbName}.ChatRoom.createdDateTime DESC, lastMessageId DESC  LIMIT ? OFFSET ?`;

    const values = [params.userId, params.userId, params.userId, limit, offset];

    const get_chat_rooms_query_res = await DataAccessLayer.SelectData(
      query,
      values
    );

    if (
      get_chat_rooms_query_res == null ||
      get_chat_rooms_query_res.name === "Error"
    ) {
      return null;
    } else if (get_chat_rooms_query_res) {
      return get_chat_rooms_query_res;
    }
  },
};

module.exports = ChatRoomQueries;
