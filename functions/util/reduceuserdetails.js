/* eslint-disable */
const {isEmpty} = require('../util/stringcheck');

exports.reduceUserDetails = (data) => {
    let userDetails = {};
    if(!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
    if(!isEmpty(data.website.trim())) {
        if(data.website.trim().substring(0, 4) !== 'http'){
            userDetails.website = `https://${data.website.trim()}`;
        }
        else userDetails.website = data.website;
    }
    if(!isEmpty(data.location.trim())) userDetails.location = data.location;

    return userDetails;
};