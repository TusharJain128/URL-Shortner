const express= require('express')
const router= express.Router()
const controller= require('../controller/controller')

router.get('/test', function(req,res){
    res.send('I am running now')
})

router.post('/url/shorten',controller.createUrl)

// GET API IS NOT WORKING IN POSTMAN, IT WORKS ONLY IN BROWSER,
// IF YOU WANT TO RUN GET API IN POSTMAN THEN CHANGE RES.REDIRECT TO RES.SEND IN CONTROLLER
router.get('/:urlCode',controller.getUrl)

module.exports = router