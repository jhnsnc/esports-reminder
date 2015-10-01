var _ = require('underscore'),
    Promise = require('bluebird'),
    nconf = require('nconf'),
    request = Promise.promisify(require('request'));

var baseUrl = nconf.get('lol-esports-api').baseUrl;
var endpoints = nconf.get('lol-esports-api').endpoints;

//returns a promise that will resolve to an array of all matches data
var getMatches = function() {
    return getProgrammingWeek()
        .then(function(programmingWeek) {
            var data = JSON.parse(getResponseBody(programmingWeek));

            //returns an array of promises that will resolve to the data for each programming block in the next week
            // return _.map(_.uniq(_.pluck(data.programming_block, 'id')), getProgrammingBlock);

            //returns an array of promises that will resolve to the data for each programming block for the next day
            var blockIds = [];
            blockIds.push( data.days[0].blockNum > 0 ? data.days[0].blockIds : []);
            blockIds.push( data.days[1].blockNum > 0 ? data.days[1].blockIds : []);
            blockIds.push( data.days[2].blockNum > 0 ? data.days[2].blockIds : []);
            return _.map(_.flatten(blockIds), getProgrammingBlock);
        })
        .map(function(programmingBlock) {
            //return the match ids for each programming block
            return JSON.parse(getResponseBody(programmingBlock)).matches;
        })
        .then(function(matchIds) {
            //return an array of promises that will resolve to the data for each match in the provided programming blocks
            return _.map(_.uniq(_.flatten(matchIds)), getMatchDetails);
        })
        .map(getResponseBody);
};

//returns a promise that will resolve to an array of programming data for the current week
var getProgrammingWeek = function() {
    var uri = endpoints.programmingWeek
        .replace('{date}', new Date().toISOString().replace(/T\S+/,"")) //date in truncated ISO format (YYYY-MM-DD)
        .replace('{offset}', 0); //offset of "0" since we want this week, starting with today

    return request({
        uri: uri,
        baseUrl: baseUrl,
        method: "GET"
    });
};

//returns a promise that will resolve to the details for the specified programming block
var getProgrammingBlock = function(blockId) {
    var uri = endpoints.programmingBlock
        .replace('{id}', blockId);

    return request({
        uri: uri,
        baseUrl: baseUrl,
        method: "GET"
    });
};

//returns a promise that will resolve to the details for the specified match
var getMatchDetails = function(matchId) {
    var uri = endpoints.matchDetails
        .replace('{matchId}', matchId);

    return request({
        uri: uri,
        baseUrl: baseUrl,
        method: "GET"
    });
};

//simple utility function
var getResponseBody = function(res) {
    return res[0].body;
};

module.exports = {
    getMatches: getMatches
};
