// require("dotenv").config({path: "./env"})

import dotenv from "dotenv"
dotenv.config({path: "./env"})
import connectdb from "./db/index.js";
import app from "./app.js";

connectdb()
.then(()=>{
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`app running on http://localhost:${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.Console.log("mongodb connection failed", err);
})





// const app = express();
// ;( async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${db_name}`)
//         app.on("error", ()=>
//         {
//             console.log(error)
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`App running on port ${process.env.PORT}`)
//         })
//     } 
//     catch (error) {
//         console.log(error)
//         throw error
//     }
// })()