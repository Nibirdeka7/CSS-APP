const express = require("express");
const { protect } = require("../middleware/authMiddleware.js");
const  commentController = require("../controllers/comment.controller.js");

const router = express.Router();

// public routes
router.get("/post/:postId", commentController.getComments);

// protected routes
router.post("/post/:postId", protect, commentController.createComment);
router.delete("/:commentId", protect, commentController.deleteComment);

module.exports = router;
