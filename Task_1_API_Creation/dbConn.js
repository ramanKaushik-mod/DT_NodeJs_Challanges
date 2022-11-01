const { ObjectId } = require('mongodb')

const mongo = require('mongodb').MongoClient

const URL = 'mongodb://127.0.0.1:27017/'

const getEventCollection = async (callback) => {
    return await mongo.connect(URL).then(async (db) => {
        var database = db.db("Event_Record")
        var coll = database.collection('event_data')
        var obj = await callback(coll)
        return { 'result': obj, 'db': db }
    })
}


module.exports = {
    'coll': getEventCollection,
}