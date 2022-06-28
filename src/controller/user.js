const { user }   = require("../../models");
const { badRequestCode, success, internalServerCode } = require("../statuscode");
const Joi       = require("joi");


let status;
let responseCode;
let message;
let data;

exports.userUpdate    = async (req, res) => {
    try {

        let reqBody         = req.body;
        const idUserParams  = req.params.id;

        const schema    = Joi.object({
            fullname    : Joi.string().required()
        });

        const validate  = schema.validate(reqBody);
        let { value }   = validate;
        
        if (validate.error) {
            responseCode    = badRequestCode.statusCode;
            status          = validate.error.name;
            data            = value;
            message         = validate.error.message;
        }else{
            const checkUser  = await user.findOne({
                where   : {
                    id  : idUserParams
                }
            });

            if (checkUser === null) {
                responseCode    = notFoundCode.statusCode;
                status          = notFoundCode.statusData;
                data            = checkProduct;
                message         = "Data not Found!";
            }else {
                const newUserUpdate  = await user.update(value, {
                    where   : {
                        id  : idUserParams
                    }
                });

                responseCode    = success.statusCode;
                status          = success.statusData;
                data            = newUserUpdate;
                message         = "Success update profile.";
            }
        }

        res.status(responseCode).send({
            status,
            data    : {
                user    : data
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


exports.getUser   = async (req, res) => {
    try {

        const { id }    = req.params;

        const response  = await user.findOne({
            where   : {
                id
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
                user : {
                    fullname    : data?.fullname,
                }
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