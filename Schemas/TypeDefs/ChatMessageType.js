const graphql = require("graphql");
const User = require("./UserType");
const UserLogic = require("../../code/user");
const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLList,
} = graphql;

var ChatMessage = {
  Type: new GraphQLObjectType({
    name: "ChatMessage",
    fields: () => ({
      id: { type: GraphQLInt },
      createdDateTime: { type: GraphQLString },
      content: { type: GraphQLString },
      image: { type: GraphQLString },
      senderUser: {
        type: User.Type,
        resolve: async (parent, args) => {
          const result = await UserLogic.Queries.retrieve({
            id: parent.senderId,
          });

          return result[0];
        },
      },
      recieverUser: {
        type: User.Type,
        resolve: async (parent, args) => {
          const result = await UserLogic.Queries.retrieve({
            id: parent.receiverId,
          });

          return result[0];
        },
      },
    }),
  }),

  ResultType: new GraphQLObjectType({
    name: "ChatMessageResult",
    fields: {
      success: { type: GraphQLBoolean },
      message: { type: GraphQLString },
      errors: { type: new GraphQLList(GraphQLString) },
    },
  }),
};

module.exports = ChatMessage;
