const client = require('../utils').dbClient;
const db = client.db(process.env.MONGO_DB_DATABASE);
const collection = db.collection('users');

exports.getUsersAll = async (req, res) => {
    try {
        const users = await collection.find({}).toArray();
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
