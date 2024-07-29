const mongoose = require('mongoose');
const { Schema } = mongoose;

const roomSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        immutable: true,
    },
    roomid: {
        type: String,
        required: true,
        trim: true,
        immutable: true
    },
    code: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        require: true,
        default: 'javascript'
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'user',
        immutable: true
    }
}, {
    timestamps: true
});

/*
    In MongoDB and Mongoose, the timestamps option is used to automatically add createdAt and updatedAt fields to your schema. These fields will record the date and time when a document is created and last updated, respectively.

    When a Document is Created:

    The createdAt field is set to the current date and time.
    The updatedAt field is also set to the current date and time.

    When a Document is Updated:

    The updatedAt field is updated to the current date and time.
    The createdAt field remains unchanged.
*/
// roomSchema.methods.toJSON = function () {
//     let obj = this.toObject();
//     delete obj.owner;
//     delete obj.updatedAt;
//     delete obj.__v;
//     return obj;
// }

const room = mongoose.model('room', roomSchema);

module.exports = room;