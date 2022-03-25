

const {v5: uuidv5} = require('uuid')

function today(){
    let date = new Date()
    return date.toISOString().split('T')[0]
 }

 function urlto_uuid(url){
    return uuidv5(url, uuidv5.URL)
 }

 module.exports.today = today;
 module.exports.urlto_uuid = urlto_uuid;
