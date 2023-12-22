const DataAccessLayer = require("../DAL/DataAccessLayer");
const shared = require("../shared/shared");
const vl = require("../utils/validation");

const UserQueries = {
  create: async (params) => {
    errors_list = [];
    const validate_res = vl.validation.phone_validation(params.phoneNumber);
    if (!validate_res) {
      errors_list.push("Phone number isn't in valid fromat");
    }

    var password_validate_res = vl.validation.isValidPassword(params.password);
    if (password_validate_res.length > 0) {
      password_validate_res = vl.validation.correct_password_validationMessage(
        password_validate_res
      );
      errors_list = errors_list.concat(password_validate_res);
    }

    // input errors handler
    if (errors_list.length > 0) {
      return {
        success: false,
        message: "invalid input format",
        errors: errors_list,
      };
    }

    // check email already exist in database or not
    const exist_res = await DataAccessLayer.IsExist(
      "select * from " + shared.dbName + ".Users where ?",
      [{ phoneNumber: params.phoneNumber }]
    );

    if (exist_res) {
      return {
        success: false,
        message: "Already exist in db",
        errors: [params.phoneNumber + " " + "already exists"],
      };
    }

    params.password = vl.validation.hashPassword(params.password);

    // insert user data in data base

    var query =
      "insert into " +
      shared.dbName +
      ".Users (firstName,lastName,password,profileImage,isOtpChecked,phoneNumber) values (?,?,?,?,?,?)";

    var values = [
      params.firstName,
      params.lastName,
      params.password,
      "uploads/user/default.png",
      0,
      params.phoneNumber,
    ];

    const signup_query_res = await DataAccessLayer.ExcuteCommand(query, values);

    if (signup_query_res.name === "Error") {
      return {
        success: false,
        message: "db error",
        errors: ["something wrong on the input"],
      };
    }
    if (!signup_query_res) {
      return {
        success: false,
        message: "Already exist in db",
        errors: [params.phoneNumber + " " + "already exists"],
      };
    } else if (signup_query_res) {
      return { success: true, message: "Signup successful" };
    }
  },

  delete: async (params) => {
    var query = "delete from " + shared.dbName + ".Users where ?";

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
        errors: [params.phoneNumber + " " + "not exists"],
      };
    } else if (delete_query_res) {
      return { success: true, message: "User deleted successful" };
    }
  },

  update: async (params) => {
    errors_list = [];

    if (params.fields.phoneNumber) {
      const validate_res = vl.validation.phone_validation(
        params.fields.phoneNumber
      );
      if (!validate_res) {
        errors_list.push("Phone number isn't in valid fromat");
      }
    }

    if (params.fields.password) {
      var password_validate_res = vl.validation.isValidPassword(
        params.fields.password
      );
      if (password_validate_res.length > 0) {
        password_validate_res =
          vl.validation.correct_password_validationMessage(
            password_validate_res
          );
        errors_list = errors_list.concat(password_validate_res);
      } else {
        params.fields.password = vl.validation.hashPassword(
          params.fields.password
        );
      }
    }

    if (errors_list.length > 0) {
      return {
        success: false,
        message: "invalid input format",
        errors: errors_list,
      };
    }

    var query = "update " + shared.dbName + ".Users set  ? where ?";

    const update_query_res = await DataAccessLayer.ExcuteCommand(query, [
      params.fields,
      params.condition,
    ]);

    if (update_query_res.name === "Error") {
      console.log(update_query_res);
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
        errors: [params.condition.phoneNumber + " " + "not exists"],
      };
    } else if (update_query_res) {
      return { success: true, message: "User updated successful" };
    }
  },

  retrieve: async (params) => {
    var condition = "";
    var password = null;

    if (Object.keys(params).length > 0) {
      condition = " WHERE ?";

      if ("password" in params) {
        password = params.password;

        delete params.password;
      }
    }

    var query = `SELECT * from ${shared.dbName}.Users ${condition}`;

    var values = [params];

    const get_user_query_res = await DataAccessLayer.SelectData(query, values);

    if (get_user_query_res == null || get_user_query_res.name === "Error") {
      return null;
    } else if (get_user_query_res) {
      var passwordComparator = null;

      if (password) {
        passwordComparator = vl.validation.comparePassword(
          get_user_query_res[0].password,
          password
        );

        if (!passwordComparator || get_user_query_res[0].roleLvl < 0) {
          return null;
        }
      }

      return get_user_query_res;
    }
  },

  login: async (params) => {
    errors_list = [];

    console.log(`login User ${params.phoneNumber}`);

    var condition = "";
    var password = params.password;

    if (Object.keys(params).length > 0) {
      condition = " WHERE ?";

      delete params.password;
    }

    var query = `SELECT * from ${shared.dbName}.Users ${condition}`;
    var values = [params];

    const login_query_res = await DataAccessLayer.SelectData(query, values);
    if (login_query_res?.name === "Error") {
      return {
        success: false,
        message: "db error",
        errors: ["something wrong on the input"],
      };
    }

    if (!login_query_res) {
      return {
        success: false,
        message: "user not exist in db",
        errors: [params.phoneNumber + " " + "doesn't exists"],
      };
    } else if (login_query_res) {
      var passwordComparator = null;

      //validate password
      if (password) {
        passwordComparator = vl.validation.comparePassword(
          login_query_res[0].password,
          password
        );

        if (!passwordComparator) {
          console.log({
            success: false,
            message: "wrong password",
            errors: ["Phone number or password incorrect"],
          });
          return {
            success: false,
            message: "wrong password",
            errors: ["Phone number or password incorrect"],
          };
        }

        if (!(login_query_res[0].roleLvl >= 0)) {
          return {
            success: false,
            message: "access denied",
            errors: [
              "The entered number is blocked from using the app",
              ...errors_list,
            ],
          };
        }
      }

      return {
        success: true,
        message: "User login successful",
        result: login_query_res[0],
      };
    }

    return null;
  },
};

module.exports = UserQueries;
