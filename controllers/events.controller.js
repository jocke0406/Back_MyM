const client = require('../utils').dbClient;
const db = client.db(process.env.MONGO_DB_DATABASE);
const collection = db.collection('events');
const { ObjectId } = require('mongodb');
const Joi = require('joi');

exports.getEventsAll = async (req, res) => {
    try {
        const events = await collection.find({}).toArray();
        res.status(200).json(events);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getEventsOne = async (req, res) => {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'No or invalid id provided' });
    }
    try {
        const event = await collection.findOne({ _id: new ObjectId(id) });
        if (!event) {
            return res
                .status(404)
                .json({ message: `No Event found with id ${id}` });
        } else {
            res.status(200).json(event);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getEventFull = async (req, res) => {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'No or invalid id provided' });
    }
    try {
        const event = await collection
            .aggregate([
                { $match: { _id: new ObjectId(id) } },
                {
                    $lookup: {
                        from: 'locations',
                        localField: 'lieu_id',
                        foreignField: '_id',
                        as: 'location',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'participants_ids',
                        foreignField: '_id',
                        as: 'participants',
                    },
                },
                {
                    $lookup: {
                        from: 'cercles',
                        localField: 'organizer',
                        foreignField: '_id',
                        as: 'organizer',
                    },
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        startAt: 1,
                        endAt: 1,
                        description: 1,
                        'location.name': 1,
                        'location.address': {
                            street: '$location.address.street',
                            nbr: '$location.address.nbr',
                            postCode: '$location.address.postCode',
                            city: '$location.address.city',
                            district: '$location.address.district',
                            country: '$location.address.country',
                        },
                        'organizer.name': 1,
                        'organizer._id': 1,
                        'participants.name': 1,
                        'participants._id': 1,
                        'participants.pseudo': 1,
                    },
                },
            ])
            .toArray();
        if (event.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        } else {
            res.status(200).json(event[0]);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.createEvent = async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().max(100).required(),
        startAt: Joi.date().iso().greater('now').required(),
        endAt: Joi.date().iso().greater(Joi.ref('startAt')).required(),
        description: Joi.string().allow(''),
        lieu_id: Joi.string().hex().length(24).required(),
        participants_ids: Joi.array()
            .items(Joi.string().hex().length(24))
            .default([]),
        organizer: Joi.string().hex().length(24).required(),
    });

    const { body } = req;
    const { error, value } = schema.validate(body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const event = {
        ...value,
        lieu_id: new ObjectId(value.lieu_id),
        organizer: new ObjectId(value.organizer),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    };
    event.participants_ids = value.participants_ids.map(
        (id) => new ObjectId(id)
    );

    try {
        const insertedEvent = await collection.insertOne(event);
        const eventId = insertedEvent.insertedId;
        const locationCollection = db.collection('locations');
        const updateResult = await locationCollection.updateOne(
            { _id: new ObjectId(value.lieu_id) },
            { $push: { eventsId: eventId } }
        );
        if (updateResult.matchedCount === 0) {
            // Supprimer l'événement inséré précédemment car la mise à jour de la localisation a échoué
            await collection.deleteOne({ _id: eventId });

            return res
                .status(400)
                .json({ message: 'Specified location does not exist.' });
        }

        res.status(201).json(event);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateEvent = async (req, res) => {
    const { id } = req.params;

    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'No or invalid id provided' });
    }

    const schema = Joi.object({
        name: Joi.string().max(100).optional(),
        startAt: Joi.date().iso().greater('now').optional(),
        endAt: Joi.date().iso().greater(Joi.ref('startAt')).optional(),
        description: Joi.string().allow('').optional(),
        lieu_id: Joi.string().hex().length(24).optional(),
        participants_ids: Joi.array()
            .items(Joi.string().hex().length(24).optional())
            .optional(),
        organizer: Joi.string().hex().length(24).optional(),
    })
        .min(1)
        .unknown(false);

    const { body } = req;
    const { error, value } = schema.validate(body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {
        const updateValues = {
            ...value,
            updatedAt: new Date(),
        };
        if (updateValues.lieu_id) {
            updateValues.lieu_id = new ObjectId(updateValues.lieu_id);
        }
        if (updateValues.organizer) {
            updateValues.organizer = new ObjectId(updateValues.organizer);
        }

        const event = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateValues },
            { returnDocument: 'after' }
        );

        if (!event.value) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json(event.value);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteEvent = async (req, res) => {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'No or invalid id provided' });
    }

    const { force } = req.query;

    try {
        // Trouver l'événement pour obtenir le lieu_id
        const eventToDelete = await collection.findOne({
            _id: new ObjectId(id),
        });
        if (!eventToDelete) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Retirer l'ID de l'événement du tableau eventsId de la localisation
        const locationCollection = db.collection('locations');
        await locationCollection.updateOne(
            { _id: eventToDelete.lieu_id },
            { $pull: { eventsId: new ObjectId(id) } }
        );

        if (force === undefined || parseInt(force, 10) === 0) {
            // Suppression logique
            const data = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { deletedAt: new Date() } }
            );
            return res
                .status(200)
                .json({ message: 'Event logically deleted successfully' });
        }

        if (parseInt(force, 10) === 1) {
            // Suppression physique
            await collection.deleteOne({ _id: new ObjectId(id) });
            res.status(204).end();
        } else {
            return res
                .status(400)
                .json({ message: 'Malformed parameter "force"' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.eventAddParticipant = async (req, res) => {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'No or invalid id provided' });
    }

    const schema = Joi.object({
        userId: Joi.string().hex().length(24).required(),
        updatedAt: Joi.date().iso(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const updatedEvent = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            {
                $addToSet: { participants_ids: new ObjectId(value.userId) },
                $set: { updatedAt: new Date() },
            }
        );
        if (!updatedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json(updatedEvent);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal server error',
        });
    }
};

exports.eventRemoveParticipant = async (req, res) => {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'No or invalid id provided' });
    }
    const schema = Joi.object({
        userId: Joi.string().hex().length(24).required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const updatedEvent = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            {
                $pull: { participants_ids: new ObjectId(value.userId) },
                $set: { updatedAt: new Date() },
            }
        );
        if (!updatedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json(updatedEvent);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal server error',
        });
    }
};
