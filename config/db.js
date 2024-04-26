import mongoose from 'mongoose';
import log from 'node-file-logger';

const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.DB_MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Databse Connected Successfully!!');
        log.Info('Databse Connected Successfully!!');
    } catch (error) {
        console.log(error.message);
        log.Error('Could not connect to the database. ', error.message);
        process.exit(1);
    }
}

export default connectDB;
