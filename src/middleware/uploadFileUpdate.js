const { badRequestCode, notFoundCode } = require("../statuscode");
const { product, profile }    = require("../../models");
const multer = require("multer");


exports.uploadFileUpdate = (imageFile) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {

            cb(null, "uploads");
        },
        filename: function (req, file, cb) {


            cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, ""));
        }
    });

//File extension
    const fileFilter = function (req, file, cb) {

        if (file.fieldname === imageFile) {
            if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
                req.fileValidationError = {
                message: "Only image files are allowed"
                }
                return cb(new Error("Only image file are allowed"), false);
            }
        }
        cb(null, true);
    }

    //size file
    const sizeInMB = 2
    const maxSize = sizeInMB * 1000 * 1000

    // generate configuration multer
    const upload = multer({
        storage,
        fileFilter,
        limits: {
        fileSize: maxSize
        }
    }).single(imageFile);


    // middleware handler
    return async (req, res, next) => {

        // const idParams      = req.params?.id;
        // const checkProduct  = await product.findOne({
        //     where   : {
        //         id  : idParams
        //     }
        // });
        
        // const checkProfile  = await profile.findOne({
        //     where   : {
        //         id  : idParams
        //     }
        // });
        // if (idParams && checkProfile === null) {
        //     return res.status(notFoundCode.statusCode).send({
        //         status          : notFoundCode.statusData,
        //         data            : {},
        //         message         : "Data not found!"
        //     });
        // }
        upload(req, res, function (err) {
        // check jika validation gagal
        if (req.fileValidationError) {
            return res.status(badRequestCode.statusCode).send({
                message : req.fileValidationError.message
            });
        }
        if(req.file){

            // check jika ukurannya melebihi limit
            if (err) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(badRequestCode.statusCode).send({
                        message: "Max size file 10MB"
                    });
                }

                return res.status(badRequestCode.statusCode).send(err);
            }

            return next();
        }
        else{
            return next();
        }
        
    });
    }
};