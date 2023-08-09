const { MongoClient } = require('mongodb');

const url = `mongodb://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_HOST}:${process.env.MONGO_DB_PORT}`;
const client = new MongoClient(url);

(async () => {
    try {
        await client.connect();
        console.log(`Connected to MongoDB on ${url}`);
    } catch (e) {
        console.error(`Failed to connect to MongoDB: ${e}`);
        process.exit(1);
    }
})();

module.exports = client;
