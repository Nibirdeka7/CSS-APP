const express = require("express");
const postController = require("../controllers/post.controller.js");
const { protect } = require("../middleware/authMiddleware.js");
const upload = require("../middleware/upload.middleware.js");

const router = express.Router();

// public routes
router.get("/", postController.getPosts);
router.get("/:postId", postController.getPost);
router.get("/user/:username", postController.getUserPosts);

// protected routes
router.post("/", protect, upload.single("image"), postController.createPost);
router.post("/:postId/like", protect, postController.likePost);
router.delete("/:postId", protect, postController.deletePost);

module.exports = router;