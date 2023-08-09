const client = require('../utils').dbClient;
const db = client.db(process.env.MONGO_DB_DATABASE);
const collection = db.collection('events');

exports.getEventsAll = async (req, res) => {
    try {
        const events = await collection.find({}).toArray();
        res.status(200).json(events);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
