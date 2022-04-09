const path = require("path");
const winston = require("winston");
const dt = new Date();
const date = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
const logger = winston.createLogger({
    level: "error",
    format: winston.format.json(),
    defaultMeta: { service: "user-service" },
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, "log", date + ".txt"),
            level: "error",
        }),
    ],
    format: winston.format.combine(
        winston.format.timestamp({
            format: "MMM-DD-YYYY HH:mm:ss",
        }),
        winston.format.printf(
            (error) => `${[error.timestamp]} : ${error.level} : ${error.message} !!!`
        )
    ),
});

module.exports = function(err) {
    logger.error(err.message);
    console.log(err.message);
};