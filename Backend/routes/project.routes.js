const{Router}=require('express');
const{body}=require('express-validator');
const projectcontroller=require('../controllers/project.controller.js');
const authMiddleware=require('../middleware/auth.middleware');

const router=Router();

router.post('/create',
    authMiddleware.authUser,
    body('name').isString().withMessage('Name is only in String'), projectcontroller.createProject),

router.get('/getall',
    authMiddleware.authUser, projectcontroller.getAllProjects),


router.put('/add-user',
    authMiddleware.authUser,
    body('projectId').isString().withMessage('Project ID should be a string').bail(),
    body('users').isArray().withMessage('Users should be an array').bail()
    .notEmpty().withMessage('Users array should not be empty').bail()
    .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user should be a string'),
    projectcontroller.addUserToProject)

router.get('/get-projects/:projectId',
    authMiddleware.authUser, projectcontroller.getProjectById
)

router.put('/update-file-tree',
    authMiddleware.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('fileTree').isObject().withMessage('file tree is required'),
    projectcontroller.updateFileTree
)


module.exports=router;