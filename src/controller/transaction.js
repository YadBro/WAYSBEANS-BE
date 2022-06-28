const { success, badRequestCode, internalServerCode }   = require('../statuscode');
const { user, product, transaction, profile } = require('../../models');
const Joi   = require('joi');
const midtransClient    = require('midtrans-client');

let successCode;
let statusData;
let message;

exports.addTransaction = async (req, res) => {
    try {
        let data  = req.body.body;
        let newData;
        data    = JSON.parse(data);
        data    = {
            id      : parseInt(data.idProduct + Math.random().toString().slice(3,8)),
            ...data,
            status  : "pending"
        }
        // VALIDATING
        const schema = Joi.object({
            id          : Joi.number().required(),
            idProduct   : Joi.number().required(),
            idBuyer     : Joi.number().required(),
            idSeller    : Joi.number().required(),
            price       : Joi.number().required(),
            status      : Joi.string().required()
        });

        const validateData  = schema.validate(data);
        let { value }       = validateData;

        if (validateData?.error) {
            successCode     = badRequestCode.statusCode;
            statusData      = validateData.error?.name;
            message         = validateData.error?.message;
            newData         = value;
        }else {
            // CREATE A NEW TRANSACTION
            const newTransaction    = await transaction.create(value);
            // GET BUYER DATA FOR TRANSACTION IN MIDTRANS
            const buyerData = await user.findOne({
                include : {
                    model       : profile,
                    as          : "profile",
                    attributes  : {
                        exclude : ["createdAt", "updatedAt", "idUser"]
                    }
                },
                where   : {
                    id  : newTransaction.idBuyer
                },
                attributes  : {
                    exclude : ["createdAt", "updatedAt", "password"]
                }
            });

            // INSTANCE THE MIDTRANS
            let snap    = new midtransClient.Snap({
                isProduction    : false,
                serverKey       : process.env.MIDTRANS_SERVER_KEY
            });

            // CONFIGURATION PARAMETER MIDTRANS
            let parameter = {
                transaction_details: {
                    order_id    : newTransaction.id,
                    gross_amount: newTransaction.price,
                },
                credit_card: {
                    secure  : true,
                },
                customer_details: {
                    full_name   : buyerData?.name,
                    email       : buyerData?.email,
                    phone       : buyerData?.profile?.phone,
                },
            };

            // CREATE A PAYMENT
            const payment = await snap.createTransaction(parameter);
            newData     = {
                transaction: newTransaction,
                payment
            };

            successCode = success.statusCode;
            statusData  = "pending";
            message     = "Pending transaction payment gateaway";
        }

        res.status(successCode).send({
            status  : statusData,
            data    : newData,
            product : {
                id  : data.idProduct
            },
            message
        });
    } catch (error) {
        statusData  = error.name || internalServerCode.statusData;
        message     = error.message || internalServerCode.message;
        res.status(internalServerCode.statusCode).send({
            status  : statusData,
            data    : {},
            message
        });
    }
}


const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

const core = new midtransClient.CoreApi();

core.apiConfig.set({
    isProduction: false,
    serverKey: MIDTRANS_SERVER_KEY,
    clientKey: MIDTRANS_CLIENT_KEY
});


exports.notification = async (req, res) => {
    try {
        const statusResponse = await core.transaction.notification(req.body);
        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;
        console.log("Transaction is " + transactionStatus + " a.k.a success");

        if (transactionStatus == "capture") {
            if (fraudStatus == "challenge") {
                // TODO set transaction status on your database to 'challenge'
                // and response with 200 OK
                // sendEmail("pending", orderId); //sendEmail with status pending and order id
                handleTransaction("pending", orderId);
                res.status(200);
            } else if (fraudStatus == "accept") {
                // TODO set transaction status on your database to 'success'
                // and response with 200 OK
                // sendEmail("success", orderId); //sendEmail with status success and order id
                updateProduct(orderId);
                handleTransaction("success", orderId);
                res.status(200);
            }
            } else if (transactionStatus == "settlement") {
            // TODO set transaction status on your database to 'success'
            // and response with 200 OK
            // sendEmail("success", orderId); //sendEmail with status success and order id
            updateProduct(orderId);
            handleTransaction("success", orderId);
            res.status(200);
            } else if (
            transactionStatus == "cancel" ||
            transactionStatus == "deny" ||
            transactionStatus == "expire"
            ) {
            // TODO set transaction status on your database to 'failure'
            // and response with 200 OK
            // sendEmail("failed", orderId); //sendEmail with status failed and order id
            handleTransaction("failed", orderId);
            res.status(200);
            } else if (transactionStatus == "pending") {
            // TODO set transaction status on your database to 'pending' / waiting payment
            // and response with 200 OK
            // sendEmail("pending", orderId); //sendEmail with status pending and order id
            handleTransaction("pending", orderId);
            res.status(200);
            }
    } catch (error) {
        console.log(error);
        res.status(500);
    }
};
const handleTransaction = async (status, transactionId) => {
    await transaction.update(
        {
        status,
        },
        {
        where: {
            id: transactionId,
        },
        }
    );
};

const updateProduct = async (orderId) => {
    const transactionData = await transaction.findOne({
        where: {
            id: orderId,
        },
    });
    const productData = await product.findOne({
        where: {
            id: transactionData.idProduct,
        },
    });
    const qty = productData.qty - 1;
    await product.update({ qty }, { where: { id: productData.id } });
};



exports.changeStatus    = async (req, res) => {
    try {
        const {id}  = req.params;
        const {status} = req.body;
        await transaction.update({status}, {
            where: {
                id
            }
        });
        res.status(200).send({ok: "ok"});
    } catch (error) {
        res.status(500).send({error: error.message});
    }
}
// const sendEmail = async (status, transactionId) => {
//     // Config service and email account
//     const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//         user: process.env.SYSTEM_EMAIL,
//         pass: process.env.SYSTEM_PASSWORD,
//         },
//     });

//     // Get transaction data
//     let data = await transaction.findOne({
//         where: {
//         id: transactionId,
//         },
//         attributes: {
//         exclude: ["createdAt", "updatedAt", "password"],
//         },
//         include: [
//         {
//             model: user,
//             as: "buyer",
//             attributes: {
//             exclude: ["createdAt", "updatedAt", "password", "status"],
//             },
//         },
//         {
//             model: product,
//             as: "product",
//             attributes: {
//             exclude: [
//                 "createdAt",
//                 "updatedAt",
//                 "idUser",
//                 "qty",
//                 "price",
//                 "desc",
//             ],
//             },
//         },
//         ],
//     });

//     data = JSON.parse(JSON.stringify(data));
//     console.log(data);
//     // Email options content
//     const mailOptions = {
//         from: process.env.SYSTEM_EMAIL,
//         to: data.buyer.email,
//         subject: "Payment status",
//         text: "Your payment is <br />" + status,
//         html: `<!DOCTYPE html>
//                 <html lang="en">
//                 <head>
//                     <meta charset="UTF-8" />
//                     <meta http-equiv="X-UA-Compatible" content="IE=edge" />
//                     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//                     <title>Document</title>
//                     <style>
//                     h1 {
//                         color: brown;
//                     }
//                     </style>
//                 </head>
//                 <body>
//                     <h2>Product payment :</h2>
//                     <ul style="list-style-type:none;">
//                     <li>Name : ${data?.product?.name}</li>
//                     <li>Total payment: ${data?.price}</li>
//                     <li>Status : <b>${status}</b></li>
//                     </ul>  
//                 </body>
//                 </html>`,
//     };

//     // Send an email if there is a change in the transaction status
//     if (data.status != status) {
//         transporter.sendMail(mailOptions, (err, info) => {
//         if (err) throw err;
//         console.log("Email sent: " + info.response);

//         return res.send({
//             status: "Success",
//             message: info.response,
//         });
//         });
//     }
//     };

exports.getTransactions   = async (req, res) => {
    try {
        let transactions = await transaction.findAll({
            order: [["createdAt", "DESC"]],
            attributes: {
                exclude: ["updatedAt", "idBuyer", "idSeller", "idProduct"],
            },
            include: [
                {
                    model: product,
                    as: "product",
                    attributes: {
                        exclude: [
                        "createdAt",
                        "updatedAt",
                        "idUser",
                        "qty",
                        "price",
                        "desc",
                        ],
                    },
                },
                {
                    model: user,
                    as: "buyer",
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "password", "status"],
                    },
                },
                {
                    model: user,
                    as: "seller",
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "password", "status"],
                    },
                },
            ],
        });

        let trans;
        // allTransactions.forEach(async element => {
        //     const products = await product.findOne({
        //         where   : {
        //             id      : element.idProduct,
        //         },
        //         attributes  : {
        //             exclude : ['createdAt', 'updatedAt']
        //         }
        //     });
        //     const buyer = await user.findOne({
        //         where   : {
        //             id      : element.idBuyer,
        //         },
        //         attributes  : {
        //             exclude : ['createdAt', 'updatedAt', 'password', 'status']
        //         }
        //     });
        //     const seller = await user.findOne({
        //         where   : {
        //             id      : element?.idSeller,
        //         },
        //         attributes  : {
        //             exclude : ['createdAt', 'updatedAt', 'password', 'status']
        //         }
        //     });
        //     allTransactions  = {
        //         id          : element?.id,
        //         products,
        //         buyer,
        //         seller,
        //         price       : element?.price,
        //         status      : element?.status
        //     }
            
        // });
        
        successCode = success.statusCode;
        statusData  = success.statusData;
        message     = success.message;

        res.status(successCode).send({
            status  : statusData,
            data    : {
                transactions
            },
            message
        });
        
    } catch (error) {
        statusData  = error.name;
        message     = error.message;
        res.status(internalServerCode.statusCode).send({
            status  : statusData,
            data    : {},
            message
        });
    }
}


exports.detailTransaction = async (req, res) => {
    try {
        const {idBuyer} = req.params
        let transactions = await transaction.findAll({
            where: {
                idBuyer,
            },
            order: [["createdAt", "DESC"]],
            attributes: {
                exclude: ["updatedAt", "idBuyer", "idSeller", "idProduct"],
            },
            include: [
                {
                    model: product,
                    as: "product",
                    attributes: {
                        exclude: [
                        "createdAt",
                        "updatedAt",
                        "idUser",
                        "qty",
                        "price",
                        "desc",
                        ],
                    },
                },
                {
                    model: user,
                    as: "buyer",
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "password", "status"],
                    },
                },
                {
                    model: user,
                    as: "seller",
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "password", "status"],
                    },
                },
            ],
        });
        transactions = JSON.parse(JSON.stringify(transactions));

        // transactions = transactions.map((item) => {
        //     return {
        //         ...item,
        //         product: {
        //         ...item.product,
        //         image: process.env.PATH_FILE + item.product.image,
        //         },
        //     }
        // });
        transactions = transactions.map(item => (
            item = {
                ...item,
                product : {
                    ...item.product,
                    image : process.env.PATH_FILE + item.product.image
                }
            }
        ))
        
        res.status(200).send({
            status  : statusData,
            data    : transactions,
            message
        });
    } catch (error) {
        // console.log(error)
        statusData  = error.name;
        message     = error.message;
        res.status(500).send({
            status  : statusData,
            data    : {},
            message
        });
    }
}