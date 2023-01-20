const express= require('express')
const route= require('./routes/route')
const mongoose= require('mongoose')

const app= express()

app.use(express.json())

mongoose.set('strictQuery', true)
mongoose.connect("mongodb+srv://TusharJainFunctionup:functionup@tusharjaindb.zxey2fj.mongodb.net/test")
.then(()=> console.log("DB is connected now"))
.catch(err => console.log(err))

app.use('/',route)

app.listen(3000, function(req,res){
    console.log("server is running on 3000 port")
})