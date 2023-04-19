const express= require('express')
const route= require('./routes/route')
const mongoose= require('mongoose')
const dotenv = require('dotenv')

const app= express()
dotenv.config()
app.use(express.json())

mongoose.set('strictQuery', true)
mongoose.connect(process.env.MY_DB_URL)
.then(()=> console.log("DB is connected now"))
.catch(err => console.log(err))

app.use('/',route)

app.listen(process.env.PORT, function(req,res){
    console.log(`server is running on ${process.env.PORT} port`)
})