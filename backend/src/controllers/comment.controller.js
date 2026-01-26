const asyncHandler = require("express-async-handler");
const Comment = require("../models/comment.model.js");
const Post = require("../models/post.model.js");
const User = require("../models/User.js");

exports.getComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const comments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture");

  res.status(200).json({ comments });
});

exports.createComment = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Comment content is required" });
  }

  const user = await User.findOne({ _id: userId });
  const post = await Post.findById(postId);

  if (!user || !post) return res.status(404).json({ error: "User or post not found" });

  const comment = await Comment.create({
    user: userId,
    post: postId,
    content,
  });

  // link the comment to the post
  await Post.findByIdAndUpdate(postId, {
    $push: { comments: comment._id },
  });

  // // create notification if not commenting on own post
  // if (post.user.toString() !== userId.toString()) {
  //   await Notification.create({
  //     from: userId,
  //     to: post.user,
  //     type: "comment",
  //     post: postId,
  //     comment: comment._id,
  //   });
  // }

  res.status(201).json({ comment });
});

exports.deleteComment = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { commentId } = req.params;

  const user = await User.findOne({ _id: userId });
  const comment = await Comment.findById(commentId);

  if (!user || !comment) {
    return res.status(404).json({ error: "User or comment not found" });
  }

  if (comment.user.toString() !== userId.toString()) {
    return res.status(403).json({ error: "You can only delete your own comments" });
  }

  // remove comment from post
  await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: commentId },
  });

  // delete the comment
  await Comment.findByIdAndDelete(commentId);

  res.status(200).json({ message: "Comment deleted successfully" });
});