import mongoose from 'mongoose';

async function connect() {
    try {
        await mongoose.connect('mongodb://localhost:27017/BaosStore', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('Connected to database');
    }
    catch (error) {
        console.log('Error connecting to database');
    }
}

export default { connect };