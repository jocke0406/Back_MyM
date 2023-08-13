module.exports = {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: [
                'name',
                'startAt',
                'endAt',
                'lieu_id',
                'participants_ids',
                'organizer',
            ],
            properties: {
                name: {
                    bsonType: 'string',
                    description: 'Name is required and must be a string.',
                },
                startAt: {
                    bsonType: 'date',
                    description: 'startAt is required must be a date.',
                },
                endAt: {
                    bsonType: 'date',
                    description: 'endAt is required must be a date.',
                },
                description: {
                    bsonType: 'string',
                    description:
                        'Description is required and must be a string.',
                },
                lieu_id: {
                    bsonType: 'objectId',
                    description: 'lieu_id is required and must be an objectId.',
                },
                participants_ids: {
                    bsonType: 'array',
                    minItems: 0,
                    description:
                        'participants_ids must be an array of objectIds.',
                    items: {
                        bsonType: 'objectId',
                        description: 'Elements of the array must be objectIds.',
                    },
                },
                organizer: {
                    bsonType: 'objectId',
                    description:
                        'organizer is required and must be an objectId.',
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
