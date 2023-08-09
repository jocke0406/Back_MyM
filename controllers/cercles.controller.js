const client = require('../utils').dbClient;
const db = client.db(process.env.MONGO_DB_DATABASE);
const collection = db.collection('cercles');

exports.getCerclesAll = async (req, res) => {
    try {
        const cercles = await collection.find({}).toArray();
        res.status(200).json(cercles);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
