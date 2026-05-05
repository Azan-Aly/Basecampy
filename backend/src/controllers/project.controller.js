import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { UserRoleEnum } from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {
    const project = await ProjectMember.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $lookup: {
                from: "projects",
                localField: "projects",
                foreignField: "_id",
                as: "projects",
                pipeline: [
                    {
                        $lookup: {
                            from: "projectmembers",
                            localField: "_id",
                            foreignField: "projects",
                            as: "projectmembers",
                        },
                    },
                    {
                        $addFields: {
                            members: {
                                $size: "$projectmembers",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$projects",
        },
        {
            $project: {
                project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    members: 1,
                    createdAt: 1,
                    createdBy: 1,
                },
                role: 1,
                _id: 0,
            },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, project, "Projects fetched successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {});

const createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const project = await Project.create({
        name,
        description,
        createdBy: new mongoose.Types.ObjectId(req.user._id),
    });

    if (!project) {
        throw new ApiError(500, "Something went wrong while creating project");
    }

    const projectMember = await ProjectMember.create({
        user: new mongoose.Types.ObjectId(req.user._id),
        project: new mongoose.Types.ObjectId(project._id),
        role: UserRoleEnum.ADMIN,
    });

    if (!projectMember) {
        throw new ApiError(
            500,
            "Something went wrong while creating project member",
        );
    }

    return res
        .status(201)
        .json(new ApiResponse(201, project, "Project created successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const { projectId } = req.params;

    const project = await Project.findByIdAndUpdate(
        projectId,
        {
            name,
            description,
        },
        { new: true },
    );

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, project, "Project updated successfully"));
});

const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await findByIdAndDelete(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Project deleted successfully"));
});

const addMemberToProject = asyncHandler(async (req, res) => {});

const getProjectMember = asyncHandler(async (req, res) => {});

const updateMemberRole = asyncHandler(async (req, res) => {});

const deleteMemberRole = asyncHandler(async (req, res) => {});

// const getProjectMember = asyncHandler(async (req, res) => {

// })

export {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addMemberToProject,
    getProjectMember,
    updateMemberRole,
    deleteMemberRole,
};
