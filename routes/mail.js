var express = require('express'),
    router = express.Router(),
    mailer = require('../scripts/mailer');

/* Mail endpoint. Forces the current sendEmails() function. */
router.get('/send', function(req, res, next) {
    mailer.sendEmails({force: true});
    res.send('Email sent? Maybe?');
});

/* View mail data. Doesn't send mail, but displays the data the would be sent in the email. */
router.get('/view', function(req, res, next) {
    mailer.prepareMarkup()
    .then(function(html) {
        res.send(html);
    }).catch(function(e){return true;}, function(err) { //TODO: have better error handling (sytax/operational errors)
        console.error( "An error occurred while preparing markup [" + err.code + ": " + err.message + "]" )
    });
});

module.exports = router;
