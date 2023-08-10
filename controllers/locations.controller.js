const client = require('../utils').dbClient;
const db = client.db(process.env.MONGO_DB_DATABASE);
const collection = db.collection('locations');
const { ObjectId } = require('mongodb');
const Joi = require('joi');

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
                    $unwind: '$eventsByLocation',
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'eventsByLocation.participants_ids',
                        foreignField: '_id',
                        as: 'eventsByLocation.participants',
                    },
                },

                {
                    $project: {
                        _id: 1,
                        name: 1,
                        address: 1,
                        geolocalisation: 1,
                        'eventsByLocation.name': 1,
                        'eventsByLocation.startAt': 1,
                        'eventsByLocation.endAt': 1,
                        'eventsByLocation.organizer': 1,
                        'eventsByLocation.participants_ids': 1,
                        'eventsByLocation.participants._id': 1,
                        'eventsByLocation.participants.pseudo': 1,
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

exports.createLocation = async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().max(100).required(),
        address: Joi.object({
            street: Joi.string().required(),
            nbr: Joi.number().integer().optional(),
            box: Joi.string().optional(),
            postCode: Joi.string().required(),
            city: Joi.string().required(),
            district: Joi.string().optional(),
            country: Joi.string().optional(),
        }).required(),
        geolocalisation: Joi.object({
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            precision: Joi.number(),
        }).optional(),
        eventsId: Joi.array().items(Joi.string().hex().length(24)).default([]),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const location = {
            ...value,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        };
        await collection.insertOne(location);
        res.status(201).json(location);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateLocation = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'No ID provided' });
    }

    const schema = Joi.object({
        name: Joi.string().max(100).optional(),
        address: Joi.object({
            street: Joi.string().optional(),
            nbr: Joi.number().optional(),
            postCode: Joi.string().optional(),
            city: Joi.string().optional(),
            district: Joi.string().optional(),
            country: Joi.string().optional(),
        }).optional(),
        geolocalisation: Joi.object({
            latitude: Joi.number().optional(),
            longitude: Joi.number().optional(),
            precision: Joi.number().optional(),
        }).optional(),
    })
        .min(1)
        .unknown(false); // Refuse les champs non définis dans le schéma

    const { error, value } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const location = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { ...value, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );

        if (!location.value) {
            return res.status(404).json({ message: 'Location not found' });
        }
        res.status(200).json(location.value);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteLocation = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'No id provided' });
    }

    const { force } = req.query;

    try {
        const locationExists = await collection.findOne({
            _id: new ObjectId(id),
        });
        if (!locationExists) {
            return res.status(404).json({ message: 'Location not found' });
        }

        if (force === undefined || parseInt(force, 10) === 0) {
            // Suppression logique
            const data = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { deletedAt: new Date() } }
            );
            return res.status(200).json(data);
        }

        if (parseInt(force, 10) === 1) {
            // Suppression physique
            await collection.deleteOne({ _id: new ObjectId(id) });
            return res.status(204).end();
        }

        return res.status(400).json({ message: 'Malformed parameter "force"' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.modifyEventsForLocation = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'No location ID provided' });
    }

    const { addEventId, removeEventId } = req.body;

    if (!addEventId && !removeEventId) {
        return res
            .status(400)
            .json({ message: 'Provide either addEventId or removeEventId' });
    }

    try {
        if (addEventId) {
            await collection.updateOne(
                { _id: new ObjectId(id) },
                { $addToSet: { eventsId: new ObjectId(addEventId) } }
            );
        }

        if (removeEventId) {
            await collection.updateOne(
                { _id: new ObjectId(id) },
                { $pull: { eventsId: new ObjectId(removeEventId) } }
            );
        }

        const updatedLocation = await collection.findOne({
            _id: new ObjectId(id),
        });
        if (!updatedLocation) {
            return res.status(404).json({ message: 'Location not found' });
        }

        res.status(200).json(updatedLocation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
