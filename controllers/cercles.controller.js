const client = require('../utils').dbClient;
const db = client.db(process.env.MONGO_DB_DATABASE);
const collection = db.collection('cercles');
const { ObjectId } = require('mongodb');
const Joi = require('joi');

exports.getCerclesAll = async (req, res) => {
    try {
        const cercles = await collection.find({}).toArray();
        res.status(200).json(cercles);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getCerclesOne = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !ObjectId.isValid(id)) {
            return res
                .status(400)
                .json({ message: 'No or invalid id provided' });
        }
        const data = await collection.findOne({ _id: new ObjectId(id) });
        if (!data) {
            return res
                .status(404)
                .json({ message: `No Cercle found with id ${id}` });
        }
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getCerclesMembers = async (req, res) => {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({
            message: 'No or invalid id provided',
        });
    }
    try {
        const data = await collection
            .aggregate([
                { $match: { _id: new ObjectId(id) } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'members_ids',
                        foreignField: '_id',
                        as: 'members',
                    },
                },
                {
                    $project: {
                        _id: 0,
                        members: {
                            pseudo: 1,
                            email: 1,
                            name: 1,
                            dateOfBirth: 1,
                            study: 1,
                            phone: 1,
                            photo: 1,
                            cap: 1,
                        },
                    },
                },
            ])
            .toArray();

        if (data.length === 0) {
            return res.status(404).json({ message: 'No member found' });
        } else {
            res.status(200).json(data);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getCercleLocation = async (req, res) => {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({
            message: 'No or invalid id provided',
        });
    }
    try {
        const data = await collection
            .aggregate([
                { $match: { _id: new ObjectId(id) } },

                {
                    $lookup: {
                        from: 'locations',
                        localField: 'address',
                        foreignField: '_id',
                        as: 'location',
                    },
                },
                {
                    $project: { location: 1 },
                },
            ])
            .toArray();

        if (data.length === 0) {
            return res.status(404).json({ message: 'No event found' });
        } else {
            res.status(200).json(data[0]);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getCercleEvents = async (req, res) => {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({
            message: 'No or invalid id provided',
        });
    }
    try {
        const data = await collection
            .aggregate([
                { $match: { _id: new ObjectId(id) } },
                {
                    $lookup: {
                        from: 'events',
                        localField: '_id',
                        foreignField: 'organizer',
                        as: 'events',
                    },
                },
                {
                    $project: {
                        _id: 0,
                        events: {
                            name: 1,
                            startAt: 1,
                            endAt: 1,
                            description: 1,
                            participants_ids: 1,
                        },
                    },
                },
            ])
            .toArray();

        if (data.length === 0) {
            return res.status(404).json({ message: 'No event found' });
        } else {
            res.status(200).json(data);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.createCercle = async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().max(100).required(),
        hymne: Joi.string().allow(''),
        address: Joi.string().hex().length(24).required(),
        description: Joi.string(),
        members_ids: Joi.array()
            .items(Joi.string().hex().length(24))
            .default([]),
    });
    const { body } = req;

    const { error, value } = schema.validate(body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const cercle = {
        ...value,
        address: new ObjectId(value.address),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    };
    try {
        await collection.insertOne(cercle);
        res.status(201).json(cercle);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updateCercle = async (req, res) => {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'No or invalid id provided' });
    }

    const schema = Joi.object({
        name: Joi.string().max(100).optional(),
        hymne: Joi.string().optional(),
        address: Joi.string().hex().length(24).optional(),
        description: Joi.string().optional(),
        members_ids: Joi.array()
            .items(Joi.string().hex().length(24))
            .optional(),
    })
        .min(1)
        .unknown(false);

    const { error, value } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    if (value.address) {
        value.address = new ObjectId(value.address);
    }

    try {
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...value, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res
                .status(404)
                .json({ message: `No Cercle found with id ${id}` });
        }

        res.status(200).json({ message: 'Cercle updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.deleteCercle = async (req, res) => {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'No or invalid id provided' });
    }

    const { force } = req.query;

    try {
        // Vérification de l'existence du cercle
        const cercle = await collection.findOne({ _id: new ObjectId(id) });
        if (!cercle) {
            return res.status(404).json({ message: 'Cercle not found' });
        }

        if (force === undefined || parseInt(force, 10) === 0) {
            // suppression logique
            const data = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { deletedAt: new Date() } }
            );

            return res
                .status(200)
                .json({ message: 'Cercle logically deleted successfully' });
        } else if (parseInt(force, 10) === 1) {
            // suppression physique
            await collection.deleteOne({ _id: new ObjectId(id) });
            return res.status(204).send();
        } else {
            return res
                .status(400)
                .json({ message: 'Malformed parameter "force"' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
