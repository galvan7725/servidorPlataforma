const validator = require('validator');

exports.createPostValidator = (req, res, next) => {
 

    var params = req.body;
    //console.log(params);

 try {
    var validate_title = !validator.isEmpty(params.title) && !validator.isLength(params.title, {min: 4, max: 150});
    var validate_body = !validator.isEmpty(params.body) && !validator.isLength(params.body, {min: 4, max: 2000});
   console.log(validate_title);
   console.log(validate_body);
 } catch (ex) {
    return res.status(200).send({
        status: 'error',
        message: 'Faltan datos por enviar'
    });
 }
   if(validate_title){
    return res.status(200).send({
        status: 'error',
        message: 'El titulo es necesario y debe contener entre 4 y 150 caracteres'
    });
   }
   if(validate_body){
    return res.status(200).send({
        status: 'error',
        message: 'El contenido es necesario y debe contener entre 4 y 2000 caracteres'
    });
   }
next();
};

exports.userSingupValidator = (req, res, next) => {
    var params = req.body;
    console.log("params:",params);
    if(!params.name  || !params.email || !params.password){
        console.log("Parametros vacios");
        
    }
    try {
        var validte_name = !validator.isEmpty(params.name)  && validator.isLength(params.name,{min:4, max: 20});
        var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        var validate_password = !validator.isEmpty(params.password) && validator.isLength(params.password,{min: 6});
    } catch (ex) {
        console.log(ex);
        
        return res.status(400).send({
            error: 'Faltan datos por enviar'
        });
    }
    console.log(validte_name, validate_email, validate_password);
    
    if(!validte_name){
        return res.status(500).send({
            error: 'El nombre es necesario y debe contener entre 4 y 20 caracteres'
        });
    }

    if(!validate_email){
        return res.status(500).send({
            error: 'El email es necesario y debe contener un formato valido'
        });
    }

    if(!validate_password){
        return res.status(500).send({
            error: 'La contraseña es necesaria y debe contener al menos 6 caracteres'
        });
    }

    next();


};

exports.passwordResetValidator = (req, res, next) => {
    // check for password
    req.check('newPassword', 'Password is required').notEmpty();
    req.check('newPassword')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 chars long')
        .matches(
            /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
        )
        .withMessage('must contain a number')
        .withMessage('Password must contain a number');

    // check for errors
    const errors = req.validationErrors();
    // if error show the first one as they happen
    if (errors) {
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }
    // proceed to next middleware or ...
    next();
};



 