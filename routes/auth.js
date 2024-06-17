var router = require('express').Router();

// mongoDB 연동
let mydb;
const mongoClent = require('mongodb').MongoClient;
const url = process.env.DB_URL;

mongoClent.connect(url).then(client=>{
    console.log('몽고DB 접속');
    mydb = client.db('myboard');
})


// 세션 라이브러리 추가
const session = require('express-session');
router.use(session({
    secret : '성적.. 망했다.',
    resave : false, // 접속할때마다 새로운 세션을 발급받지 않음
    saveUninitialized : true // 세션을 사용하기 전 까지 세션을 발급하지 않음
}));

const sha = require('sha256');

router.get('/login', function(req, res){
    console.log(req.session);
    if(req.session.user){
        console.log('세션유지');
        res.render('index.ejs', {user : req.session.user});
    }else{
        res.render("login.ejs");
    }  
})

router.post('/login', function(req, res){
    console.log(req.body.userid);
    console.log(req.body.userpw);

    mydb.collection("account").findOne({userid : req.body.userid})
    .then((result)=>{
        console.log(result);
        if(result){
            if(result.userpw == sha(req.body.userpw)){
                req.session.user = req.body;
                console.log('새로운 로그인');
                res.render('index.ejs', {user : req.session.user});
            }else{
                res.render('login.ejs');
            }
        } 
        else {
            console.log('존재하지 않는 사용자입니다.');
            res.render('login.ejs', { error: '존재하지 않는 사용자입니다.' });
        }
        
    })
})

router.get('/logout', function(req, res){
    console.log('로그아웃');
    req.session.destroy();
    res.render("index.ejs", {user : null});
})

router.get('/signup', function(req, res){
    console.log('회원가입');
    res.render('signup.ejs');
})

router.post('/signup', function(req, res){
    console.log(req.body.userid);
    console.log(sha(req.body.userpw));
    console.log(req.body.usergroup);
    console.log(req.body.useremail);

    mydb.collection('account').insertOne(
        {
            userid : req.body.userid,
            userpw : sha(req.body.userpw),
            usergroup : req.body.usergroup,
            useremail : req.body.useremail
        }
    ).then((result)=>{
        console.log('회원가입 성공');
        res.redirect('/');
    })
})
module.exports = router;