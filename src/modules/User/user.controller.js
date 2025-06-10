import User from "../../../DB/Models/user.model.js";
import bcrypt from "bcrypt";
import { systemRoles } from "../../utils/system-roles.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import fs from 'fs';
import path from 'path';
/**
 * @name updateUser
 * @param userId 
 * @description get user by id and update it after checking if the user is the same as the logged in user
 */
export const updateUser = async (req, res, next) => {
    // 1- destruct _id from the request authUser
    const { _id } = req.authUser
    // 2- destruct userId from the request params
    const { userId } = req.params
    // 3- destructuring the request body
    const {
        username,
        fullName,
        email,
        age,
        role,
        description
    } = req.body
    // 4- check if user exists and same as the logged in user
    const user = await User.findById(userId)
    if (!user || user.isDeleted) {
        return next({ cause: 404, message: 'User not found' })
    }
    if (user._id.toString() != _id.toString()) {
        return next({ cause: 403, message: 'You are not authorized to update this user' })
    }
    // 5- update name if exists
    if (username) {
        user.username = username
    }
    // 5.1- update fullName if exists
    if (fullName) {
        user.fullName = fullName
    }
    // 5.2- update description if exists
    if (description) {
        user.description = description
    }
    // 6- update email if exists
    if (email) {
        // 6.1- check if email already exists
        const isEmailDuplicated = await User.findOne({ email })
        if (isEmailDuplicated) {
            return next(new Error('Email already exists,Please try another email', { cause: 409 }))
        }
        // 6.2- check if if the new email is different from the old email
        if (email == user.email) {
            return next(new Error('New email is the same as the old email', { cause: 409 }))
        }
        // 6.3- update email
        user.email = email;
    }
    // 7- update age if exists
    if (age) {
        user.age = age
    }
    // 8- update role if exists
    if (role) {
        user.role = role
    }

    // 9- update user
    await user.save()
    // 10- return response
    res.status(200).json({
        success: true,
        message: 'User updated successfully',
        user
    })
}

/**
 * 
 * @name deleteUser
 * @param userId
 * @description get user by id and delete it but we must handle the case if we delete it the related data will be deleted too (like who created category and ...) or handle it in the frontend
 */
export const deleteUser = async (req, res, next) => {
    // 1- destruct _id from the request authUser
    const { _id } = req.authUser
    // 2- destruct userId from the request params
    const { userId } = req.params
    // 3- check if user exists 
    const user = await User.findById(userId)
    if (!user) {
        return next({ cause: 404, message: 'User not found' })
    }

    // super admin and admin can delete any user if needed so can't use this code
    // if (user._id != _id) {
    //     return next({ cause: 403, message: 'You are not authorized to delete this user' })
    // }

    // 4- delete user
    await user.delete()

    res.status(200).json({
        success: true,
        message: 'User deleted successfully',
    })
}

/**
 * @name softDeleteUser
 * @param userId
 * @description get user by id and soft delete it after checking if the user is the same as the logged in user
 */
export const softDeleteUser = async (req, res, next) => {
    const { _id } = req.authUser
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) {
        return next({ cause: 404, message: 'User not found' })
    }

    // Check authorization
    if (
        req.authUser.role !== systemRoles.SUPER_ADMIN &&
        user._id.toString() !== _id.toString()
    ) return next({ cause: 403, message: 'You are not authorized to soft delete this user' })

    // Soft delete user and log them out
    user.isDeleted = true
    user.isLoggedIn = false
    await user.save()

    res.status(200).json({
        success: true,
        message: 'User soft deleted and logged out successfully'
    })
}

/**
 * @name getUserData
 * @param userId
 * @description get user by id and return it after checking if the user exists without the password and the __v field
 */
export const getUserData = async (req, res, next) => {
    console.log(req.params)
    // 1- destruct userId from the request params
    const { userId } = req.params
    // 2- check if user exists
    const user = await User.findById(userId).select('-password -__v -createdAt -updatedAt -forgetCode')
    if (!user || user.isDeleted) {
        return next({ cause: 404, message: 'User not found' })
    }
    // 3- return user
    res.status(200).json({
        success: true,
        message: 'User fetched successfully',
        data: user
    })
}

/**
 * @name updatePassword
 * @param userId
 * @body oldPassword, newPassword
 * @description get user by id and update the password after checking if the user is the same as the logged in user
 */
export const updatePassword = async (req, res, next) => {
    // 1- destruct _id from the request authUser
    const { _id } = req.authUser
    // 2- destruct userId from the request params
    const { userId } = req.params
    // 3- destructuring the request body
    const { oldPassword, newPassword } = req.body
    // 4- check if user exists and same as the logged in user
    const user = await User.findById(userId)
    if (!user || user.isDeleted) {
        return next({ cause: 404, message: 'User not found' })
    }
    if (user._id.toString() != _id.toString()) {
        return next({ cause: 403, message: 'You are not authorized to update this user' })
    }
    // 5- check if the old password is correct
    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) {
        return next({ cause: 400, message: 'Old password is incorrect' })
    }
    // 6- update password
    const newHashedPassword = await bcrypt.hash(newPassword, +process.env.SALT_ROUNDS)
    user.password = newHashedPassword
    await user.save()
    // 7- return response
    res.status(200).json({
        success: true,
        message: 'Password updated successfully',
    })
}


/**
 * @name getAllAuthors
 * @description get all authors from the database
 */
export const getAllAuthors = async (req, res, next) => {
    // 1- get all authors from the database
    const authors = await User.find({ role: 'author' })
        .select('username fullName email age role description image isEmailVerified') 
    // 2- check if authors exist
    if (!authors || authors.length === 0) {
        return next({ cause: 404, message: 'No authors found' })
    }
    // 3- return authors
    res.status(200).json({
        success: true,
        message: 'Authors fetched successfully',
        data: authors
    })
}

/**
 * @name updateProfileImage
 * @param userId
 * @description Update user profile image using Cloudinary
 */
export const updateProfileImage = async (req, res, next) => {
    try {
        // Get userId from params and check authorization
        const { userId } = req.params;
        const { _id } = req.authUser;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user || user.isDeleted) {
            return next({ cause: 404, message: 'User not found' });
        }

        // Check if user is authorized to update this profile
        // if (user._id.toString() !== _id.toString()) {
        //     return next({ cause: 403, message: 'You are not authorized to update this user' });
        // }
        // Check if a file was uploaded
        if (!req.file) {
            return next({ cause: 400, message: 'No image file provided' });
        }
        
        // Upload to cloudinary
        const cloudinary = cloudinaryConnection();
        const filePath = req.file.path;
        console.log(filePath)
        // If user already has an image, delete the old one from cloudinary
        // await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Users/${user.folderId}`)
        // await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FOLDER}/Users/${user.folderId}`)
        
        console.log('test')

        // Upload new image
        const { secure_url, public_id } = await cloudinary.uploader.upload(filePath, {
            folder: `${process.env.MAIN_FOLDER}/Users/${user.folderId}`
        });

        // Delete file from server after upload
        fs.unlinkSync(filePath);

        // Update user image in database
        user.image = { secure_url, public_id };
        await user.save();

        // Return response
        res.status(200).json({
            success: true,
            message: 'Profile image updated successfully',
            data: { image: user.image }
        });
    } catch (error) {
        next(error);
    }
}