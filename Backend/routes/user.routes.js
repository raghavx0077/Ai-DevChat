const{Router} = require('express');
const  userController =require('../controllers/usercontroller');
const {body}=require('express-validator');
const {authUser}=require('../middleware/auth.middleware')

const router=Router();


router.post('/register',
    body('email').isEmail().withMessage('Email must be as valid email address'),
    body('password').isLength({min:6}).withMessage('Mininum password length is 6 characters'),
    userController.createUserController);

router.post('/login',
    body('email').isEmail().withMessage('Email must be as valid email address'),
    body('password').isLength({min:6}).withMessage('Mininum password length is 6 characters'),
    userController.loginUserController);

router.get('/profile',authUser,userController.profileController);

router.get('/logout',authUser,userController.logoutController);

router.get('/getall',authUser,userController.getAllUsersController);
module.exports=router;
 


