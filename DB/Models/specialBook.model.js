import mongoose, { Schema, model } from "mongoose";

const specialBookSchema = new Schema({
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },
    pages: [{
        page: { 
            type: Number, 
            required: true 
        },
        text: { 
            type: String, 
            required: true 
        }
    }],
    addedBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    updatedBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    },
    authorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { 
    timestamps: true 
});

export default mongoose.models.SpecialBook || model('SpecialBook', specialBookSchema); 