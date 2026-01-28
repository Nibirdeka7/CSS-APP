const asyncHandler = require("express-async-handler");
const Post = require("../models/post.model");
// const Notification = require("../models/notification.model");
const Comment = require("../models/comment.model");
const User = require("../models/User.js");
const cloudinary = require("../config/cloudinary");
const redis = require("../config/redis");

exports.getPosts = asyncHandler(async (req, res) => {
  const cacheKey = "posts:all";
  const cachedPosts = await redis.get(cacheKey);
  if (cachedPosts) {
    return res.status(200).json({ posts: cachedPosts});
  }
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("user", "username profilePicture scholarId")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "name username profilePicture",
      },
    });
  await redis.set(cacheKey, posts, { ex : 600});

  res.status(200).json({ posts });
});

exports.getPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId)
    .populate("user", "username profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username profilePicture",
      },
    });

  if (!post) return res.status(404).json({ error: "Post not found" });

  res.status(200).json({ post });
});

exports.getUserPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const userId = req.user.id;
  const user = await User.findOne({ _id: userId });
  if (!user) return res.status(404).json({ error: "User not found" });

  const posts = await Post.find({ user: user._id })
    .sort({ createdAt: -1 })
    .populate("user", "username profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username profilePicture",
      },
    });

  res.status(200).json({ posts });
});

exports.createPost = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { content } = req.body;
  const imageFile = req.file;

  if (!content && !imageFile) {
    return res.status(400).json({ error: "Post must contain either text or image" });
  }

  let imageUrl = "";

  // upload image to Cloudinary if provided
  if (imageFile) {
    try {
      // convert buffer to base64 for cloudinary
      const base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString(
        "base64"
      )}`;

      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "social_media_posts",
        resource_type: "image",
      });
      imageUrl = uploadResponse.secure_url;
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res.status(400).json({ error: "Failed to upload image" });
    }
  }

  const post = await Post.create({
    user: userId,
    content: content || "",
    image: imageUrl,
  });

  await redis.del("posts:all");
  await redis.del(`posts:user:${userId}`);

  res.status(201).json({ post });
});

exports.likePost = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.params;

  const user = await User.findOne({ _id: userId });
  const post = await Post.findById(postId);

  if (!user || !post) return res.status(404).json({ error: "User or post not found" });

  const isLiked = post.likes.includes(userId);

  if (isLiked) {
    // unlike
    await Post.findByIdAndUpdate(postId, {
      $pull: { likes: userId },
    });
  } else {
    // like
    await Post.findByIdAndUpdate(postId, {
      $push: { likes: userId },
    });

    // create notification if not liking own post
    // if (post.user.toString() !== user._id.toString()) {
    //   await Notification.create({
    //     from: user._id,
    //     to: post.user,
    //     type: "like",
    //     post: postId,
    //   });
    // }
  }
  await redis.del("posts:all");
  await redis.del(`post:single:${postId}`);
  await redis.del(`posts:user:${post.user.toString()}`);
  await post.save();

  res.status(200).json({
    message: isLiked ? "Post unliked successfully" : "Post liked successfully",
  });
});

exports.deletePost = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { postId } = req.params;

  const user = await User.findOne({ _id: userId });
  const post = await Post.findById(postId);

  if (!user || !post) return res.status(404).json({ error: "User or post not found" });

  if (post.user.toString() !== userId.toString()) {
    return res.status(403).json({ error: "You can only delete your own posts" });
  }

  // delete all comments on this post
  await Comment.deleteMany({ post: postId });

  // delete the post
  await Post.findByIdAndDelete(postId);

  await redis.del("posts:all");
  await redis.del(`post:single:${postId}`);
  await redis.del(`posts:user:${userId}`);

  res.status(200).json({ message: "Post deleted successfully" });
});