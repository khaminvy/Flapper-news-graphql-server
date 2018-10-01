const graphql = require("graphql");
const { GraphQLObjectType,
        GraphQLID,
        GraphQLString,
        GraphQLInt,
        GraphQLSchema,
        GraphQLList,
        GraphQLNonNull,
      } = graphql;

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    var localStorage = new LocalStorage('./scratch');
}

if(localStorage.getItem("comments") === null)
     localStorage.setItem("comments", JSON.stringify([]));
if(localStorage.getItem("posts") === null)
     localStorage.setItem("posts", JSON.stringify([]));



const PostType = new GraphQLObjectType({
    name: "Post",
    fields: () => ({
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        link: { type: GraphQLString },
        upvotes: { type: GraphQLInt },
        comments: {
           type: new GraphQLList(CommentType),
           resolve(parent, args){
                const comments = JSON.parse(localStorage.getItem("comments"));
                return comments.filter((comment) => {
                    return comment.postId === parent.id;
                });
            }
        }
    })
});

const CommentType = new GraphQLObjectType({
    name: "Comment",
    fields: () => ({
        id: { type: GraphQLID },
        body: { type: GraphQLString },
        author: { type: GraphQLString },
        upvotes: { type: GraphQLInt },
        post: {
            type: PostType,
            resolve(parent, args){
                const posts = JSON.parse(localStorage.getItem("posts"));
                return posts.find((post) => {
                    return post.id === parent.postId;
                });
            }
        }
    })
});

const RootType = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        post: {
            type: PostType,
            args: {id: { type: GraphQLID}},
            resolve(parent, args){
                //Code to get data here
                const posts = JSON.parse(localStorage.getItem("posts"));
                return posts.find((post) => {
                    return post.id === args.id;
                });
            }
        },
        comment: {
            type: CommentType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args){
                //Code to get data here
                const comments = JSON.parse(localStorage.getItem("comments"));
                return comments.find((comment) => {
                    return comment.id === args.id;
                });
            }
        },
        posts: {
            type: new GraphQLList(PostType),
            resolve(parent,args){
                const posts = JSON.parse(localStorage.getItem("posts"));
                return posts;
            }
        },
        comments: {
            type: new GraphQLList(CommentType),
            resolve(parent,args){
                const comments = JSON.parse(localStorage.getItem("comments"));
                return comments;
            }
        },
    }

});

const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        addPost: {
            type: PostType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
                title: { type: GraphQLNonNull(GraphQLString) },
                link: { type: GraphQLNonNull(GraphQLString) },
                upvotes: { type: GraphQLNonNull(GraphQLInt) },
            },
            resolve(parent, args){
                const posts = JSON.parse(localStorage.getItem("posts"));
                let post = {
                    id: args.id,
                    title: args.title,
                    link: args.link,
                    upvotes: args.upvotes,
                };
                posts.push(post);
                localStorage.setItem("posts", JSON.stringify(posts));
                return post;
            }
        },
        addComment: {
            type: CommentType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
                body: { type: GraphQLNonNull(GraphQLString) },
                author: { type: GraphQLNonNull(GraphQLString) },
                upvotes: { type: GraphQLNonNull(GraphQLInt) },
                postId: { type: GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args){
                const comments = JSON.parse(localStorage.getItem("comments"));
                let comment = {
                    id: args.id,
                    body: args.body,
                    author: args.author,
                    upvotes: args.upvotes,
                    postId: args.postId
                };
                comments.push(comment);
                localStorage.setItem("comments", JSON.stringify(comments));
                return comment;
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootType,
    mutation: Mutation
})