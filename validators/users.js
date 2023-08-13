module.exports = {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['pseudo', 'email', 'dateOfBirth', 'password'],
            properties: {
                name: {
                    bsonType: 'object',
                    properties: {
                        first: {
                            bsonType: 'string',
                            maxLength: 50,
                        },
                        last: {
                            bsonType: 'string',
                            maxLength: 50,
                        },
                    },
                },
                pseudo: {
                    bsonType: 'string',
                    maxLength: 50,
                },
                email: {
                    bsonType: 'string',
                    pattern:
                        '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                },
                role: {
                    bsonType: 'string',
                },
                address: {
                    bsonType: 'object',
                    properties: {
                        street: {
                            bsonType: 'string',
                        },
                        nbr: {
                            bsonType: 'int',
                        },
                        box: {
                            bsonType: 'int',
                        },
                        postCode: {
                            bsonType: 'string',
                        },
                        city: {
                            bsonType: 'string',
                        },
                        country: {
                            bsonType: 'string',
                        },
                    },
                },
                dateOfBirth: {
                    bsonType: 'date',
                },
                password: {
                    bsonType: 'string',
                    minLength: 8,
                },

                study: {
                    bsonType: 'object',
                    properties: {
                        studyField: {
                            bsonType: 'string',
                            maxLength: 200,
                        },
                        year: {
                            bsonType: 'int',
                        },
                    },
                },
                phone: {
                    bsonType: 'string',
                    maxLength: 12,
                },
                photo: {
                    bsonType: 'string',
                },
                cap: {
                    bsonType: 'object',
                    properties: {
                        hasCap: {
                            bsonType: 'bool',
                        },
                        provider: {
                            bsonType: 'string',
                        },
                        deliveryDate: {
                            bsonType: 'date',
                            maximum: new Date().getTime(),
                        },
                        goldStars: {
                            bsonType: ['int', 'null'],
                        },
                        silverStars: {
                            bsonType: ['int', 'null'],
                        },
                        comments: {
                            bsonType: 'string',
                            maxLength: 500,
                        },
                    },
                },
                friends: {
                    bsonType: 'array',
                    items: {
                        bsonType: 'objectId',
                        description: 'reference to users',
                    },
                },
                student_association: {
                    bsonType: 'object',
                    properties: {
                        member: {
                            bsonType: 'bool',
                        },
                        association_id: {
                            bsonType: 'objectId',
                            description: 'reference to cercles',
                        },
                        function: {
                            bsonType: 'string',
                            maxLength: 200,
                        },
                    },
                },
                geolocalisation: {
                    bsonType: 'object',
                    properties: {
                        latitude: {
                            bsonType: 'double',
                        },
                        longitude: {
                            bsonType: 'double',
                        },
                        precision: {
                            bsonType: 'int',
                        },
                    },
                },
                createdAt: {
                    bsonType: 'date',
                    description: 'Creation date',
                },
                updatedAt: {
                    bsonType: 'date',
                    description: 'Last update date',
                },
                deletedAt: {
                    bsonType: ['date', 'null'],
                    description: 'Deletion date',
                },
            },
        },
    },
};
