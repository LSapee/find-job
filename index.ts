import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {MyList} from "./types/myList";
const app = express();
const {findAlljob,findAllkeyWords} = require("./Repository/findjob.Repository")
const {createUser} = require("./Repository/user.Repository");
const {crawlingScheduler} = require("./utils/scheduler")
const {getToken,verifyToken,getName} = require("./auth/auth");
const port = 3000;

const corsOptions = {
    origin: 'https://findjob.lsapee.com', // 허용할 오리진 명시
    credentials: true, // 자격 증명(쿠키 등) 허용
    optionsSuccessStatus: 200 // 일부 브라우저에서 요구하는 응답 상태
};
app.use(cors(corsOptions));
//json 데이터 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 자동 크롤링
crawlingScheduler();
//로그인시
app.get("/api/auth",async (req:Request,res:Response)=>{
    const {code:code}= req.query;
    const tokens  = await getToken(code);
    let useris:string|null ="";
    if(tokens!==null){
        useris = await createUser(tokens.id_token);
        res.cookie("access_token",tokens.access_token,{
            httpOnly:true,
            domain: '.lsapee.com',
            secure: true,
            sameSite: 'none'
        });
        res.cookie("access","true",{
            domain: '.lsapee.com',
            secure: true,
            sameSite: 'none'
        });
    }
    console.log(useris)
    res.redirect("https://findjob.lsapee.com",);
});
//로그아웃시
app.get("/api/logout",async (req:Request,res:Response)=>{
    res.clearCookie("access_token");
    res.clearCookie("access",{
        domain: '.lsapee.com',
    });
   res.redirect("https://findjob.lsapee.com");
});
// DB 조회
app.get("/api/getjob",cookieParser(), async (req:Request,res:Response)=>{
    const {search:keyword,expAll:expAll,exp:myExp,startNum:startNum} = req.query;
    // 추가 조회할 정보 데이터 시작번호
    let stnum:number =0;
    if(typeof(startNum)==="string")  stnum = parseInt(startNum);
    const myList:MyList|boolean = await findAlljob(keyword,expAll,myExp,stnum);
    const accessToken =req.cookies["access_token"];
    res.send(myList);
})
//등록된 키워드 데이터 가져오기
app.get("/api/getKeywords",async (req:Request,res:Response)=>{
    const keywords = await findAllkeyWords();
    res.send(keywords);
})

//메인 페이지
app.get("/",(req:Request,res:Response)=>{
    res.sendFile(__dirname+"/src/index.html")
})

app.listen(port,()=>{
    console.log(`${port}포트로 서비스를 시작합니다~`);
})

module.exports = {app};