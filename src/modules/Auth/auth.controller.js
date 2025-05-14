import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'

import User from "../../../DB/Models/user.model.js"
import sendEmailService from "../../services/send-email.service.js"
import cloudinaryConnection from "../../utils/cloudinary.js"
import fs from 'fs'
import  generateUniqueString from '../../utils/generate-unique-string.js'

// ========================================= SignUp API ================================//

/**
 * destructuring the required data from the request body
 * check if the user already exists in the database using the email and isEmailVerified = false
 * if exists return error email is already exists
 * password hashing
 * create new document in the database
 * return the response
 */
export const signUp = async (req, res, next) => {
    try {
        // 1- destructure the required data from the request body 
        const {
            username,
            fullName,
            email,
            password,
            age,
            role,
        } = req.body


        // 2- check if the user already exists in the database using the email
        const isEmailDuplicated = await User.findOne({ email })
        if (isEmailDuplicated) {
            return next(new Error('Email already exists,Please try another email', { cause: 409 }))
        }
        // 3- send confirmation email to the user
        const usertoken = jwt.sign({ email }, process.env.JWT_SECRET_VERFICATION, { expiresIn: '2m' })
        const refreshToken = jwt.sign({ email }, process.env.JWT_SECRET_VERFICATION, { expiresIn: '1d' })

        const isEmailSent = await sendEmailService({
            to: email,
            subject: 'Email Verification',
            message: `
            <h2>please click on this link to verify your email</h2>
            <a href="http://localhost:3000/auth/verify-email?token=${usertoken}">Verify Email</a>
            <h2>please click on this link to refresh your token</h2>
            <a href="http://localhost:3000/auth/refresh-token?token=${refreshToken}">Refresh Token</a>
            `
        })
        // 4- check if email is sent successfully
        if (!isEmailSent) {
            return next(new Error('Email is not sent, please try again later', { cause: 500 }))
        }
        // 5- password hashing
        const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS)

        // 6- handle image upload if provided
        let imageData = {};
        if (req.file) {
            const cloudinary = cloudinaryConnection();
            const folderId = generateUniqueString(4)
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
                folder: `${process.env.MAIN_FOLDER}/Users/${folderId}`
            });
            
            // Delete file from server after upload
            fs.unlinkSync(req.file.path);
            
            // Set image data
            imageData = { secure_url, public_id };
        }

        // 7- create new document in the database
        const newUser = await User.create({
            username,
            fullName,
            email,
            password: hashedPassword,
            age,
            role: role || 'user',
            ...(Object.keys(imageData).length && { image: imageData })
        })

        // 8- return the response
        res.status(201).json({
            success: true,
            message: 'User created successfully, please check your email to verify your account',
            data: {
                name: newUser.username,
                fullName: newUser.fullName,
                email: newUser.email,
                age: newUser.age,
                role: newUser.role,
                ...(newUser.image && { image: newUser.image })
            }
        })
    } catch (error) {
        next(error);
    }
}


// ========================================= Verify Email API ================================//
/**
 * destructuring token from the request query
 * verify the token
 * get user by email , isEmailVerified = false
 * if not return error user not found
 * if found
 * update isEmailVerified = true
 * return the response
 */
export const verifyEmail = async (req, res, next) => {
    const { token } = req.query
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_VERFICATION)
    if (!decodedData) {
        return next(new Error('Invalid token', { cause: 400 }))
    }
    // get uset by email , isEmailVerified = false
    const user = await User.findOneAndUpdate({
        email: decodedData.email, isEmailVerified: false
    }, { isEmailVerified: true }, { new: true })
    if (!user) {
        return next(new Error('User not found', { cause: 404 }))
    }

    res.status(200).json({
        success: true,
        message: 'Email verified successfully, please try to login'
    })
}

// ========================================= Refresh Token API ================================//
/**
 * destructuring token from the request query
 * verify the token
 * get user by email
 * if not return error invalid token
 * if found
 * check if email is verified
 * if not return error email is verified
 * generate new token
 * send confirmation email to the user
 */
export const refreshToken = async (req, res, next) => {
    const { token } = req.query
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_VERFICATION)
    if (!decodedData?.email) {
        return next(new Error('Invalid token', { cause: 400 }))
    }
    // get user by email
    const user = await User.findOne({ email: decodedData.email })
    if (!user) {
        return next(new Error('User not found', { cause: 404 }))
    }
    if (user.isEmailVerified) {
        return next(new Error('Email is verified', { cause: 400 }))
    }
    // generate new token
    const newToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET_VERFICATION, { expiresIn: '4m' })

    const isEmailSent = await sendEmailService({
        to: user.email,
        subject: 'Email Verification',
        message: `
        <h2>please click on this link to verify your email</h2>
        <a href="http://localhost:3000/auth/verify-email?token=${newToken}">Verify Email</a>
        `
    })
    // check if email is sent successfully
    if (!isEmailSent) {
        return next(new Error('Email is not sent, please try again later', { cause: 500 }))
    }

    res.status(200).json({
        success: true,
        message: 'Token refreshed successfully, please check your email to verify your account',
        data: {
            token
        }
    })
}


// ========================================= SignIn API ================================//

/**
 * destructuring the required data from the request body 
 * get user by email and check if isEmailVerified = true
 * if not return error invalid login credentials
 * if found
 * check password
 * if not return error invalid login credentials
 * if found
 * generate login token
 * updated isLoggedIn = true  in database
 * return the response
 */
export const signIn = async (req, res, next) => {
    const { email, password } = req.body
    // get user by email
    const user = await User.findOne({ email, isEmailVerified: true })
    if (!user) {
        return next(new Error('Invalid login credentials', { cause: 404 }))
    }

    // Check if user is soft deleted
    if (user.isDeleted) {
        // Remove soft delete status
        user.isDeleted = false
        await user.save()
    }

    // check password
    const isPasswordValid = bcrypt.compareSync(password, user.password)
    if (!isPasswordValid) {
        return next(new Error('Invalid login credentials', { cause: 404 }))
    }

    // generate login token
    const token = jwt.sign({ email, id: user._id, loggedIn: true }, process.env.JWT_SECRET_LOGIN, { expiresIn: '1d' })

    // update isLoggedIn = true in database
    user.isLoggedIn = true
    await user.save()

    res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        data: {
            token
        }
    })
}

// ========================================= Logout API ================================//
/**
 * destructuring token from the request query
 * verify the token
 * get user by email
 * if not return error invalid token
 * if found
 * update isLoggedIn = false in database
 * return the response
 */
export const logout = async (req, res, next) => {
    const { token } = req.headers
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_LOGIN)
    if (!decodedData?.email) {
        return next(new Error('Invalid token', { cause: 400 }))
    }
    // get user by email
    const user = await User.findOne({ email: decodedData.email })
    if (!user) {
        return next(new Error('User not found', { cause: 404 }))
    }
    // update isLoggedIn = false in database
    user.isLoggedIn = false
    await user.save()

    res.status(200).json({
        success: true,
        message: 'User logged out successfully'
    })
}
    

// ========================================= Forgot Password API ======================//
/**
 * destructuring email from the request body 
 * get user by email
 * if not return error user not found
 * if found
 * generate forget code
 * send confirmation email to the user
 */
export const forgotPassword = async (req, res, next) => {
    const { email } = req.body
    // get user by email
    const user = await User.findOne({ email })
    if (!user) {
        return next(new Error('User not found', { cause: 404 }))
    }
    // generate forget code
    const forgetCode = nanoid(6) 
    const isEmailSent = await sendEmailService({
        to: user.email,
        subject: 'Forget Password',
        message: `
        <h2>please use this code to reset your password</h2>
        <h2>CODE : ${forgetCode}</h2>
        `
    })
    // check if email is sent successfully
    if (!isEmailSent) {
        return next(new Error('Email is not sent, please try again later', { cause: 500 }))
    }
    user.forgetCode = forgetCode
    await user.save()
    res.status(200).json({
        success: true,
        message: 'Forget code sent successfully, please check your email'
    })
}

// ========================================= Reset Password API ===============================//
/**
 * destructuring email and forgetCode from the request body 
 * get user by email and forgetCode
 * if not return error invalid forget code
 * if found
 * update password
 * return the response
 */
export const resetPassword = async (req, res, next) => {
    const { email, forgetCode, password } = req.body
    // get user by email and forgetCode
    const user = await User.findOne({ email})
    if (!user) {
        return next(new Error('Email not found', { cause: 400 }))
    }
    if (user.forgetCode !== forgetCode) {
        return next(new Error('Invalid forget code', { cause: 400 }))
    }
    // update password
    user.password = bcrypt.hashSync(password, +process.env.SALT_ROUNDS)
    user.forgetCode = ""
    await user.save()
    res.status(200).json({
        success: true,
        message: 'Password reset successfully'
    })
}