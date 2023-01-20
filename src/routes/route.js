const express= require('express')
const router= express.Router()
const controller= require('../controller/controller')

router.get('/test', function(req,res){
    res.send('I am running now')
})

router.post('/url/shorten',controller.createUrl)

// GET API IS NOT WORKING IN POSTMAN, IT WORKS ONLY IN BROWSER
router.get('/:urlCode',controller.getUrl)

module.exports = router