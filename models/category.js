const { Schema, model } = require("mongoose");
const logger = require("../helpers/logger");
const Post = require("./post");
const fs = require("fs");
const categorySchema = new Schema({
    title: {
        type: String,
        require: true,
        trim: true,
        unique: true,
    },
});
categorySchema.pre("deleteOne", function(next) {
    try {
        Post.find({ categoryId: this._conditions._id })
            .select("preview")
            .exec((err, result) => {
                if (err) {
                    logger(err);
                }
                result.forEach((post) => {
                    fs.access(post.preview, fs.constants.F_OK, (err) => {
                        if (err) {
                            logger(err);
                        } else {
                            fs.unlink(post.preview, (err) => {
                                if (err) {
                                    logger(err);
                                }
                            });
                        }
                    });
                });
            });
        Post.deleteMany({ categoryId: this._conditions._id }).exec();
        next();
    } catch (err) {
        logger(err);
    }
});
module.exports = model("Category", categorySchema);