const DataAccessLayer = require("../DAL/DataAccessLayer");
const shared = require("../shared/shared");

const PostQueries = {
  create: async (params) => {
    var query =
      "insert into " +
      shared.dbName +
      ".Posts (createdDateTime,image,numOfComments,numOfLikes,numOfShares,content,location,postTypes,userId) values (DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'),?,?,?,?,?,?,?,?)";

    var values = [
      params.image ? params.image : null,
      0,
      0,
      0,
      params.content,
      params.location,
      params.postTypes,
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

  like: async (args, params) => {
    var temp_str = "";

    if (args.isLike) {
      temp_str = "numOfLikes + 1 ";
    } else {
      temp_str = "numOfLikes - 1 ";
    }
    var query =
      "update " +
      shared.dbName +
      `.Posts set numOfLikes = IF(${temp_str} < 1,0,${temp_str}) where ?`;

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
      if (args.isLike) {
        var query =
          "INSERT INTO  " +
          shared.dbName +
          `.UserLikePost (userId,postId)  values (?,?)`;

        await DataAccessLayer.ExcuteCommand(query, [
          args.userId,
          params.condition.id,
        ]);
      } else {
        var query =
          "delete from " +
          shared.dbName +
          `.UserLikePost where userId = ? and postId  = ?`;

        await DataAccessLayer.ExcuteCommand(query, [
          args.userId,
          params.condition.id,
        ]);
      }

      return { success: true, message: "Post updated successful" };
    }
  },

  retrieve: async (page, perPage, userId, params) => {
    var condition = "";
    var values = [];

    values.push(userId);

    if (Object.keys(params).length > 0) {
      condition = " WHERE ?";
      if ("conditionUserId" in params) {
        params["p.userId"] = params.conditionUserId;

        delete params.conditionUserId;
      }
      values.push(params);
    }

    const offset = (page - 1) * perPage;
    const limit = perPage;

    var query = `SELECT p.*, IF(pl.userId IS NOT NULL, true, false) AS isLikedByMe from ${shared.dbName}.Posts p LEFT JOIN UserLikePost pl ON p.id = pl.postId AND pl.userId = ? 
                ${condition} ORDER BY createdDateTime DESC, id DESC LIMIT ? OFFSET ?`;

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
