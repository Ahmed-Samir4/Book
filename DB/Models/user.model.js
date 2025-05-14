
import mongoose, { Schema, model } from "mongoose";
import { systemRoles } from "../../src/utils/system-roles.js";


const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20,
        tirm: true,
        lowercase: true
    },
    fullName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20,
        tirm: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        tirm: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    age: {
        type: Number,
        min: 12,
        max: 100
    },
    role: {
        type: String,
        enum: Object.values(systemRoles),
        default: systemRoles.USER
    },
    description: {
        type: String,
        default: 'No description'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    forgetCode: {
        type: String
    },
    image: {
        secure_url: {
            type: String,
        },
        public_id: {
            type: String,
        }
    },
    folderId: {
        type: String,
    },
    booksRead: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Book'
        }
    ],
    booksFavorites: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Book'
        }
    ]
}, { timestamps: true })

export default mongoose.models.User || model('User', userSchema)