// STATUS CODE
let success         =   {
    statusCode  : 200,
    statusData  : "success",
    message     : "Success"
};
const badRequestCode    =   {
    statusCode  : 400,
    statusData  : "badRequestError",
    message     : "Bad Request"
};
const notFoundCode      =   {
    statusCode  : 404,
    statusData  : "notFoundError",
    message     : "data not found!"
};
const unAuthorizeCode   =   {
    statusCode  : 401,
    statusData  : "unAuthorizedError",
    message     : "Unauthorized"
};;
const conflictCode      =   {
    statusCode  : 409,
    statusData  : "conflictError",
    message     : "Conflict"
};
const internalServerCode=   {
    statusCode  : 500,
    statusData  : "internalServerError",
    message     : "INTERNAL SERVER ERROR"
};



module.exports = { success, badRequestCode, notFoundCode, unAuthorizeCode, conflictCode, internalServerCode }