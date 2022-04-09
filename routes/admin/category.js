const { Router } = require("express");
const Category = require("../../models/category");
const logger = require("../../helpers/logger");
const { validationResult } = require("express-validator");
const {
    categoryValidators,
} = require("../../validators/admin/categoryValidators");

const router = Router();

router.get("/create", (req, res) => {
    res.render("admin/category/create", {
        title: "Добавить категории ",
        isAdminCategory: true,
        categoryError: req.flash("categoryError"),
    });
});

router.post("/", categoryValidators, async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash("categoryError", errors.array()[0].msg);
            return res.status(442).redirect("back");
        }
        const category = new Category({ title: req.body.title });
        await category.save();
        res.redirect("/admin/category");
    } catch (err) {
        logger(err);
    }
});

router.get("/:id/edit", async(req, res) => {
    try {
        const category = await Category.findById(req.params.id).lean();
        res.render("admin/category/edit", {
            title: "Редактировать категории",
            category,
        });
    } catch (err) {
        logger(err);
    }
});

router.put("/edit", (req, res) => {
    try {
        Category.findOneAndUpdate({
            _id: req.body.id,
        }, {
            title: req.body.title,
        }).exec((err, res) => {});
        res.redirect("/admin/category/");
    } catch (err) {
        logger(err);
    }
});

router.delete("/:id", (req, res) => {
    try {
        Category.deleteOne({ _id: req.params.id }).exec();
        res.status(200).json({ status: "ok" });
    } catch (err) {
        logger(err);
    }
});
module.exports = router;