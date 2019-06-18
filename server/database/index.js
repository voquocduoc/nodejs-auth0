const client = require("mongodb").MongoClient;
const format = require("date-fns/format");
const MONGO_URL = process.env.MONGO_URL || "mongodb://app:mypassword345@ds231568.mlab.com:31568/be-like-ben"


let Db;

const connectToDatabase = (next) => {
    client.connect(MONGO_URL, (err, database) => {
        const db = database.db("be-like-ben")
        return next(err, db);
    })
}

const addUser = (user, next) => {
    connectToDatabase((err, db) => {
        const _users = db.collection("users");
        user.allowMessaging = true;
        _users.insertOne(user, (err, result) => {
            return next(err, result)
        })
    });
}

const getUser = (email, next) => {
    connectToDatabase((err, db) => {
        const _users = db.collection("users");
        _users.findOne({ email }, (err, result) => {
            return next(err, result)
        })
    });
}


const getUserVirtuesCount = (user, next) => {
    connectToDatabase((err, db) => {
        const _virtues = db.collection("virtues");
        _virtues.aggregate([
            {
                $match: {
                    userId: user._id, 
                    completed:true
                }
            },
            {
                $count: "benPoints"
            }
        ], (err, results) => {
            results.toArray().then((data) => {
                const rv = data[0]
                console.log("getting count of bens", { err, rv })
                return next(err, rv)
            });
        })
    });
}

const getUsersTodayValues = (user, next) => {
    const dateKey = format(Date.now(), "YYYY-MM-DD");
    connectToDatabase((err, db) => {
        const _virtues = db.collection("virtues");
        _virtues.aggregate([
            {
                $match: {
                    userId: user._id, 
                    dateKey
                }
            }
        ], (err, results) => {
            results.toArray().then((data) => {
                console.log("getting count of bens", { err, data })
                return next(err, data)
            });
        })
    });
}

const addYesToVirtue = (user, virtueId, next) => {
    connectToDatabase((err, db) => {
        const dateKey = format(Date.now(), "YYYY-MM-DD");

        const _virtues = db.collection("virtues");
        _virtues.update({
            dateKey,
            _userId: user._id,
            virtueId
        }, {
                _userId: user._id,
                timestamp: Date.now(),
                dateKey,
                virtueId,
                completed: true
            }, {
                upsert: true
            }, (err, result) => {
                console.log({ err, result })
                return next(err, result)
            })
    });
}


const addNoToVirtue = (user, virtueId, next) => {
    connectToDatabase((err, db) => {
        const dateKey = format(Date.now(), "YYYY-MM-DD");

        const _virtues = db.collection("virtues");
        _virtues.update({
            dateKey,
            _userId: user._id,
            virtueId
        }, {
                _userId: user._id,
                timestamp: Date.now(),
                dateKey,
                virtueId,
                completed: false
            }, {
                upsert: true
            }, (err, result) => {
                console.log({ err, result })
                return next(err, result)
            })
    });
}

const getAllUserForMessaging = (next) => {
    connectToDatabase((err, db) => {
        const _users = db.collection("users");
        _users.find({allowMessaging:true}).toArray((err, users) => {
            return next(err, users)
        })
    });
}

const getAllUsersVirtues = (user, next) =>{
    const dateKey = format(Date.now(), "YYYY-MM-DD");
    connectToDatabase((err, db) => {
        const _virtues = db.collection("virtues");
        _virtues.aggregate([
            {
                $match: {
                    userId: user._id, 
                }
            },
            {
                $sort:{
                    "timestamp":-1
                }
            }
        ], (err, results) => {
            results.toArray().then((data) => {
                console.log("getting all of bens", { err, data })
                return next(err, data)
            });
        })
    });
}

module.exports = {
    addUser,
    getUser,
    getUserVirtuesCount,
    addYesToVirtue,
    addNoToVirtue,
    getUsersTodayValues,
    getAllUserForMessaging,
    getAllUsersVirtues
}