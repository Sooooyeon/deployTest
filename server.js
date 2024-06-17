const express = require('express');
const app = express(); // 서버 객체를 받음

const dotenv = require('dotenv').config();

// multer 라이브러리 추가
let multer = require('multer');
// 설정
let storage = multer.diskStorage({
    destination : function(req, file, done){
        done(null, './public/image')
    },
    filename : function(req, file, done){
        done(null, file.originalname);
    }
})
// multer등록
let upload = multer({storage : storage})


// body-parser 라이브러리 추가
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

// cookie-parser 라이브러리 추가
const cookieParser = require('cookie-parser');
app.use(cookieParser('afeafaghaga')); //

// 세션 라이브러리 추가
const session = require('express-session');
app.use(session({
    secret : '성적.. 망했다.',
    resave : false, // 접속할때마다 새로운 세션을 발급받지 않음
    saveUninitialized : true // 세션을 사용하기 전 까지 세션을 발급하지 않음
}));

const sha = require('sha256');

app.set('view engine','ejs');

// 정적 파일 라이브러리 추가 (경로 지정시 public이 루트)
// app.use(express.static("public"));
app.use("/public", express.static("public"));


app.use('/', require('./routes/post.js'));
app.use('/', require('./routes/auth.js'));
app.use('/', require('./routes/add.js'));


// mongoDB 연동
let mydb;
const mongoClent = require('mongodb').MongoClient;
const url = process.env.DB_URL;
mongoClent.connect(url).then(client=>{
    console.log('몽고DB 접속');
    mydb = client.db('myboard');
    // mydb.collection('post').find().toArray().then((result)=>{
    //     console.log(result);
    // })
    // 8080으로 접근하면 실행
    app.listen(process.env.PORT, function(){
        // 포트번호, 콜백함수
        console.log('포트 8080으로 서버 대기...')
    });
})

const ObjId = require('mongodb').ObjectId;



app.get('/cookie',function(req,res){
    // cookies, signedCookies(암호화)
    let milk = parseInt(req.signedCookies.milk) + 1000;
    if(isNaN(milk)){
        milk = 0;
    }
    // signed true 옵션 - 암호화된 상태로 저장
    res.cookie('milk',milk,{signed:true}); // cookie(키, 값) 키, 값 형태로 저장
    // res.send('product : ' + milk + "원");

    // res.clearCookie() // 쿠키삭제
})


app.get('/session',function(req,res){
    if(isNaN(req.session.milk)){
        req.session.milk = 0;
    }
    req.session.milk = req.session.milk + 1000;
    res.send('product : ' + req.session.milk + "원");

})

// 여기를 루트로 시작
app.get('/',function(req, res){
    if(req.session.user){
        res.render('index.ejs', {user : req.session.user});
    } 
    else {
        res.render('index.ejs', {user : null});
    }
});


let imagepath = '';

app.post('/photo', upload.single('picture'), function(req,res){
    console.log(req.file.path);
    imagepath = '\\' + req.file.path;
})

app.post('/save',function(req, res){
    console.log(req.body);
    console.log(req.body.title);
    console.log(req.body.content);
    console.log(req.body.someDate);

    // MySQL에 저장
    // let sql = "insert into post (title, content, created) \
    //     values (?,?, now())";
    
    // let params = [req.body.title, req.body.content];
    // conn.query(sql, params, function(err, result){
    //     if(err) throw err;
    //     console.log('데이터 저장완료');
    // })
    

    // 몽고DB에 데이터 저장
    mydb.collection('post').insertOne(
        {
            title : req.body.title,
            content : req.body.content,
            date : req.body.someDate,
            path : imagepath
        }
    ).then((result)=>{
        console.log(result);
        console.log('데이터 저장완료');
        res.redirect('/list');
    })


});


app.get('/search',function(req, res){
    console.log(req.query);
    mydb.collection('post')
    .find({title : req.query.value}).toArray()
    .then((result) => {
        console.log(result);
        res.render('sresult.ejs',{data: result});
    })
})