const { Router } = require("express");
const User = require("../models/user");
const {
    registerValidators,
    loginValidators,
    resetPasswordValidators,
} = require("../validators/authValidators");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const logger = require("../helpers/logger");
const nodemailer = require("nodemailer");
const registrationEmail = require("../emails/registration");
const resetPasswordEmail = require("../emails/resetPassword");
const crypto = require("crypto");
const router = Router();

const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "6e9d36372cfa25",
        pass: "e6f22a218257e4",
    },
});

router.get("/login", (req, res) => {
    res.render("auth/login", {
        title: "Авторизация",
        isLogin: true,
        registerError: req.flash("registerError"),
        loginError: req.flash("loginError"),
        message: req.flash("message"),
    });
});

router.post("/login", loginValidators, async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash("loginError", errors.array()[0].msg);
            return res.status(442).redirect("/auth/login#login");
        }
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            const check = await bcrypt.compare(password, user.password);
            if (!check) {
                req.flash("loginError", "Неверный парол");
                return res.status(442).redirect("/auth/login#login");
            } else {
                req.session.user = user;
                req.session.isAuthenticated = true;
                req.session.save((err) => {
                    if (err) {
                        logger(err);
                    }
                    res.redirect("/");
                });
            }
        }
    } catch (err) {
        logger(err);
    }
});

router.post("/register", registerValidators, async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash("registerError", errors.array()[0].msg);
            return res.status(442).redirect("/auth/login#register");
        }
        const { email, password, name } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            name,
            password: hashPassword,
        });
        await user.save();
        req.session.user = user;
        req.session.isAuthenticated = true;
        req.session.save((err) => {
            if (err) {
                logger(err);
            }
            res.redirect("/");
        });
        await transporter.sendMail(registrationEmail(email));
    } catch (err) {
        logger(err);
    }
});

router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            logger(err);
        }
        res.redirect("/");
    });
});

router.get("/reset", (req, res) => {
    res.render("auth/reset", {
        title: "Ввостоновить парол",
        resetError: req.flash("resetError"),
    });
});

router.post("/reset", async(req, res) => {
    try {
        crypto.randomBytes(32, async(err, buffer) => {
            if (err) {
                logger(err);
                req.flash("resetError", "Что то пошло не так");
                res.redirect("/auth/reset");
            }
            const token = buffer.toString("hex");
            const user = await User.findOne({
                email: req.body.email,
            });
            if (user) {
                user.resetToken = token;
                user.resetTokenExp = Date.now() + 60 * 60 * 1000;
                await user.save();
                req.flash(
                    "message",
                    "На email отправлен ссылка для воссьоноление пароля"
                );
                res.redirect("/auth/login#login");
                await transporter.sendMail(resetPasswordEmail(user.email, token));
            } else {
                req.flash("resetError", "Email не найден");
                res.redirect("/auth/reset");
            }
        });
    } catch (err) {
        logger(err);
    }
});

router.get("/password/:email/:token", async(req, res) => {
    if (!req.params.token) {
        return res.redirect("/auth/login#login");
    }
    try {
        const user = await User.findOne({
            email: req.params.email,
            resetToken: req.params.token,
            resetTokenExp: {
                $gt: Date.now(),
            },
        });
        if (!user) {
            return res.redirect("/auth/login#login");
        } else {
            res.render("auth/password", {
                title: "Ввостоновить досдуп",
                error: req.flash("error"),
                userId: user._id.toString(),
                token: req.params.token,
            });
        }
    } catch (e) {
        logger(e);
    }
});

router.post("/password", resetPasswordValidators, async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash("error", errors.array()[0].msg);
            return res.status(442).redirect("back");
        }

        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: { $gt: Date.now() },
        });
        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            await user.save();
            req.flash("message", "Парол обновлен.Войдитн м новый парол");
            res.redirect("/auth/login#login");
        } else {
            req.flash("loginError", "Время токена истекло");
            res.redirect("/auth/login#login");
        }
    } catch (e) {
        logger(e);
    }
});

module.exports = router;