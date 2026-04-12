import mongoose from "mongoose";
import { db_name } from "../constants.js";

import dns from "node:dns";
dns.setServers(["8.8.8.8","1.1.1.1"]);

const connectdb = async () =>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${db_name}`)
        console.log(`MongoDB connected successfully !! ${connectionInstance.connection.host}`);
    }
    catch(err){
        console.log(err);
        process.exit(1);
    }
}

export default connectdb;