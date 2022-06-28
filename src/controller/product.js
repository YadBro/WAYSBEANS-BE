const { product, user }    = require("../../models");
const { badRequestCode, success, internalServerCode, notFoundCode }    = require("../statuscode/index");
const Joi   = require("joi");
const fs    = require("fs");
const fsPromise = require("fs/promises");


let status;
let responseCode;
let message;
let data;



exports.getProducts = async (req, res) => {
    try {

        const data  = await product.findAll({
            include     : {
                model   : user,
                as      : "user",
                attributes  : {
                    exclude : ['id', 'password', 'createdAt', 'updatedAt']
                }
            },
            attributes  : {
                exclude : ['createdAt', 'updatedAt']
            }
        });

        responseCode    = 200;
        status          = success.statusData;
        message         = success.message;

        res.status(responseCode).send({
            status,
            data    : {
                product : data
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


exports.getProductDetail    = async (req, res) => {
    try {

        const { id }    = req.params;

        const response  = await product.findOne({
            where       : {
                id
            },
            attributes  : {
                exclude : ["createdAt", "updatedAt"]
            }
        });

        if (response === null) {
            responseCode    = notFoundCode.statusCode,
            status          = notFoundCode.statusData,
            data            = {},
            message         = notFoundCode.message
        }else {
            responseCode    = success.statusCode,
            status          = success.statusData,
            data            = response,
            message         = success.message
        }

        res.status(responseCode).send({
            status,
            data    : {
                product : data
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

exports.addProduct  = async (req, res) => {
    try {
        let bodyReq   = req.body;
        const idUser    = req.user.id;
        const image     = req.file?.filename;
        bodyReq = {
            ...bodyReq,
            image
        }
        const schema    = Joi.object({
            name            : Joi.string().required(),
            price           : Joi.number().required(),
            description     : Joi.string().min(6).required(),
            stock           : Joi.number().required(),
            image           : Joi.string().required()
        });

        const validate  = schema.validate(bodyReq);
        let { value }   = validate;

        if (validate.error) {
            responseCode    = badRequestCode.statusCode;
            status          = validate.error.name;
            data            = value;
            message         = validate.error.message;
        }else {
            value   = {
                ...value,
                idUser
            }
            const newProduct    = await product.create(value);
            responseCode        = success.statusCode;
            status              = success.statusData;
            data                = newProduct;
            message             = "Success Add Product";
        }

        res.status(responseCode).send({
            status,
            data    : {
                product : data
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


exports.updateProduct   = async (req, res) => {
    try {

        const idProduct = req.params.id;
        let bodyReq     = req.body;

        const image     = req.file?.filename;
        bodyReq = {
            ...bodyReq,
            image
        }

        const schema    = Joi.object({
            name            : Joi.string(),
            price           : Joi.number(),
            description     : Joi.string(),
            stock           : Joi.number(),
            image           : Joi.string()
        });

        const validate  = schema.validate(bodyReq);
        let { value }   = validate;


        if (validate.error) {
            responseCode    = badRequestCode.statusCode;
            status          = validate.error.name;
            data            = value;
            message         = validate.error.message;
        }else {
            const oldProduct    = await product.findOne({
                where   : {
                    id  : idProduct
                }
            });

            if (oldProduct === null) {
                responseCode    = notFoundCode.statusCode;
                status          = notFoundCode.statusData;
                data            = {};
                message         = "Data not Found!";
                const oldImage  = fs.existsSync("uploads/" + value?.image);
                if (oldImage && image !== undefined){
                    const hapus = await fsPromise.unlink("uploads/" + value?.image);
                }
            }else {
                const oldImage  = fs.existsSync("uploads/" + oldProduct?.image);
                if (image !== oldProduct?.image && image !== undefined && oldImage){
                    const hapus = await fsPromise.unlink("uploads/" + oldProduct?.image);
                }

                const updateProduct = await product.update(value, {
                    where   : {
                        id  : idProduct
                    }
                });

                responseCode        = success.statusCode;
                status              = success.statusData;
                data                = value;
                message             = "Success to update product.";
            }
        }
        
        res.status(responseCode).send({
            status,
            data    : {
                product : value
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


exports.deleteProduct   = async (req, res) => {
    try {

        const id    = req.params.id;

        const checkProduct   = await product.findOne({
            where   : {
                id
            }
        });

        if (checkProduct === null){
            responseCode    = notFoundCode.statusCode;
            status          = notFoundCode.statusData;
            data            = checkProduct;
            message         = "Product with id " + id + " it does'nt exist!";
        }else {

            const imageProduct  = fs.existsSync("uploads/" + checkProduct?.image);
            imageProduct && await fsPromise.unlink("uploads/" + checkProduct?.image);
            const deleteProduct = await product.destroy({
                where   : {
                    id
                }
            });

            responseCode        = success.statusCode;
            status              = success.statusData;
            data                = deleteProduct;
            message             = "Success to deleted product.";
        }

        res.status(responseCode).send({
            status,
            data    : {
                product : data
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


// exports.removeImageError    = (req, res) => {
//     const {image}   = req.body
//     const imageProduct  = fs.existsSync("uploads/" + image);
//     imageProduct && await fsPromise.unlink("uploads/" + image);
//     const deleteProduct = await product.destroy({
//         where   : {
//             id
//         }
//     });
// }