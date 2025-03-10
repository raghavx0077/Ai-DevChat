const {Router} = require("express");
const aiController = require('../controllers/ai.controller.js');

const router= Router();

router.get('/get-result',aiController.getResult);

module.exports=router;
