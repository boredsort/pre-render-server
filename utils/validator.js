const Validator = require('jsonschema').Validator;
const v = new Validator();

const pageSchema = {
    "id":"/page",
    "type": "object",
    "properties": {
        "url": { "type": "string", "minLength": 6} ,
        "nextPage": {
            "type": "object",
            "properties": {
                "nextPageElement": {"type": "string"},
                "maxStep": {"type": "integer", "minimum": 1},
                "persistActions": {"type": "boolean"},
                "persistAltViews": {"type": "boolean"},
            },
            "required": ["nextPageElement"]
        },
        "alternateViews": {
            "type": "array",
            "items": {
                "type": "object",
                "properties":{
                    "viewName": {"type": "string"},
                    "actions": {
                        "type": "array",
                        "items": {
                            "action": { 
                                "$ref": "/action",
                            }
                        }
                    }
    
                }
            }

        },
        "actions": {
            "type": "array",
            "items": {
                "$ref": "/action"
            }
        }
    },
    "required": ["url"]
}

const actionSchema = {
    "id": "/action",
    "type": "object",
    "properties": {
        "type": {"type": "string"},
        "element": {"type": "string"},
        "delayBeforeAction": {"type": "integer"},
        "delayAfterAction": {"type": "integer"},
        "value":{"type": "string"},
    },
    "required": ["type", "element", "delayBeforeAction", "delayAfterAction"]
}

v.addSchema(actionSchema, "/action")

module.exports.Validator = v;
module.exports.pageSchema = pageSchema;