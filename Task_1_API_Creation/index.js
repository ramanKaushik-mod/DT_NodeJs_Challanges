const { ObjectID } = require('bson');
const express = require('express');
const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbConn = require('./dbConn.js')

const PORT = 8080

const BASE_URL = '/api/v3/app'

app.get(`${BASE_URL}/events`, (req, res, next) => {
    if (req.query.id == null) {
        next()
    } else {
        const id = req.query.id.trim()
        dbConn.coll(async (coll) => {
            var doc = await coll.findOne({ "_id": ObjectID(`${id}`) })
            return doc
        }).then((result) => {
            result.db.close()
            res.status(200).json(result.result)
        }).catch((err) => {
            res.status(500).json({ 'err': 'internal server error' })
        })
    }
})


app.get(`${BASE_URL}/events`, (req, res) => {
    var type = req.query.type || 'latest'
    var page = Number(req.query.page) || 0
    var limit = Number(req.query.limit) || 3
    var flag = type === 'latest' ? -1 : 1

    dbConn.coll(async (coll) => {
        var docArr =
            await coll.find({}).sort({ "_id": flag }).skip(page * limit).limit(limit).toArray().then((docs, err) => {
                if (err) throw err;
                return docs
            })
        return docArr
    }).then((result) => {
        result.db.close()
        res.status(200).json(result.result)
    }).catch((err) => {
        res.status(500).json({ 'err': 'internal server error' })
    })
})


app.post(`${BASE_URL}/events`, async (req, res) => {
    var event = req.body
    dbConn.coll(async (coll) => {
        var obj = await coll.insertOne(event)
        return obj;
    }).then((result) => {
        result.db.close()
        res.status(200).json(result.result.insertedId)
    }).catch((err) => {
        res.status(500).json({ 'err': 'internal server error' })
    })
})

app.put(`${BASE_URL}/events`, (req, res) => {
    var eventUpdates = req.body
    var id = req.query.id
    if (id == null || id.length != 24) {
        res.status(400).json({ 'err': 'Bad Request' })
    } else {
        dbConn.coll(async (coll) => {
            var obj = await coll.updateOne({ '_id': ObjectID(`${id}`) }, { $set: eventUpdates })
            return obj;
        }).then((result) => {
            result.db.close()
            res.status(200).json({ 'res': `${id} is successfully updated` })
        }).catch((err) => {
            res.status(500).json({ 'err': 'internal server error' })
        })
    }

})

app.delete(`${BASE_URL}/events`, (req, res) => {
    var id = req.query.id.trim().toString()

    if (id == null || id.length != 24) {
        res.status(400).json({ 'err': 'Bad Request' })
    } else {
        dbConn.coll(async (coll) => {
            var obj = await coll.deleteOne({ '_id': ObjectID(`${id}`) })
            return obj;
        }).then((result) => {
            result.db.close()
            res.status(200).json({ 'res': `Event with event_id : ${id} deleted successfully` })
        }).catch((err) => {
            res.status(500).json({ 'err': 'internal server error' })
        })
    }
})


app.listen(PORT, () => {
    console.log(`Assignment-1; Task-1 (SERVER) is up and running at ${PORT}`);
})