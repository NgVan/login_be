const Joi = require('joi');

const validateBody = (A) => {
    return(req, res, next) => {
        const bodyResult = A.validate(req.body);
        console.log("bodyResult: ", bodyResult);
        if (bodyResult.error)
            return res.status(400).json(bodyResult.error);
        //req.value.body
        if(!req.value) req.value = {};
        req.value.body = bodyResult.value
        next();
    }    
}
const schemas = {
    authSchema:Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    })
}

module.exports = {
    validateBody,
    schemas
}