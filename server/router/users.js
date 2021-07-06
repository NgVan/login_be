const express = require('express');
const router = require('express-promise-router')();
const passport = require('passport');

const passportJwt = require('../middleware/passport')


const userController = require('../controller/users');
const {validateBody, schemas} = require('../helper/validateHelper')

router.route('/auth/google')
    .post(passport.authenticate('google-token', {session: false}), userController.authGoogle)

router.route('/auth/facebook')
    .post(passport.authenticate('facebook-token', {session: false}), userController.authFacebook)

router.route('/signup')
    .post(validateBody(schemas.authSchema), userController.signUp);

router.route('/signin')
    .post(validateBody(schemas.authSchema),passport.authenticate('local', {session: false}), userController.signIn);

router.route('/secret')
    .get(passport.authenticate('jwt', {session: false}), userController.secret);

module.exports = router;