const express = require('express');
const LoginController = require('../controllers/LoginController');
const auth = require('../auth/auth')
const router = express.Router();

router.post('/register', LoginController.register);
router.post('/auth', LoginController.auth);
router.post('/update', auth, LoginController.update);
router.post('/destroy', auth, LoginController.destroy);
router.get('/verify', auth, LoginController.verify);

module.exports = router;
