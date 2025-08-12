"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongosee = require('mongoose');
const MongoDB_URL = "mongodb://root:example@mongo:27017/";
const connectDB = async () => {
    try {
        await mongosee.connect(MongoDB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};
//# sourceMappingURL=bd.js.map