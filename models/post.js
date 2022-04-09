const { Schema, model } = require("mongoose");
const postSchema = new Schema({
    title: {
        type: String,
        require: true,
        trim: true,
    },
    text: {
        type: String,
        require: true,
    },
    preview: {
        type: String,
        require: true,
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        require: true,
    },
});

// courseSchema.method('toClient', function() {
//     const course = this.toObject();
//     course.id = course._id;
//     return course;
// })
module.exports = model("Post", postSchema);