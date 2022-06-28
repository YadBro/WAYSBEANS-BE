const { user }  = require("../../models");
const { unAuthorizeCode, internalServerCode } = require("../statuscode");
const jwt   = require("jsonwebtoken");


exports.auth    = async (req, res, next) => {
    const header    = req.header("Authorization");
    const token     = header && header.split(' ')[1];
    if (!token) {
        return res.status(unAuthorizeCode.statusCode).send({
            status  : "failed",
            message : "Access Denied"
        });
    }else {

        try {
            const verified  = jwt.verify(token, process.env.SECRET_KEY);
            const dataUser  = await user.findOne({
                where   : {
                    id  : verified.id
                }
            });
            if (dataUser === null) {
                return res.status(unAuthorizeCode.statusCode).send({
                    status  : "failed",
                    message : "Access Denied"
                });
            }else {
                req.user        = verified;
                next();
            }
        } catch (error) {
            return res.status(internalServerCode.statusCode).send({
                status  : error.name,
                message : error.message
            });
        }

    }


}