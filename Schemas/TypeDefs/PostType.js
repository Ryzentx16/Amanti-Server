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

var Post = {
  Type: new GraphQLObjectType({
    name: "Post",
    fields: () => ({
      id: { type: GraphQLInt },
      createdDateTime: { type: GraphQLString },
      content: { type: GraphQLString },
      numOfComments: { type: GraphQLInt },
      numOfLikes: { type: GraphQLInt },
      numOfShares: { type: GraphQLInt },
      area: { type: GraphQLString },
      location: { type: GraphQLString },
      image: { type: GraphQLString },
      postTypes: { type: GraphQLInt },
      isLikedByMe: { type: GraphQLBoolean },
      user: {
        type: User.Type,
        resolve: async (parent, args) => {
          const result = await UserLogic.Queries.retrieve({
            id: parent.userId,
          });

          return result[0];
        },
      },
    }),
  }),

  InputTypes: {
    Add: new GraphQLInputObjectType({
      name: "AddPostInput",
      fields: {
        content: { type: new GraphQLNonNull(GraphQLString) },
        area: { type: new GraphQLNonNull(GraphQLString) },
        location: { type: new GraphQLNonNull(GraphQLString) },
        userId: { type: new GraphQLNonNull(GraphQLInt) },
        postTypes: { type: new GraphQLNonNull(GraphQLInt) },
        image: { type: GraphQLString },
      },
    }),
    Edit: new GraphQLInputObjectType({
      name: "EditPostInput",
      fields: {
        content: { type: GraphQLString },
        area: { type: GraphQLString },
        location: { type: GraphQLString },
        image: { type: GraphQLString },
        numOfComments: { type: GraphQLInt },
        numOfLikes: { type: GraphQLInt },
        numOfShares: { type: GraphQLInt },
        postTypes: { type: GraphQLInt },
      },
    }),
  },

  ResultType: new GraphQLObjectType({
    name: "PostResult",
    fields: {
      success: { type: GraphQLBoolean },
      message: { type: GraphQLString },
      errors: { type: new GraphQLList(GraphQLString) },
    },
  }),
};

module.exports = Post;
