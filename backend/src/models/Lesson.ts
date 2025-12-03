import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILesson extends Document {
    teacherId: Types.ObjectId;
    class: string;
    topic: string;
    description: string;
    materials?: string[]; // Array of URLs
    createdAt: Date;
}

const lessonSchema = new Schema<ILesson>({
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    class: {
        type: String,
        required: true,
        index: true
    },
    topic: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    materials: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Lesson = mongoose.model<ILesson>('Lesson', lessonSchema);
