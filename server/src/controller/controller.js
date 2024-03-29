const urlModel = require('../urlModel/urlModel')
const validUrl = require('valid-url')
const shortid = require('shortid')
const redis = require('redis')
const axios= require('axios')
const dotenv= require('dotenv').config()
const {promisify}  = require('util')


const redisClient = redis.createClient(
    process.env.RedisPort,
    process.env.RedisHostName,
    { no_ready_check: true }
)
redisClient.auth(process.env.RedisPassword, function (err) {
    if (err) throw err
})
redisClient.on("connect", async function () {
    console.log("connected to redis")
})

const SET_ASYNC = promisify(redisClient.SETEX).bind(redisClient)
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient)




exports.createUrl = async function (req, res) {
    try {
        let url = req.body.longUrl
        if (!url) return res.status(400).send({ status: false, msg: "Please enter longUrl" })
        if(typeof(url) !== "string") return res.status(400).send({status: false, msg: "url should be string"})
        url = url.trim()
        if (!validUrl.isUri(url)) return res.status(400).send({ status: false, msg: "Please enter valid url" })
        const checkUrl = await axios.get(url).then(()=> url).catch(()=> null)
        if(checkUrl==null) return res.status(400).send({status: false, msg: "url is not valid"})
        let isUrlExistCache = await GET_ASYNC(`${url}`)
        if (isUrlExistCache) {
            let objectConversion = JSON.parse(isUrlExistCache)
            return res.status(200).send({ status: true, msg: "data received from cache", message: objectConversion })
        }
        let isUrlExist = await urlModel.findOne({ longUrl: url })
        if (isUrlExist) {
            await SET_ASYNC(`${url}`,60*1440, JSON.stringify(isUrlExist))
            return res.status(200).send({ status: true, msg: isUrlExist })
        }
        let obj = { longUrl: url }
        obj.urlCode = shortid.generate()
        let baseUrl = req.protocol+ "://" + req.get("host")  //  https://localhost:3000
        obj.shortUrl = baseUrl+"/"+ obj.urlCode
        const savedData = await urlModel.create(obj)
        await SET_ASYNC(`${url}`,60*1440, JSON.stringify(savedData));
        res.status(201).send({ status: true, message: savedData })
    }

    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}

exports.getUrl = async function (req, res) {
    try {
        let data = req.params.urlCode
        if (!shortid.isValid(data)) return res.status(400).send({ status: false, msg: "Please enter valid url code in param" })
        let cacheUrlData = await GET_ASYNC(`${data}`)
        if (cacheUrlData) {
            let objectConversion = JSON.parse(cacheUrlData)
            return res.status(302).redirect(objectConversion.longUrl)
        }
        let url = await urlModel.findOne({ urlCode: data })
        if (!url) return res.status(404).send({ status: false, msg: "Url not found" })
        await SET_ASYNC(`${data}`,60*1440, JSON.stringify(url))
        res.status(302).redirect(url.longUrl)
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}

