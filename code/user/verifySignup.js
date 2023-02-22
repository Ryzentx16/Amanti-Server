const DataAccessLayer = require("../DAL/DataAccessLayer");
const shared = require("../shared/shared");

async function VerifyUser(response) {
  // check email already exist in database or not
  const exist_res = await DataAccessLayer.IsExist(
    "select * from " + shared.dbName + ".Users where PhoneNumber = ?",
    [response.phoneNumber]
  );

  if (!exist_res) {
    return {
      success: false,
      message: "Already exist in db",
      errors: [response.email + " " + "already exists"],
    };
  }

  var query =
    "update " +
    shared.dbName +
    ".Users set isOtpChecked = ? where  PhoneNumber = ?";

  var isVerified = false;

  if ((response.otp == "123456")) {
    isVerified = true;
  }
  
  var values = [isVerified, response.phoneNumber];

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
      errors: [response.phoneNumber + " " + "already exists"],
    };
  } else if (signup_query_res) {
    return { success: true, message: "Verified successful" };
  }
}

module.exports = VerifyUser;
