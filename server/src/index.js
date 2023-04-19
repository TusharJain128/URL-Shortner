const express= require('express')
const route= require('./routes/route')
const mongoose= require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

const app= express()
dotenv.config()
app.use(express.json())
app.use(cors())

mongoose.set('strictQuery', true)
mongoose.connect(process.env.MY_DB_URL)
.then(()=> console.log("DB is connected now"))
.catch(err => console.log(err))

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  });
  
app.use('/',route)

app.listen(process.env.PORT, function(req,res){
    console.log(`server is running on ${process.env.PORT} port`)
})