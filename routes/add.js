var router = require('express').Router();

// mongoDB 연동
let mydb;
const mongoClent = require('mongodb').MongoClient;
const url = process.env.DB_URL;

mongoClent.connect(url).then(client=>{
    console.log('몽고DB 접속');
    mydb = client.db('myboard');
})

router.get('/enter',function(req, res){
    res.render('enter.ejs');
});

module.exports = router;