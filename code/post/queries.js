const DataAccessLayer = require("../DAL/DataAccessLayer");
const shared = require("../shared/shared");

const PostQueries = {
  create: async (params) => {
    var query =
      "insert into " +
      shared.dbName +
      ".Posts (createdDateTime,image,numOfComments,numOfLikes,numOfShares,content,location,userId) values (?,?,?,?,?,?,?,?)";

    var values = [
      new Date().toISOString(),
      params.image ? params.image : null,
      0,
      0,
      0,
      params.content,
      params.location,
      params.userId,
    ];

    const add_post_query_res = await DataAccessLayer.ExcuteCommand(
      query,
      values
    );

    if (add_post_query_res.name === "Error") {
      return {
        success: false,
        message: "db error",
        errors: ["something wrong on the input"],
      };
    }
    if (!add_post_query_res) {
      return {
        success: false,
        message: "Not exist in db",
        errors: [params.userId + " " + "not exists"],
      };
    } else if (add_post_query_res) {
      return { success: true, message: "Post created successful" };
    }
  },

  delete: async (params) => {
    var query = "delete from " + shared.dbName + ".Posts where ?";

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
      return { success: true, message: "Post deleted successful" };
    }
  },

  update: async (params) => {
    var query = "update " + shared.dbName + ".Posts set  ? where ?";

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
      return { success: true, message: "Post updated successful" };
    }
  },

  like: async (isLike, params) => {
    var query =
      "update " +
      shared.dbName +
      ".Posts set numOfLikes = numOfLikes + " +
      isLike
        ? 1
        : -1 + " where ?";

    const update_query_res = await DataAccessLayer.ExcuteCommand(query, [
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
      return { success: true, message: "Post updated successful" };
    }
  },

  retrieve: async (page, perPage, params) => {
    var condition = "";
    var values = [];

    if (Object.keys(params).length > 0) {
      condition = " WHERE ?";
      values = [params];
    }

    const offset = (page - 1) * perPage;
    const limit = perPage;

    var query = `SELECT * from ${shared.dbName}.Posts ${condition} ORDER BY createdDateTime DESC, id DESC LIMIT ? OFFSET ?`;

    values.push(limit);
    values.push(offset);

    const get_post_query_res = await DataAccessLayer.SelectData(query, values);

    if (get_post_query_res == null || get_post_query_res.name === "Error") {
      return null;
    } else if (get_post_query_res) {
      return get_post_query_res;
    }
  },
};

module.exports = PostQueries;
