const router    = require("express").Router();
require("dotenv").config();

// MIDDLEWARE
const { auth }  = require("../middleware/auth");
// const { uploadFile } = require("../middleware/uploadFile");
const { uploadFileUpdate } = require("../middleware/uploadFileUpdate");



// AUTHENTICATION
const { register, login, checkAuth }  = require("../controller/auth");
router.post('/register', register);
router.post('/login', login);
router.get('/check-auth', auth, checkAuth);


// PRODUCT
const { addProduct, getProducts, updateProduct, deleteProduct, getProductDetail } = require("../controller/product");
router.post('/products', auth, uploadFileUpdate("image"), addProduct);
router.get('/products', getProducts);
router.get('/products/:id', auth, getProductDetail);
router.patch('/products/:id', auth, uploadFileUpdate("image"), updateProduct);
router.delete('/products/:id', auth, deleteProduct);

// PROFILE
const { profileUpdate, getProfile } = require("../controller/profile");
router.patch('/profiles/:id', auth, uploadFileUpdate("image"), profileUpdate);
router.get('/profiles/:id', auth, getProfile);

// USER
const { userUpdate, getUser }    = require("../controller/user");
router.patch('/users/:id', auth, userUpdate);
router.get('/users/:id', auth, getUser);

const { detailTransaction, addTransaction, notification, getTransactions, changeStatus }    = require("../controller/transaction");
router.get('/transactions/:idBuyer', auth, detailTransaction);
router.patch('/transactions/:id', auth, changeStatus);
router.get('/transactions', auth, getTransactions);
router.post('/transactions', auth, addTransaction);
router.post("/notification", notification);


module.exports  = router;