const { profile, user }   = require("../../models");
const { badRequestCode, success, internalServerCode, notFoundCode } = require("../statuscode");
const Joi           = require("joi");
const fs            = require("fs");
const fsPromise     = require("fs/promises");
const cloudinary    = require("../utils/cloudinary");


let status;
let responseCode;
let message;
let data;

exports.profileUpdate    = async (req, res) => {
    try {

        let reqBody         = req.body;
        const idUserParams  = req.params.id;
        const image         = req.file?.filename;
        const IdUser        = req.user.id;

        reqBody = {
            ...reqBody,
            image
        }

        const schema    = Joi.object({
            fullname    : Joi.string(),
            phone       : Joi.number().required(),
            gender      : Joi.string().required(),
            address     : Joi.string().min(8).required(),
            postcode    : Joi.number().required(),
            image       : Joi.string()
        });

        const validate  = schema.validate(reqBody);
        let { value }   = validate;
        
        if (validate.error) {
            responseCode    = badRequestCode.statusCode;
            status          = validate.error.name;
            data            = value;
            message         = validate.error.message;
            const oldImage  = fs.existsSync("uploads/" + value?.image);
            if (oldImage && image !== undefined){
                const hapus = await fsPromise.unlink("uploads/" + value?.image);
            }
        }else{
            const checkProfile  = await profile.findOne({
                where   : {
                    idUser  : idUserParams
                }
            });

            if (checkProfile === null) {
                responseCode    = notFoundCode.statusCode;
                status          = notFoundCode.statusData;
                data            = {};
                message         = "Data not Found!";
            }else {
                reqBody?.fullname && await user.update({fullname : value?.fullname}, {where  : {id : IdUser}});
                delete value?.fullname;
                if(value?.image !== undefined){
                    const cloudImage = await cloudinary.uploader.upload(req.file.path, {
                        folder: "waysbeans/profile-photos",
                        use_filename: true,
                        unique_filename: false
                    });
                    value = {
                        ...value,
                        image: cloudImage.public_id
                    }
                    await fsPromise.unlink("uploads/" + image);
                }else if(value?.image === undefined){
                    delete value?.image;
                }

                // const existImage    = fs.existsSync("uploads/" + checkProfile?.image);
                // existImage && image await fsPromise.unlink("uploads/" + checkProfile?.image);

                // if (existImage && image !== undefined && checkProfile?.image !== "MASTAMPAN.png") {
                    // await fsPromise.unlink("uploads/" + checkProfile?.image);
                // }
                const newProfileUpdate  = await profile.update(value, {
                    where   : {
                        idUser  : idUserParams
                    }
                });

                responseCode    = success.statusCode;
                status          = success.statusData;
                data            = newProfileUpdate;
                message         = "Success update profile.";
            }
        }

        res.status(responseCode).send({
            status,
            data    : {
                profile : data
            },
            message
        });

    } catch (error) {
        console.log(error);
        res.status(internalServerCode.statusCode).send({
            status  : error.name,
            data    : {},
            message : error.message
        });

    }

}


exports.getProfile   = async (req, res) => {
    try {

        const { id }    = req.params;

        const response  = await profile.findOne({
            where   : {
                idUser  : id
            }
        });

        if (response === null) {
            responseCode    = notFoundCode.statusCode;
            status          = notFoundCode.statusData;
            data            = {};
            message         = "Data not Found!";
        }else {
            responseCode    = success.statusCode;
            status          = success.statusData;
            data            = response;
            message         = success.message;
        }

        res.status(responseCode).send({
            status,
            data    : {
                profile : data
            },
            message
        });

    } catch (error) {

        res.status(internalServerCode.statusCode).send({
            status  : error.name,
            data    : {},
            message : error.message
        });


    }
}