const DataAccessLayer = require("../DAL/DataAccessLayer");
const shared = require("../shared/shared");

const CommentQueries = {
  create: async (params) => {
    var query =
      "insert into " +
      shared.dbName +
      ".Comments (createdDateTime,content,numOfLikes,image,userId,postId,replyId) values (?,?,?,?,?,?,?)";

    var values = [
      new Date().toISOString(),
      params.content,
      0,
      params.image ? params.image : "",
      params.userId,
      params.postId,
      params.replyId ? params.replyId : null,
    ];

    const add_comment_query_res = await DataAccessLayer.ExcuteCommand(
      query,
      values
    );

    if (add_comment_query_res.name === "Error") {
      return {
        success: false,
        message: "db error",
        errors: ["something wrong on the input"],
      };
    }
    if (!add_comment_query_res) {
      return {
        success: false,
        message: "Not exist in db",
        errors: [params.userId + " " + "not exists"],
      };
    } else if (add_comment_query_res) {
      var query =
        "update " +
        shared.dbName +
        `.Posts set numOfComments = numOfComments + 1 where ?`;

      await DataAccessLayer.ExcuteCommand(query, [{ id: params.postId }]);

      return { success: true, message: "Comment created successful" };
    }
  },

  update: async (params) => {
    var query = "update " + shared.dbName + ".Comments set  ? where ?";

    const update_query_res = await DataAccessLayer.ExcuteCommand(query, [
      params.fields,
      params.condition,
    ]);

    if (update_query_res.name === "Error") {
      return {
        success: false,
        message: "db error",
        errors: ["something wrong on the input"],
      };
    }
    if (!update_query_res) {
      return {
        success: false,
        message: "Not exist in db",
        errors: [params.condition.id + " " + "not exists"],
      };
    } else if (update_query_res) {
      return { success: true, message: "Comment updated successful" };
    }
  },

  delete: async (params) => {
    var query = "delete from " + shared.dbName + ".Comments where ?";

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
      return { success: true, message: "Comment deleted successful" };
    }
  },

  retrieve: async (page, perPage, params) => {
    const offset = (page - 1) * perPage;
    const limit = perPage;

    var query = `SELECT * from ${shared.dbName}.Comments WHERE replyId is null and ? ORDER BY createdDateTime DESC, id DESC LIMIT ? OFFSET ?`;

    var values = [{ postId: params.postId }, limit, offset];

    const get_comments_query_res = await DataAccessLayer.SelectData(
      query,
      values
    );

    if (
      get_comments_query_res == null ||
      get_comments_query_res.name === "Error"
    ) {
      return null;
    } else if (get_comments_query_res) {
      return get_comments_query_res;
    }
  },
};

module.exports = CommentQueries;
