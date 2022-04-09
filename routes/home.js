const { Router } = require("express");
const router = Router();
const Post = require("../models/post");
router.get("/", (req, res) => {
    res.render("home", {
        title: "Главная",
        isHome: true,
    });
});

module.exports = router;