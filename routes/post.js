var router = require('express').Router();

// mongoDB 연동
let mydb;
const mongoClent = require('mongodb').MongoClient;
const url = process.env.DB_URL;

mongoClent.connect(url).then(client=>{
    console.log('몽고DB 접속');
    mydb = client.db('myboard');
})

const ObjId = require('mongodb').ObjectId;

router.get('/list',function(req, res){
    mydb.collection('post').find().toArray().then((result)=>{
        res.render('list.ejs', {data : result});
    })
});

router.post('/delete',function(req, res){
    console.log(req.body._id);
    req.body._id = new ObjId(req.body._id); // 문자열 아이디를 객체로 변환
    console.log(req.body._id);

    mydb.collection('post').deleteOne(req.body)
    .then((result)=>{
        console.log('삭제완료');
        res.status(200).send();
    })
    .catch(err=>{
        console.log(err);
        res.status(500).send();
    })
});


router.get('/content/:id', function(req, res){
    console.log(req.params.id);

    const id = new ObjId(req.params.id);
    mydb.collection('post').findOne({_id : id})
    .then((result)=>{
        console.log(result);
        res.render('content.ejs', {data:result});
    })
});

router.get('/edit/:id',function(req, res){
    const id = new ObjId(req.params.id);
    mydb.collection('post').findOne({_id : id})
    .then((result)=>{
        console.log(result);
        res.render('edit.ejs', {data:result});
    })
});

router.post('/edit',function(req, res){

    console.log(req.body);
    console.log(req.body.id);
    const id = new ObjId(req.body.id);

    // 몽고DB에 데이터 저장
    mydb.collection('post').updateOne(
        {_id : id},
        {$set : {title : req.body.title, content : req.body.content, date : req.body.someDate}}
    ).then((result)=>{
        console.log(result);
        console.log('수정완료');
        res.redirect('/list');
    })
    .catch((err)=>{
        console.log(err);
    })
});

module.exports = router;