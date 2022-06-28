const { user, profile }  = require("../../models");
const { success, badRequestCode, conflictCode, internalServerCode, notFoundCode, unAuthorizeCode }   = require("../statuscode/index");
const Joi       = require("joi");
const bcrypt    = require("bcrypt");
const jwt       = require("jsonwebtoken");


let status;
let data;
let message;
let responseCode;
let token;

exports.register    = async (req, res) => {
    try {

        let bodyReq   = req.body;
        bodyReq = {
            ...bodyReq,
            status : "buyer"
        }
        // VALIDATION
        const schema    = Joi.object({
            fullname    : Joi.string().required(),
            email       : Joi.string().email().required(),
            password    : Joi.string().min(6).required(),
            status      : Joi.string().required()
        });

        const validate  = schema.validate(bodyReq);
        let { value } = validate;


        // CHECK VALIDATION
        if (validate.error) {
            status          = validate.error.name;
            data            = value;
            message         = validate.error.message;
            responseCode    = badRequestCode.statusCode;
        }else {

            const isRegistered  = await user.findOne({
                where   : {
                    email   : value?.email
                }
            });
            
            // CHECK AN EMAIL, if found the email response is registered
            if (isRegistered) {
                status          = conflictCode.statusData;
                data            = value;
                message         = "The email has been registered!";
                responseCode    = conflictCode.statusCode;
            }else{

                // CREATE USER AND REGISTER IS SUCCESS
                const saltRound = 10;
                const hashingPassword   = bcrypt.hashSync(value?.password, saltRound);
                value   = {
                    ...value,
                    password    : hashingPassword
                }
                const newUser           = await user.create(value);
                const newProfileUser    = await profile.create({
                    idUser  : newUser?.id,
                    image   : 'MASTAMPAN.png'
                });
                status          = success.statusData;
                data            = value;
                message         = "Success to register, Please Login!";
                responseCode    = success.statusCode;
            }
        }
        
        res.status(responseCode).send({
            status,
            data : {
                user : {
                    fullname    : data?.fullname,
                    email       : data?.email
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


exports.login   = async (req, res) => {
    try {
        const bodyReq   = req.body;
        const schema    = Joi.object({
            email       : Joi.string().email().required(),
            password    : Joi.string().min(6).required()
        });

        const validate  = schema.validate(bodyReq);
        let { value }   = validate;

        if (validate.error) {
            responseCode    = badRequestCode.statusCode;
            status          = validate.error.name;
            data            = value;
            message         = validate.error.message;
            token           = "";
        }else {
            const checkEmail  = await user.findOne({
                where   : {
                    email    : value?.email
                }
            });

            if (checkEmail === null) {
                responseCode    = notFoundCode.statusCode;
                status          = notFoundCode.statusData;
                data            = value;
                message         = "The email is not registered!";
                token           = "";
            }else {
                const passwordMatched   = bcrypt.compareSync(value?.password, checkEmail?.password);
                const {password, id}    = checkEmail;
                if (passwordMatched) {
                    responseCode    = success.statusCode;
                    status          = success.statusData;
                    data            = value;
                    message         = success.message;
                    token           = jwt.sign({password, id}, process.env.SECRET_KEY);
                }else {
                    responseCode    = badRequestCode.statusCode;
                    status          = badRequestCode.statusData;
                    data            = value;
                    message         = "There was problem with your login";
                    token           = "";
                }
            }
        }

        res.status(responseCode).send({
            status,
            data    : {
                user    : {
                    email       : data?.email,
                    token
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



exports.checkAuth   = async (req, res) => {
    try {
        const userId    = req.user.id;
        const response  = await user.findOne({
            where   : {
                id  : userId
            }
        });
        const profileData   = await profile.findOne({
            where   : {
                idUser  : userId
            }
        });

        if (response) {
            responseCode    = success.statusCode;
            status          = success.statusData;
            data            = response;
            message         = success.message;
        }else {
            responseCode    = unAuthorizeCode.statusCode;
            status          = "Failed";
            data            = {};
            message         = unAuthorizeCode.message;
        }
        res.status(responseCode).send({
            status,
            data    : {
                user    : {
                    id      : response?.id,
                    name    : response?.fullname,
                    email   : response?.email,
                    image   : profileData?.image,
                    status  : response?.status
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