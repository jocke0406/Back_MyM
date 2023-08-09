module.exports = {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'address', 'eventsId'],
            properties: {
                name: {
                    bsonType: 'string',
                    description: 'Name is required and must be a string.',
                },
                address: {
                    bsonType: 'object',
                    properties: {
                        street: {
                            bsonType: 'string',
                            description:
                                'Street is required and must be a string.',
                        },
                        nbr: {
                            bsonType: 'int',
                            description: 'Number must be an integer.',
                        },
                        postCode: {
                            bsonType: 'string',
                            description:
                                'Postal code is required and must be a string.',
                        },
                        city: {
                            bsonType: 'string',
                            description:
                                'City is required and must be a string.',
                        },
                        district: {
                            bsonType: 'string',
                            description: 'District must be a string.',
                        },
                        country: {
                            bsonType: 'string',
                            description: 'Country must be a string.',
                        },
                    },
                },
                geolocalisation: {
                    bsonType: 'object',
                    properties: {
                        latitude: {
                            bsonType: ['double', 'int'],
                            description: 'Latitude must be a number.',
                        },
                        longitude: {
                            bsonType: ['double', 'int'],
                            description: 'Longitude must be a number.',
                        },
                        precision: {
                            bsonType: 'int',
                            description: 'Precision must be an integer.',
                        },
                    },
                },
                eventsId: {
                    bsonType: 'array',
                    minItems: 0,
                    items: {
                        bsonType: 'objectId',
                        description: 'Elements of the array must be objectIds.',
                    },
                    description: 'eventsId must be an array of objectIds.',
                },
                createdAt: {
                    bsonType: 'date',
                    description: 'createdAt must be a date.',
                },
                updatedAt: {
                    bsonType: 'date',
                    description: 'updatedAt must be a date.',
                },
                deletedAt: {
                    bsonType: ['date', 'null'],
                    description: 'deletedAt must be a date.',
                },
            },
        },
    },
};
