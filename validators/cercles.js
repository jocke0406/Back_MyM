module.exports = {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'address', 'members_ids'],
            properties: {
                name: {
                    bsonType: 'string',
                    description: 'Name is required and must be a string.',
                },
                hymne: {
                    bsonType: 'string',
                    description: 'Hymne must be a string.',
                },
                address: {
                    bsonType: 'objectId',
                    description: 'Address is required and must be an objectId.',
                },
                description: {
                    bsonType: 'string',
                    description: 'Description must be a string.',
                },
                members_ids: {
                    bsonType: 'array',
                    minItems: 0,
                    description: 'members_ids must be an array of objectIds.',
                    items: {
                        bsonType: 'objectId',
                        description: 'Elements of the array must be objectIds.',
                    },
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
