import mongoose from 'mongoose';
import colors from 'colors';

const connectDB = async() =>{

    try{
        const conn = await mongoose.connect(process.env.URL_DB_CONNECTION,{
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true
        })
        
        console.log(`MongoDB is connected:${conn.connection.host}`.yellow)
    }catch(error){
        console.log(`Error to conect to MongoDB: ${error.message}`.red.bold)
        process.exit(1)
    }
}

export default connectDB