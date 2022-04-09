const { Router } = require("express");
const Category = require("../models/category");
const Post = require("../models/post");
const logger = require("../helpers/logger");
const router = Router();

router.get("/", (req, res) => {
    res.render("admin/index", {
        title: "Админ панел",
        isAdminHome: true,
    });
});

router.get("/post", async(req, res) => {
    try {
        const posts = await Post.find().populate("categoryId").lean();
        res.render("admin/post/index", {
            title: "Посты",
            isAdminPost: true,
            posts,
        });
    } catch (e) {
        logger(e);
    }
});

router.get("/category", async(req, res) => {
    try {
        const categories = await Category.find().lean();
        res.render("admin/category/index", {
            title: "Категоры",
            isAdminCategory: true,
            categories,
        });
    } catch (e) {
        logger(e);
    }
});

module.exports = router;