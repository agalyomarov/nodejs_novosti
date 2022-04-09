const { Router } = require("express");
const Category = require("../../models/category");
const { validationResult } = require("express-validator");
const { postValidators } = require("../../validators/admin/postValidators");
const Post = require("../../models/post");
const logger = require("../../helpers/logger");
const fs = require("fs");
const ConnectMongoDBSession = require("connect-mongodb-session");
const router = Router();
router.get("/create", async(req, res) => {
    try {
        const categories = await Category.find().lean();
        res.render("admin/post/create", {
            title: "Добавить пост ",
            isAdminPost: true,
            categories,
            postError: req.flash("postError"),
        });
    } catch (err) {
        logger(err);
    }
});

router.post("/", postValidators, async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (req.file) {
                fs.unlink(req.file.path, () => {});
            }
            req.flash("postError", errors.array()[0].msg);
            return res.status(442).redirect("/admin/post/create");
        }
        const post = new Post({
            title: req.body.title,
            text: req.body.text,
            preview: req.file.path,
            categoryId: req.body.categoryId,
        });
        await post.save();
        res.redirect("/admin/post");
    } catch (err) {
        logger(err);
    }
});

router.delete("/", (req, res) => {
    try {
        Post.findByIdAndDelete(req.body.id).exec((err, res) => {
            fs.access(res.preview, fs.constants.F_OK, (err) => {
                if (err) {
                    logger(err);
                } else {
                    fs.unlink(res.preview, (err) => {
                        if (err) {
                            logger(err);
                        }
                    });
                }
            });
        });
        res.redirect("/admin/post");
    } catch (err) {
        logger(err);
    }
});

router.get("/:id/edit", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id).lean();
        const categories = await Category.find().lean();
        res.render("admin/post/edit", {
            title: "Редактировать пост",
            post,
            categories,
            postError: req.flash("postError"),
        });
    } catch (err) {
        logger(err);
    }
});

router.put("/", postValidators, async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash("postError", errors.array()[0].msg);
            return res.status(442).redirect("back");
        }
        if (req.file) {
            fs.unlink(req.body._preview, () => {});
        }
        const post = await Post.findById(req.body.id);
        Object.assign(post, req.body);
        if (req.file) {
            post.preview = req.file.path;
        }
        await post.save();
        res.redirect("/admin/post");
    } catch (err) {
        logger(err);
    }
});
module.exports = router;