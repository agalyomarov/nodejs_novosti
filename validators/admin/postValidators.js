const { body, check } = require("express-validator");
const Post = require("../../models/post");
const logger = require("../../helpers/logger");
const { exists } = require("../../models/post");
exports.postValidators = [
    body("title")
    .notEmpty()
    .withMessage("Title не может быт пустым")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Минималный 3 мимвол"),
    body("text")
    .notEmpty()
    .withMessage("Text не может быт пустым")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Минималный 5 мимвол"),
    body("categoryId").notEmpty().withMessage("Выберите категории"),
    check("files").custom((value, { req }) => {
        if (!req.file && !req.body.preview) {
            throw new Error("Выберите изображение");
        } else {
            return true;
        }
    }),
];