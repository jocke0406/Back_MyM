const client = require('../utils').dbClient;
const db = client.db(process.env.MONGO_DB_DATABASE);
const collection = db.collection('users');
const cercleCollection = db.collection('cercles');
const eventCollection = db.collection('events');
const { ObjectId } = require('mongodb');
const Joi = require('joi');
const bcrypt = require('bcrypt');

exports.getUsersAll = async (req, res) => {
    try {
        const users = await collection.find({}).toArray();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getUsersOne = async (req, res) => {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'No or invalid id provided' });
    }
    try {
        const data = await collection.findOne({ _id: new ObjectId(id) });
        if (!data) {
            return res
                .status(404)
                .json({ message: `No User found with id ${id}` });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getUserFull = async (req, res) => {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'No or invalid id provided' });
    }
    try {
        const userFull = await collection
            .aggregate([
                { $match: { _id: new ObjectId(id) } },
                {
                    $lookup: {
                        from: 'events',
                        localField: '_id',
                        foreignField: 'participants_ids',
                        as: 'userEvents',
                    },
                },
                {
                    $lookup: {
                        from: 'cercles',
                        localField: 'student_association.association_id',
                        foreignField: '_id',
                        as: 'userCercle',
                    },
                },
                {
                    $project: {
                        _id: 0,
                        name: 1,
                        pseudo: 1,
                        email: 1,
                        address: 1,
                        dateOfBirth: 1,
                        study: 1,
                        phone: 1,
                        cap: 1,
                        cercle: '$userCercle.name',
                        participations: '$userEvents.name',
                    },
                },
            ])
            .toArray();

        res.status(200).json(userFull[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getUserFriends = async (req, res) => {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'No or invalid id provided' });
    }
    try {
        const user = await collection.findOne({ _id: new ObjectId(id) });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user.friends || user.friends.length === 0) {
            return res.status(200).json([]);
        }
        const friendsIds = user.friends.map((id) => new ObjectId(id));
        const friends = await collection
            .find({ _id: { $in: friendsIds } })
            .project({
                _id: 1,
                name: 1,
                pseudo: 1,
                photo: 1,
                geolocalisation: 1,
            })
            .toArray();

        res.status(200).json(friends);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getUserEvents = async (req, res) => {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'No or invalid id provided' });
    }
    try {
        const userEvents = await collection
            .aggregate([
                { $match: { _id: new ObjectId(id) } },
                {
                    $lookup: {
                        from: 'events',
                        localField: '_id',
                        foreignField: 'participants_ids',
                        as: 'userEvents',
                    },
                },
                {
                    $project: {
                        userEvents: '$userEvents',
                        _id: 0,
                    },
                },
            ])
            .toArray();

        if (userEvents.length === 0) {
            return res.status(404).json({ message: 'No event found' });
        } else {
            res.status(200).json(userEvents[0]);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.createUser = async (req, res) => {
    const schema = Joi.object({
        name: Joi.object({
            first: Joi.string().max(50).required(),
            last: Joi.string().max(50).required(),
        }).required(),
        pseudo: Joi.string().max(50).required(),
        email: Joi.string().email().required(),
        role: Joi.string().default('user'),
        address: Joi.object({
            street: Joi.string().required(),
            nbr: Joi.number().integer().optional(),
            box: Joi.string().optional(),
            postCode: Joi.string().required(),
            city: Joi.string().required(),
            country: Joi.string().optional(),
        }),
        dateOfBirth: Joi.date()
            .max(
                new Date(
                    new Date().setFullYear(new Date().getFullYear() - 16)
                ).toISOString()
            )
            .required(),
        password: Joi.string().min(8).required(),
        study: Joi.object({
            studyField: Joi.string().max(200),
            year: Joi.number().integer().optional(),
        }),
        phone: Joi.string().max(12).optional(),
        photo: Joi.string().default('/images/imageDefaultUser.jpg'),
        cap: Joi.object({
            hasCap: Joi.boolean().default(false),
            provider: Joi.string().optional(),
            deliveryDate: Joi.date().less('now').optional(),
            goldStars: Joi.number().integer().optional(),
            silverStars: Joi.number().allow(null).optional(),
            comments: Joi.string().max(500).allow(''),
        }),
        student_association: Joi.object({
            member: Joi.boolean().default(false),
            association_id: Joi.when('member', {
                is: true,
                then: Joi.string().hex().length(24).required(),
            }),
            function: Joi.when('member', {
                is: true,
                then: Joi.string().max(200).default('member'),
            }),
        }).optional(),
        friends: Joi.array().items(Joi.string().hex().length(24)).default([]),
        geolocalisation: Joi.object({
            latitude: Joi.number(),
            longitude: Joi.number(),
            precision: Joi.number(),
        }).optional(),
    });

    const { body } = req;
    const { error, value } = schema.validate(body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const existingUser = await collection.findOne({ email: value.email });
    if (existingUser) {
        return res
            .status(400)
            .json({ message: 'An user with this email already exists' });
    }

    const hash = await bcrypt.hash(value.password, 10);

    const user = {
        ...value,
        password: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    };

    if (value.student_association && value.student_association.association_id) {
        user.student_association = {
            ...value.student_association,
            association_id: new ObjectId(
                value.student_association.association_id
            ),
        };
    }

    try {
        const result = await collection.insertOne(user);
        const userId = result.insertId;
        if (
            value.student_association &&
            value.student_association.association_id
        ) {
            const associationId = new ObjectId(
                value.student_association.association_id
            );

            await cercleCollection.updateOne(
                { _id: associationId },
                { $addToSet: { members_ids: userId } }
            );
        }
        res.status(201).json(user);
    } catch (err) {
        console.error('Erreur générale :', err);

        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'No or invalid id provided' });
    }

    const existingUser = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
    }

    const schema = Joi.object({
        name: Joi.object({
            first: Joi.string().max(50).required(),
            last: Joi.string().max(50).required(),
        }).required(),
        pseudo: Joi.string().max(50).required(),
        email: Joi.string().email().required(),
        role: Joi.string().default('user'),
        address: Joi.object({
            street: Joi.string().required(),
            nbr: Joi.number().integer().optional(),
            box: Joi.string().optional(),
            postCode: Joi.string().required(),
            city: Joi.string().required(),
            country: Joi.string().optional(),
        }),
        dateOfBirth: Joi.date()
            .max(
                new Date(
                    new Date().setFullYear(new Date().getFullYear() - 16)
                ).toISOString()
            )
            .required(),
        password: Joi.string().min(8).optional(),
        study: Joi.object({
            studyField: Joi.string().max(200),
            year: Joi.number().integer().optional(),
        }),
        phone: Joi.string().max(12).optional(),
        photo: Joi.string().optional(),
        cap: Joi.object({
            hasCap: Joi.boolean().default(false),
            provider: Joi.string().optional(),
            deliveryDate: Joi.date().less('now').optional(),
            goldStars: Joi.number().integer().optional(),
            silverStars: Joi.number().allow(null).optional(),
            comments: Joi.string().max(500).allow(''),
        }).optional(),
        student_association: Joi.object({
            member: Joi.boolean().optional(),
            association_id: Joi.when('member', {
                is: true,
                then: Joi.string().hex().length(24).required(),
            }),
            function: Joi.when('member', {
                is: true,
                then: Joi.string().max(200).default('member'),
            }),
        }).optional(),
        friends: Joi.array().items(Joi.string().hex().length(24)),
        geolocalisation: Joi.object({
            latitude: Joi.number(),
            longitude: Joi.number(),
            precision: Joi.number(),
        }).optional(),
    })
        .min(1)
        .unknown(false);

    const { body } = req;
    const { error, value } = schema.validate(body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    if (value.password) {
        value.password = await bcrypt.hash(value.password, 10);
    }
    if (value.email) {
        const emailExists = await collection.findOne({ email: value.email });
        if (emailExists && String(emailExists._id) !== id) {
            return res.status(400).json({ message: 'Email already in use' });
        }
    }
    if (value.student_association && value.student_association.association_id) {
        value.student_association.association_id = new ObjectId(
            value.student_association.association_id
        );
    }

    if (value.student_association && value.student_association.association_id) {
        const newAssociationId = new ObjectId(
            value.student_association.association_id
        );

        if (
            existingUser.student_association &&
            String(existingUser.student_association.association_id) !==
                String(newAssociationId)
        ) {
            const oldAssociationId = new ObjectId(
                existingUser.student_association.association_id
            );

            await cercleCollection.updateOne(
                { _id: oldAssociationId },
                { $pull: { members_ids: id } }
            );
        }

        await cercleCollection.updateOne(
            { _id: newAssociationId },
            { $addToSet: { members_ids: new ObjectId(id) } }
        );
    }

    try {
        const user = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { ...value, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );
        if (!user.value) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.value);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
    try {
        const result = await collection.insertOne(user);
        const userId = result.ops[0]._id; // Changé de 'insertId' à 'ops[0]._id'

        console.log('UserID:', userId); // Affiche l'ID du nouvel utilisateur

        if (
            value.student_association &&
            value.student_association.association_id
        ) {
            const associationId = new ObjectId(
                value.student_association.association_id
            );
            console.log('AssociationID:', associationId); // Affiche l'ID de l'association

            const updateResult = await cercleCollection.updateOne(
                { _id: associationId },
                { $addToSet: { members_ids: userId } }
            );

            console.log('Update Result:', updateResult); // Affiche le résultat de la mise à jour
        }

        res.status(201).json(user);
    } catch (err) {
        console.error('Erreur générale :', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'No or invalid id provided' });
    }
    const userId = new ObjectId(id);
    try {
        const { force } = req.query;

        if (force === undefined || parseInt(force, 10) === 0) {
            // suppression logique
            const data = await collection.updateOne(
                { _id: userId }, // filter
                {
                    $set: {
                        deletedAt: new Date(),
                    },
                }
            );
            await cercleCollection.updateMany(
                { members_ids: userId },
                { $pull: { members_ids: userId } }
            );
            await eventCollection.updateMany(
                { participants_ids: userId },
                { $pull: { participants_ids: userId } }
            );
            await collection.updateMany(
                { friends: userId },
                { $pull: { friends: userId } }
            );
            return res.status(200).json({ message: 'deleted successfully' });
        }

        if (parseInt(force, 10) === 1) {
            // suppression physique
            await collection.deleteOne({ _id: new ObjectId(id) });
            await cercleCollection.updateMany(
                { members_ids: userId },
                { $pull: { members_ids: userId } }
            );
            await eventCollection.updateMany(
                { participants_ids: userId },
                { $pull: { participants_ids: userId } }
            );
            await collection.updateMany(
                { friends: userId },
                { $pull: { friends: userId } }
            );
            return res.status(204).json();
        }

        res.status(400).json({
            message: 'Malformed parameter "force"',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.userAddFriend = async (req, res) => {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'No or invalid id provided' });
    }
    const schema = Joi.object({
        friendId: Joi.string().hex().length(24).required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const friend = await collection.findOne({
        _id: new ObjectId(value.friendId),
    });
    if (!friend) {
        return res.status(404).json({ message: 'Friend not found' });
    }

    // Vérifiez que l'utilisateur et l'ami ne sont pas la même personne
    if (String(id) === String(value.friendId)) {
        return res
            .status(400)
            .json({ message: "You can't add yourself as a friend." });
    }
    try {
        const updatedUser = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },

            {
                $addToSet: {
                    friends: new ObjectId(value.friendId),
                },
                $set: { updatedAt: new Date() },
            },
            { returnDocument: 'after' }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal server error',
        });
    }
};

exports.userRemoveFriend = async (req, res) => {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'No or invalid id provided' });
    }
    const schema = Joi.object({
        friendId: Joi.string().hex().length(24).required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const updatedUser = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            {
                $pull: { friends: new ObjectId(value.friendId) },
                $set: { updatedAt: new Date() },
            }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal server error',
        });
    }
};
