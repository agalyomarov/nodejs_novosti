const bcrypt = require("bcryptjs");
require("dotenv").config();
module.exports = async function(req, res, next) {
    const check = await bcrypt.compare(
        process.env.ADMIN_PASSWORD,
        req.user.password
    );
    if (req.user.email != process.env.ADMIN_EMAIL || !check) {
        return res.redirect("/");
    }
    next();
};