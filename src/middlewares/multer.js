import multer from "multer"
import generateUniqueString from "../utils/generate-Unique-String.js";
import { allowedExtensions } from "../utils/allowed-extensions.js";
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs' // built in module for handling file system

// Create uploads directory if it doesn't exist
const uploadsPath = path.resolve('uploads')
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true })
}

/**
 * 
 * check the path if not exist create it
 * store in diskStorage
 * filter the file
 * create multer instance
 * return multer instance
 */
export const multerMiddleLocal = ({
    extensions = allowedExtensions.image,
    filePath = 'general'
}) => {
    const destinationPath = path.resolve(`src/uploads/${filePath}`) // return the full path till the src/uploads/${filePath}

    // path check
    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true })
    }
    // diskStorage
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, destinationPath)
        },
        filename: (req, file, cb) => {
            const uniqueFileName = generateUniqueString(6) + '_' + file.originalname
            cb(null, uniqueFileName)
        }
    })

    // file Filter
    const fileFilter = (req, file, cb) => {
        if (extensions.includes(file.mimetype.split('/')[1])) {
            return cb(null, true)
        }
        cb(new Error('Format is not allowed!'), false)
    }

    const file = multer({ fileFilter, storage })
    return file
}

export const multerMiddleHost = (config) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            // Create subdirectories based on file type
            let subDir = 'general'
            if (Array.isArray(config)) {
                const field = config.find(f => f.name === file.fieldname)
                if (field) {
                    subDir = field.name
                }
            } else {
                subDir = config.fieldName
            }
            
            const dirPath = path.join(uploadsPath, subDir)
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true })
            }
            cb(null, dirPath)
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = uuidv4()
            cb(null, uniqueSuffix + path.extname(file.originalname))
        }
    })

    const fileFilter = (req, file, cb) => {
        if (Array.isArray(config)) {
            // Handle multiple fields
            const field = config.find(f => f.name === file.fieldname)
            if (!field) {
                return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname))
            }

            if (!field.extensions.includes(path.extname(file.originalname).toLowerCase())) {
                return cb(new Error('Invalid file type'), false)
            }
        } else {
            // Handle single field
            if (!config.extensions.includes(path.extname(file.originalname).toLowerCase())) {
                return cb(new Error('Invalid file type'), false)
            }
        }

        cb(null, true)
    }

    const upload = multer({
        storage,
        fileFilter,
        limits: {
            fileSize: 10 * 1024 * 1024 // 10MB
        }
    })

    if (Array.isArray(config)) {
        // Handle multiple fields
        return (req, res, next) => {
            const uploadMiddleware = upload.fields(config)
            uploadMiddleware(req, res, (err) => {
                if (err) {
                    if (err instanceof multer.MulterError) {
                        if (err.code === 'LIMIT_FILE_SIZE') {
                            return next({ cause: 400, message: 'File size is too large' })
                        }
                        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                            return next({ cause: 400, message: `Unexpected field: ${err.field}` })
                        }
                    }
                    return next({ cause: 400, message: err.message })
                }
                next()
            })
        }
    } else {
        // Handle single field
        return upload.single(config.fieldName)
    }
}
