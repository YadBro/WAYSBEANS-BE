const multer    = require("multer");

exports.uploadFile = (imageFile)  => {
    const storage = multer.diskStorage({
        destination : function (req, file, cb) {
            cb(null, "uploads");
        },
        filename    : function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, ''));
        }
    });

    const fileFilter    = function (req, file, cb) {
        if (file.fieldname === imageFile) {
            if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
                req.fileValidationError = {
                    message     : 'Only image files are allowed!'
                }
                return cb(new Error("Only image files are allowed!"), false);
            }
        }
        cb(null, true);
    }


    const sizeInMb  = 1;
    const maxSize   = sizeInMb * 1000 * 1000;


    const upload    = multer({
        storage,
        fileFilter,
        limits  : {
            fileSize    : maxSize
        }
    }).single(imageFile);

    return (req, res, next) => {
        upload(req, res, function(err) {
            if (req.fileValidationError){
                return res.status(400).send(req.fileValidationError);
            }

            if (err) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).send({
                        message : `Max file sized ${sizeInMb}MB`
                    });
                }else{
                    return res.status(400).send(err);
                }
            }

            next();
        });
    }

}
