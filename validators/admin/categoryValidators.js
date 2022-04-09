const { body } = require("express-validator");
const Category = require("../../models/category");
const logger = require("../../helpers/logger");
exports.categoryValidators = [
    body("title")
    .notEmpty()
    .withMessage("Поля не может быт пустым")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Минималный 3 мимвол")
    .custom(async(value, { req }) => {
        try {
            const category = await Category.findOne({ title: value });
            if (category) {
                return Promise.reject("Категории уже есть");
            }
        } catch (err) {
            logger(err);
        }
    }),
];