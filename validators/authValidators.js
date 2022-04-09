const { body } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const logger = require("../helpers/logger");
exports.registerValidators = [
    body("email")
    .isEmail()
    .withMessage("Введите корректны email")
    .custom(async(value, req) => {
        try {
            const user = await User.findOne({ email: value });
            if (user) {
                return Promise.reject("Email занить");
            }
        } catch (err) {
            logger(err);
        }
    })
    .normalizeEmail(),
    body("name")
    .isLength({ min: 3 })
    .withMessage("Имя должен быт минимум 3 символд")
    .trim(),
    body("password", "Парол долшен быт минимум 4 сим")
    .isLength({ min: 4 })
    .trim(),
    body("confirm")
    .custom(async(value, { req }) => {
        if (value !== req.body.password) {
            return Promise.reject();
        }
    })
    .trim()
    .withMessage("Паролы должен совподат"),
];

exports.loginValidators = [
    body("email")
    .isEmail()
    .withMessage("Введите корректны email")
    .normalizeEmail()
    .trim()
    .custom(async(value, { req }) => {
        try {
            const user = await User.findOne({ email: value });
            if (!user) {
                return Promise.reject("Ползовател не найден");
            }
        } catch (err) {
            logger(err);
        }
    }),
    body("password", "Парол долшен быт минимум 4 сим")
    .isLength({ min: 4 })
    .trim(),
];

exports.resetPasswordValidators = [
    body("password").isLength({ min: 4 }).trim().withMessage("Минимуи 4 символ"),
    body("confirm")
    .trim()
    .custom(async(value, { req }) => {
        if (value !== req.body.password) {
            return Promise.reject();
        }
    })
    .withMessage("Паролы не совпадает"),
];