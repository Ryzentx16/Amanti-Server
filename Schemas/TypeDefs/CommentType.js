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

const ReplyType = new GraphQLObjectType({
  name: "Reply",
  fields: () => ({
    id: { type: GraphQLInt },
    createdDateTime: { type: GraphQLString },
    content: { type: GraphQLString },
    resolve: async (parent, args) => {
      const result = await UserLogic.Utils.getData({
        id: parent.userId,
      });

      return result[0];
    },
    parentCommentId: { type: GraphQLInt },
  }),
});

var Comment = {
  Type: new GraphQLObjectType({
    name: "Comment",
    fields: () => ({
      id: { type: GraphQLInt },
      createdDateTime: { type: GraphQLString },
      content: { type: GraphQLString },
      numOfLikes: { type: GraphQLInt },
      image: { type: GraphQLString },
      user: {
        type: User.Type,
        resolve: async (parent, args) => {
          const result = await UserLogic.Queries.retrieve({
            id: parent.userId,
          });

          return result[0];
        },
      },

      // replies: {
      //   type: new GraphQLList(ReplyType),
      //   resolve: (comment) => {
      //     // code to fetch all replies associated with the comment from the database
      //   },
      // },
    }),
  }),

  InputTypes: {
    Add: new GraphQLInputObjectType({
      name: "AddCommentInput",
      fields: {
        content: { type: new GraphQLNonNull(GraphQLString) },
        userId: { type: new GraphQLNonNull(GraphQLInt) },
        postId: { type: new GraphQLNonNull(GraphQLInt) },
        replyId: { type: GraphQLInt },
        image: { type: GraphQLString },
      },
    }),
    Edit: new GraphQLInputObjectType({
      name: "EditCommentInput",
      fields: {
        content: { type: GraphQLString },
        image: { type: GraphQLString },
        numOfLikes: { type: GraphQLInt },
      },
    }),
  },

  ResultType: new GraphQLObjectType({
    name: "CommentResult",
    fields: {
      success: { type: GraphQLBoolean },
      message: { type: GraphQLString },
      errors: { type: new GraphQLList(GraphQLString) },
    },
  }),
};

module.exports = Comment;
