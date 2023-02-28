const graphql = require("graphql");
const User = require("./UserType");
const ChatMessage = require("./ChatMessageType");
const UserLogic = require("../../code/user");
const ChatMessagesLogic = require("../../code/chat/Messages");

const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLNonNull,
} = graphql;

var ChatRoom = {
  Type: new GraphQLObjectType({
    name: "ChatRoom",
    fields: () => ({
      id: { type: GraphQLInt },
      createdDateTime: { type: GraphQLString },
      user: {
        type: User.Type,
        resolve: async (parent, args) => {
          const result = await UserLogic.Queries.retrieve({
            id: parent.userId,
          });

          return result[0];
        },
      },
      lastMessage: {
        type: ChatMessage.Type,
        resolve: async (parent, args) => {
          if (parent.lastMessageId == null) {
            return null;
          }

          const result = await ChatMessagesLogic.Queries.retrieve(1, 1, {
            id: parent.lastMessageId,
          });

          return result[0];
        },
      },
    }),
  }),

  InputTypes: {
    Add: new GraphQLInputObjectType({
      name: "AddChatRoomInput",
      fields: {
        user1Id: { type: new GraphQLNonNull(GraphQLInt) },
        user2Id: { type: new GraphQLNonNull(GraphQLInt) },
      },
    }),
  },

  ResultType: new GraphQLObjectType({
    name: "ChatRoomResult",
    fields: {
      success: { type: GraphQLBoolean },
      message: { type: GraphQLString },
      errors: { type: new GraphQLList(GraphQLString) },
      roomId: { type: GraphQLInt },
    },
  }),
};

module.exports = ChatRoom;
