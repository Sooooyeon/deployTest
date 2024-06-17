// MySQL + Node.js 접속
// let mysql = require('mysql');
// let conn = mysql.createConnection({
//     host : 'localhost',
//     user : 'root',
//     password : '123456',
//     database : 'myboard'
// });

// conn.connect();




const express = require('express');
const app = express(); // 서버 객체를 받음

const passport = require("passport");
const localStrategy = require('passport-local').Strategy;




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

// passport에서 session을 사용할것이기 때문에 세션 요청 이후 초기화 진행할 것
app.use(passport.initialize());
app.use(passport.session());

const sha = require('sha256');


app.set('view engine','ejs');

// 정적 파일 라이브러리 추가 (경로 지정시 public이 루트)
app.use(express.static("public"));




// mongoDB 연동
let mydb;
const mongoClent = require('mongodb').MongoClient;
const url = 'mongodb+srv://tn56dus:VgHDnJ2gU1hnctFD@cluster0.shgya4b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoClent.connect(url).then(client=>{
    console.log('몽고DB 접속');
    mydb = client.db('myboard');
    // mydb.collection('post').find().toArray().then((result)=>{
    //     console.log(result);
    // })
    // 8080으로 접근하면 실행
    app.listen(8080, function(){
        // 포트번호, 콜백함수
        console.log('포트 8080으로 서버 대기...')
    });
})

const ObjId = require('mongodb').ObjectId;

// 8080으로 접근하면 실행
// app.listen(8080, function(){
//     // 포트번호, 콜백함수
//     console.log('포트 8080으로 서버 대기...')
// });


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
    if(req.session.passport){
        res.render('index.ejs', {user : req.session.passport});
    } 
    else {
        res.render('index.ejs', {user : null});
    }
});

app.get('/enter',function(req, res){
    // res.sendFile(__dirname + '/enter.html');
    res.render('enter.ejs');
});

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
        {title : req.body.title, content : req.body.content, date : req.body.someDate}
    ).then((result)=>{
        console.log(result);
        console.log('데이터 저장완료');
        res.redirect('/list');
    })


});

app.get('/list',function(req, res){
    // mysql
    // conn.query("select * from post", function(err, rows, field){
    //     if(err) throw err;
    //     console.log(rows);
    // });

    
    // MongoDB
    mydb.collection('post').find().toArray().then((result)=>{
        //console.log(result);
        res.render('list.ejs', {data : result});
    })


    // res.sendFile(__dirname + '/list.html');
    
});

app.post('/delete',function(req, res){
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


app.get('/content/:id', function(req, res){
    console.log(req.params.id);

    const id = new ObjId(req.params.id);
    mydb.collection('post').findOne({_id : id})
    .then((result)=>{
        console.log(result);
        res.render('content.ejs', {data:result});
    })
});

app.get('/edit/:id',function(req, res){
    const id = new ObjId(req.params.id);
    mydb.collection('post').findOne({_id : id})
    .then((result)=>{
        console.log(result);
        res.render('edit.ejs', {data:result});
    })
});

app.post('/edit',function(req, res){

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


app.get('/login', function(req, res){
    console.log(req.session);
    if(req.session.user){
        console.log('세션유지');
        res.render('index.ejs', {user : req.session.user});
    }else{
        res.render("login.ejs");
    }  
})


// 아래에서 연결 성공하면 여기로 id가 들어옴 (처음에 한번만)
passport.serializeUser(function(user, done){
    console.log("serializeUser");
    console.log(user.userid);
    done(null, user.userid);
});
// done(서버 에러 객체, 결과 데이터, 에러 메시지)


// 연결되면 다음부터는 deserializeUser에서 실행
passport.deserializeUser(function(puserid, done){
    console.log('deserializeUser');
    console.log(puserid);

    mydb
    .collection('account')
    .findOne({userid: puserid})
    .then((result)=>{
        console.log(result);
        done(null, result);
    })
});

// 로그인시 passport를 통해 인증 절차를 걸침
app.post('/login', passport.authenticate("local", {
        succeessRedirect:"/",
        failureRedirect:"/fail",
    }),
    function(req, res){
        //serialize의 done 함수에서 성공 응답을 받았을 경우 실행
        console.log("session" + req.session);      
        console.log(req.session.passport);
        res.render('index.ejs', {user : req.session.passport});
    }
);



// 위의 코드에서 인증해야할 정보
passport.use(
    new localStrategy(
        {
            usernameField: 'userid',
            passwordField: 'userpw',
            session: true,
            passReqToCallback: false,
        },
        function(inputid, inputpw, done){
            mydb.collection("account").findOne({userid : inputid})
            .then((result)=>{
                console.log(result);
                if(result){
                    if(result.userpw == sha(inputpw)){
                        console.log('새로운 로그인');
                        done(null,result);
                        // done은 serialize함수를 호출
                    }else{
                        done(null, false, {message : "비밀번호가 틀렸습니다."});
                    }
                } 
                // else {
                //     console.log('존재하지 않는 사용자입니다.');
                //     res.render('login.ejs', { error: '존재하지 않는 사용자입니다.' });
                // }
                
            })
        }
    )
)


    

app.get('/logout', function(req, res){
    console.log('로그아웃');
    req.session.destroy();
    res.render("index.ejs", {user : null});
})

app.get('/signup', function(req, res){
    console.log('회원가입');
    res.render('signup.ejs');
})

app.post('/signup', function(req, res){
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