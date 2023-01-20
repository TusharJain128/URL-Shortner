const urlModel = require('../urlModel/urlModel')
const validUrl = require('valid-url')
const shortid = require('shortid')
const redis = require('redis')
const { promisify } = require('util')



const redisClient = redis.createClient(
    14978,
    "redis-14978.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
)
redisClient.auth("clsXWf6O2FCQBqawC9AOwqoNqKXXRlXK", function (err) {
    if (err) throw err
})
redisClient.on("connect", async function () {
    console.log("connected to redis")
})

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient)
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient)




exports.createUrl = async function (req, res) {
    try {
        let url = req.body.longUrl
        if (!url) return res.status(400).send({ status: false, msg: "Please enter longUrl" })
        url = url.trim()
        if (!validUrl.isUri(url)) return res.status(400).send({ status: false, msg: "Please enter valid url" })
        let isUrlExistCatch = await GET_ASYNC(`${url}`)
        if (isUrlExistCatch) {
            let objectConversion = JSON.parse(isUrlExistCatch)
            return res.status(200).send({ status: true, msg: "data received from catch", data: objectConversion })
        }
        let isUrlExist = await urlModel.findOne({ longUrl: url })
        if (isUrlExist) {
            await SET_ASYNC(`${url}`, JSON.stringify(isUrlExist))
            return res.status(200).send({ status: true, msg: isUrlExist })
        }
        let obj = { longUrl: url }
        obj.urlCode = shortid.generate()
        obj.shortUrl = `https://localhost:3000/${obj.urlCode}`
        const savedData = await urlModel.create(obj)
        await SET_ASYNC(`${url}`, JSON.stringify(savedData));
        res.status(201).send({ status: true, msg: savedData })
    }

    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}

exports.getUrl = async function (req, res) {
    try {
        let data = req.params.urlCode
        if (!shortid.isValid(data)) return res.status(400).send({ status: false, msg: "Please enter valid url code in param" })
        let catchUrlData = await GET_ASYNC(`${data}`)
        let objectConversion = JSON.parse(catchUrlData)
        if (catchUrlData) {
            return res.status(302).send(objectConversion.longUrl)
        }
        let url = await urlModel.findOne({ urlCode: data })
        if (!url) return res.status(404).send({ status: false, msg: "Url not found" })
        await SET_ASYNC(`${data}`, JSON.stringify(url))
        res.status(302).send(url.longUrl)
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}

