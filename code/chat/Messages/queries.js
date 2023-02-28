const DataAccessLayer = require("../../DAL/DataAccessLayer");
const shared = require("../../shared/shared");

const ChatMessagesQueries = {
  create: async (params) => {
    var query =
      "insert into " +
      shared.dbName +
      ".ChatMessages (createdDateTime,content,image,senderId,receiverId,chatRoomId) values (DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'),?,?,?,?,?)";

    var values = [
      params.content,
      params.image ? params.image : null,
      params.senderId,
      params.receiverId,
      params.roomId,
    ];

    const add_chat_message_query_res = await DataAccessLayer.ExcuteCommand(
      query,
      values
    );
    
    if (add_chat_message_query_res.name === "Error") {
      return {
        success: false,
        message: "db error",
        errors: ["something wrong on the input"],
      };
    }
    if (!add_chat_message_query_res) {
      return {
        success: false,
        message: "Not exist in db",
        errors: [params.senderId + " or " + params.receiverId + " not exists"],
      };
    } else if (add_chat_message_query_res) {
      return { success: true, message: "Chat Message created successful" };
    }
  },

  delete: async (params) => {
    var query = "delete from " + shared.dbName + ".Posts ChatMessages ?";

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
      return { success: true, message: "Chat Message deleted successful" };
    }
  },

  retrieve: async (page, perPage, params) => {
    const offset = (page - 1) * perPage;
    const limit = perPage;

    var query = `SELECT * from ${shared.dbName}.ChatMessages where ? ORDER BY createdDateTime DESC, id DESC LIMIT ? OFFSET ?`;

    const values = [params.id ? { id: params.id } : params, limit, offset];

    const get_chat_messages_query_res = await DataAccessLayer.SelectData(
      query,
      values
    );

    if (
      get_chat_messages_query_res == null ||
      get_chat_messages_query_res.name === "Error"
    ) {
      return null;
    } else if (get_chat_messages_query_res) {
      return get_chat_messages_query_res;
    }
  },
};

module.exports = ChatMessagesQueries;
