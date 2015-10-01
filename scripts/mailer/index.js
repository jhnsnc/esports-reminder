var _ = require('underscore'),
    Promise = require('bluebird'),
    mandrill = require('mandrill-api'),
    nconf = require('nconf'),
    lolESports = require('../lol-esports'),
    app = require('../../app'),
    sass = require('node-sass');

//config
var apiKey = nconf.get('mandrill:key');
var mailer = new mandrill.Mandrill(apiKey);
var isEnabled = !!apiKey && !nconf.get('mandrill:disabled');

//misc
var todaysDate = new Date().toISOString().replace(/T\S+/, "");
var subjectLine = "LoL Matches for " + todaysDate;

//export functions
//TODO: function description
var sendEmails = function(options) {
    if ( !isEnabled && (!options || !options.force) ) { return false; }

    console.log( "Begin preparing emails at " + new Date().toISOString() );

    prepareMarkup()
    .then(function(html) {
        console.info( "Data ready. Sending emails." );

        var message = {
            "html": html,
            "subject": subjectLine,
            "from_email": "esports.robot@cjdevsite.com", //TODO: move this to a config file
            "from_name": "eSports Notifications", //TODO: move this to a config file
            "to": [{
                "email": "jhnsn.c@gmail.com", //TODO: don't hard-code this
                "name": "Docjekyll", //TODO: don't hard-code this
                "type": "to"
            }],
            "important": false,
            "inline_css": true,
           "tags": [ "esports", "league of legends", "notifications", "schedule" ]
        };

        var async = true;
        var ip_pool = "Main Pool";

        mailer.messages.send({"message": message, "async": true, "ip_pool": ip_pool}, 
            function onSent(result) {
                console.info(result);
            }, function onError(err) {
                console.error(err);
            });
    }).catch(function(e){return true;}, function(err) { //TODO: have better error handling (sytax/operational errors)
        console.error( "An error occurred while sending an email [" + err.code + ": " + err.message + "]" )
    });
};

//returns a promise that will resolve to the markup for the email to be sent
var prepareMarkup = function() {
    //  Promise.promisify(sass.render)({file: filename, outputStyle:"compressed"})

    return lolESports.getMatches()
        .then(function(matchData) {
            return Promise.fromNode(app.render.bind(app, 'mail/upcoming', {
                title: subjectLine,
                timeSent: new Date().toISOString(),
                matches: _.map(matchData, JSON.parse)
            }));
        });
};

module.exports = {
    sendEmails: sendEmails,
    prepareMarkup: prepareMarkup //TODO: probably remove this from exports
};
