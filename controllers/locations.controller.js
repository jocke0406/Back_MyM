const client = require('../utils').dbClient;
const db = client.db(process.env.MONGO_DB_DATABASE);
const collection = db.collection('locations');
const { ObjectId } = require('mongodb');

exports.getLocationsAll = async (req, res) => {
    try {
        const locations = await collection.find({}).toArray();
        res.status(200).json(locations);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getLocationsOne = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ message: 'No id provided' });
    }
    try {
        const data = await collection.findOne({ _id: new ObjectId(id) });
        if (!data) {
            res.status(404).json({
                message: `No Location found with id ${id}`,
            });
        }
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getLocationFull = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ message: 'No id provided' });
    }
    try {
        const event = await collection
            .aggregate([
                { $match: { _id: new ObjectId(id) } },
                {
                    $lookup: {
                        from: 'events',
                        localField: 'eventsId',
                        foreignField: '_id',
                        as: 'eventsByLocation',
                    },
                },

                {
                    $project: {
                        _id: 1,
                        name: 1,
                        address: 1,
                        geolocalisation: 1,
                        'events.name': 1,
                        'events.startAt': 1,
                        'events.endAt': 1,
                        participants_count: {
                            $size: '$events.participants_ids',
                        },
                    },
                },
            ])
            .toArray();
        if (event.length === 0) {
            res.status(404).json({ message: 'Event not found' });
        } else {
            res.status(200).json(event[0]);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
