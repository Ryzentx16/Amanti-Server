// import the User model and jwt library
const UserQueries = require("../user/queries");

const SocketAuthenticator = async (socket, userId) => {
  try {
    // find the user in the database using the user ID
    const user = await UserQueries.retrieve({ id: userId });

    // verify that the user exists
    if (!user) {
      throw new Error("User not found");
    }

    // add the user to the socket object
    socket.user = user[0];

    return user[0];
  } catch (error) {
    console.log(error);
    return null;
  }
};
module.exports = SocketAuthenticator;
