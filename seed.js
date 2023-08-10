require('dotenv').config();
const dbClient = require('./utils/db-client.util');
const validators = require('./validators');

const seed = async () => {
    const db = await dbClient.db(process.env.MONGO_DB_DATABASE);

    const collections = ['users', 'locations', 'cercles', 'events'];

    const existingCollectionsCursor = await db.listCollections();
    const existingCollections = await existingCollectionsCursor.toArray();
    const names = existingCollections.map((c) => c.name);

    collections.forEach(async (c) => {
        try {
            if (names.includes(c)) {
                await db.dropCollection(c);
            }
            await db.createCollection(c, validators[c] ?? null);
        } catch (e) {
            console.error(c, e);
        }
    });
    const hash = await require('bcrypt').hash('1234', 10);

    const userDto = [
        {
            name: {
                first: 'Bound',
                last: 'Js',
            },
            pseudo: '007',
            email: 'james007@gmail.com',
            address: {
                street: 'Royal Mint Court',
                nbr: 11,
                postCode: 'EC3N 4HP',
                city: 'London',
                country: 'United Kingdom',
            },
            dateOfBirth: new Date('2000-06-01T12:00:00Z'),
            password: hash,
            role: 'master',
            study: {
                studyField: 'spying',
                year: 3,
            },
            phone: '0123456789',
            photo: './images/',
            cap: {
                hasCap: false,
            },
            student_association: {
                // reference cercles
                member: true,
            },
            friends: [], //reference users
            geolocalisation: {
                latitude: 48.846114,
                longitude: 2.344443,
                precision: 50,
            },

            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
    const createdUser = await Promise.all(
        userDto.map((u) => db.collection('users').insertOne(u))
    );
    //console.log(createdUser[0].insertedId);
    const locationDto = [
        {
            name: 'la casa de Julien',
            address: {
                street: 'Pl. Galilée',
                nbr: 3,
                postCode: '1348',
                city: 'Louvain-La-Neuve',
                district: 'Les Bruyères',
                country: 'Belgium',
            },
            geolocalisation: {
                latitude: 48.8555,
                longitude: 2.2974,
                precision: 10,
            },
            eventsId: [
                //references events
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
    const createdLocation = await Promise.all(
        locationDto.map((u) => db.collection('locations').insertOne(u))
    );
    // console.log(createdLocation[0].insertedId);

    const cercleDto = [
        {
            name: 'La Mouscronnoise',
            hymne: "Bé! Qu'in est fir d'êt Mouscronnos\nPus hiards que nous aut's, y nda pos!\nIn peut faire t'tour de la terre.\nCh'est bin Mouscron qu'tertous préfere!\nNous ville in v'vot si volintis\nQu'int n'tchangrot pos, même pour Paris\nY'a pos in est heureux comme des pichons dins l'eau.\nBé! Qu'n est fir d'êt Mouscronnos' Oh! Oh! Oh!",
            address: createdLocation[0].insertedId, // reference location
            description:
                'Le cercle des étudiants Mouscronnois de Louvain-La-Neuve',
            members_ids: [createdUser[0].insertedId],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
    const createdCercle = await Promise.all(
        cercleDto.map((u) => db.collection('cercles').insertOne(u))
    );
    // console.log(createdLocation[0].insertedId);

    const eventDto = [
        {
            name: 'Picnic dans le parc',
            startAt: new Date('2024-06-01T12:00:00Z'),
            endAt: new Date('2024-06-01T14:00:00Z'),
            description: 'Venez partager un moment convivial en plein air !',
            lieu_id: createdLocation[0].insertedId, // ref location
            participants_ids: [
                // ref participants
                createdUser[0].insertedId,
            ],

            organizer: createdCercle[0].insertedId, // ref cercles
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
    const createdEvent = await Promise.all(
        eventDto.map((u) => db.collection('events').insertOne(u))
    );
    const usersDtos = [
        {
            name: {
                first: 'Moneypenny',
                last: 'Eve',
            },
            pseudo: '001',
            email: 'eve.moneypenny@gmail.com',
            address: {
                street: 'The War Office',
                nbr: 6,
                postCode: 'SW1A 2HB',
                city: 'London',
                country: 'United Kingdom',
            },
            dateOfBirth: new Date('1972-07-05T12:00:00Z'),
            password: hash,
            role: 'commonUser',
            study: {
                studyField: 'espionage',
                year: 4,
            },
            phone: '9876543210',
            photo: './images/',
            cap: {
                hasCap: true,
                provider: 'BOB',
                deliveryDate: new Date('1999-06-01T12:00:00Z'),
                goldStars: 2,
                silverStars: 2,
                comments: 'Cap with built-in laser beam!',
            },
            student_association: {
                // reference cercles
                member: true,
                association_id: createdCercle[0].insertedId,
                function: 'Secretary',
            },
            friends: [createdUser[0].insertedId], // reference users
            geolocalisation: {
                latitude: 51.5074,
                longitude: -0.1278,
                precision: 50,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: {
                first: 'Gaston',
                last: 'Lagaffe',
            },
            pseudo: 'Gaston',
            email: 'gaston.lagaffe@gmail.com',
            address: {
                street: 'Rue de la Mare aux Joncs',
                nbr: 1,
                postCode: '1000',
                city: 'Bruxelles',
                country: 'Belgique',
            },
            dateOfBirth: new Date('1957-02-28T12:00:00Z'),
            password: hash,
            role: 'commonUser',
            study: {
                studyField: 'inventeur fou',
                year: 7,
            },
            phone: '0498765432',
            photo: './images/',
            cap: {
                hasCap: true,
                provider: 'BOB',
                deliveryDate: new Date('2022-02-28T12:00:00Z'),
                goldStars: 2,
                silverStars: 0,
                comments: 'Super dynamique',
            },
            student_association: {
                // reference cercles
                member: true,
                association_id: createdCercle[0].insertedId,
                function: 'member',
            },
            friends: [createdUser[0].insertedId], // reference users
            geolocalisation: {
                latitude: 50.8503,
                longitude: 4.3517,
                precision: 50,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
    const createdUsers = await Promise.all(
        usersDtos.map((u) => db.collection('users').insertOne(u))
    );
    await db
        .collection('locations')
        .updateOne(
            { _id: createdLocation[0].insertedId },
            { $set: { eventsId: [createdEvent[0].insertedId] } }
        );
    await db
        .collection('users')
        .updateOne(
            { _id: createdUser[0].insertedId },
            { $set: { friends: [createdUsers[0].insertedId] } }
        );

    const cerclesDtos = [
        {
            name: "Cercle des Etudiants de l'Ecole Polytechnique de Bruxelles",
            hymne: '',
            address: createdLocation[0].insertedId, // reference location
            description:
                "Le cercle des étudiants de l'Ecole Polytechnique de Bruxelles",
            members_ids: [
                createdUsers[1].insertedId,
                createdUsers[0].insertedId,
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "Cercle des Etudiants de l'Ecole Polytechnique de Bruxelles",
            hymne: '',
            address: createdLocation[0].insertedId, // reference location
            description:
                "Le cercle des étudiants de l'Ecole Polytechnique de Bruxelles",
            members_ids: [
                createdUser[0].insertedId,
                createdUsers[1].insertedId,
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    const createdCercles = await Promise.all(
        cerclesDtos.map((u) => db.collection('cercles').insertOne(u))
    );
    const locationsDtos = [
        {
            name: 'Le Grimoire',
            address: {
                street: 'Rue de la Gare',
                nbr: 21,
                postCode: '1348',
                city: 'Louvain-La-Neuve',
                district: 'Lauzelle',
                country: 'Belgium',
            },
            geolocalisation: {
                latitude: 50.6667,
                longitude: 4.6167,
                precision: 10,
            },
            eventsId: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: 'Le Bateau Ivre',
            address: {
                street: 'Rue du Sablon',
                nbr: 32,
                postCode: '1000',
                city: 'Brussels',
                district: 'Marolles',
                country: 'Belgium',
            },
            geolocalisation: {
                latitude: 50.8429,
                longitude: 4.3523,
                precision: 10,
            },
            eventsId: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
    const createdLocations = await Promise.all(
        locationsDtos.map((u) => db.collection('locations').insertOne(u))
    );
    await db
        .collection('cercles')
        .updateOne(
            { _id: createdCercles[0].insertedId },
            { $set: { address: createdLocations[0].insertedId } }
        );
    await db
        .collection('cercles')
        .updateOne(
            { _id: createdCercles[1].insertedId },
            { $set: { address: createdLocations[1].insertedId } }
        );
    await db.collection('users').updateOne(
        { _id: createdUser[0].insertedId },
        {
            $set: {
                'student_association.association_id':
                    createdCercles[0].insertedId,
            },
        }
    );
    const eventsDtos = [
        {
            name: 'Ciné en plein air',
            startAt: new Date('2024-07-15T20:00:00Z'),
            endAt: new Date('2024-07-15T23:00:00Z'),
            description:
                "Venez profiter d'une soirée cinéma à la belle étoile !",
            lieu_id: createdLocations[0].insertedId, // ref location
            participants_ids: [
                // ref participants
                createdUsers[0].insertedId,
                createdUsers[1].insertedId,
                createdUser[0].insertedId,
            ],
            organizer: createdCercles[0].insertedId,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: 'Barbecue dans le parc',
            startAt: new Date('2024-08-21T12:00:00Z'),
            endAt: new Date('2024-08-21T16:00:00Z'),
            description:
                "Venez passer un moment convivial autour d'un barbecue en plein air !",
            lieu_id: createdLocations[1].insertedId, // ref location
            participants_ids: [
                // ref participants
                createdUsers[1].insertedId,
                createdUsers[0].insertedId,
            ],
            organizer: createdCercles[1].insertedId,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
    const createdEvents = await Promise.all(
        eventsDtos.map((u) => db.collection('events').insertOne(u))
    );
    await db
        .collection('locations')
        .updateOne(
            { _id: createdLocations[0].insertedId },
            { $set: { eventsId: [createdEvents[0].insertedId] } }
        );
    await db
        .collection('locations')
        .updateOne(
            { _id: createdLocations[1].insertedId },
            { $set: { eventsId: [createdEvents[1].insertedId] } }
        );
};

seed();
