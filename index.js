const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const exphbs = require("express-handlebars");
const csrf = require("csurf");
const flash = require("connect-flash");
const path = require("path");
const homeRoutes = require("./routes/home");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const adminPostRoutes = require("./routes/admin/post");
const adminCategoryRoutes = require("./routes/admin/category");
const csrfMiddleware = require("./middleware/csrf");
const userMiddleware = require("./middleware/user");
const authMiddleware = require("./middleware/auth");
const adminMiddleware = require("./middleware/admin");
const previewImageMiddleware = require("./middleware/previewImage");
const methodOverride = require("method-override");
const logger = require("./helpers/logger");
require("dotenv").config();

const app = express();
const hbs = exphbs.create({
    defaultLayout: "main",
    extname: "hbs",
    helpers: require("./helpers/hbs-helpers"),
    registerPartials: __dirname + "/views/partials",
});

const store = new MongoStore({
    collection: "sessions",
    uri: process.env.MONGODB_URL,
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");

app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.urlencoded({ extended: false }));
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store,
    })
);
app.use(previewImageMiddleware.single("preview"));
app.use(csrf());
app.use(flash());
app.use(csrfMiddleware);
app.use(userMiddleware);
app.use(
    methodOverride(function(req, res) {
        if (req.body && typeof req.body === "object" && "_method" in req.body) {
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    })
);

app.use("/", homeRoutes);
app.use("/auth", authRoutes);
app.use("/admin", authMiddleware, adminMiddleware, adminRoutes);
app.use("/admin/post", authMiddleware, adminMiddleware, adminPostRoutes);
app.use(
    "/admin/category",
    authMiddleware,
    adminMiddleware,
    adminCategoryRoutes
);

async function start() {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
        });
        app.listen(process.env.PORT, () => {
            console.log(`Server starting on port ${process.env.PORT}`);
        });
    } catch (e) {
        logger(e);
    }
}

start();