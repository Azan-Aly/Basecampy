import mongoose, { Schema } from "mongoose";
import { AvailableTaskStatues, TaskStatusEnum } from "../utils/constants.js";
import { Project } from "./project.models.js";
import { User } from "./user.models.js";

const taskSchema = new Schema(
    {
        title: {
            type: String,
            trim: true,
            required: true,
        },
        description: {
            type: String,
            trim: true,
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        assignedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: AvailableTaskStatues,
            default: TaskStatusEnum.TODO,
        },
        attachment: {
            type: [
                {
                    url: String,
                    mimetype: String,
                    size: Number,
                },
            ],
            default: [],
        },
    },
    { timestamps: true },
);

export const Task = mongoose.model("Task", taskSchema);
