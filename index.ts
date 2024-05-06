require('dotenv').config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {MyList} from "./types/types";
import {checkToken} from "./middleware/loginCheck";
import {requireLogin} from "./middleware/requireLogin";
const app = express();
const {findAlljob,findAllkeyWords} = require("./Repository/findjob.Repository")
const {loginUser,saveTokens,deleteAccessToken} = require("./Repository/user.Repository");
const {crawlingScheduler} = require("./utils/scheduler")
const {neverSee,neverSeeCompanys} = require("./Repository/compony.Repository")
const {getToken} = require("./auth/auth");

const port = 3000;


const corsOptions = {
    origin: 'https://findjob.lsapee.com', // 허용할 오리진 명시
    // origin: 'http://localhost:3000', // 허용할 오리진 명시
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
    const loginTF  = await loginUser(tokens.id_token);
    if(loginTF) {
        if(tokens!==null ||tokens!==undefined){
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
            await saveTokens(tokens.refresh_token,tokens.access_token,loginTF);
        }
    }
    res.redirect("https://findjob.lsapee.com");
});
//로그아웃시
app.get("/api/logout",cookieParser(),async (req:Request,res:Response)=>{
    await deleteAccessToken(req.cookies["access_token"]);
    res.clearCookie("access_token",{domain: '.lsapee.com'});
    res.clearCookie("access",{domain: '.lsapee.com'});
    res.redirect("https://findjob.lsapee.com");
});
// job DB 조회
app.get("/api/getjob",cookieParser(),checkToken, async (req:Request,res:Response)=>{
    const loggedIn:boolean = req.cookies["access_token"] !==undefined ? true:false;
    const {search:keyword,expAll:expAll,exp:myExp,startNum:startNum} = req.query;
    // 추가 조회할 정보 데이터 시작번호
    let stnum:number =0;
    if(typeof(startNum)==="string")  stnum = parseInt(startNum);
    const myList:MyList|boolean = await findAlljob(keyword,expAll,myExp,stnum,loggedIn);
    res.send(myList);
})
//등록된 키워드 데이터 가져오기
app.get("/api/getKeywords",async (req:Request,res:Response)=>{
    const keywords = await findAllkeyWords();
    res.send(keywords);
})
// 해당 회사 공고 보지 않기
app.post("/api/companys",cookieParser(),requireLogin,async (req:Request,res:Response)=>{
    const access_token:string = req.cookies["access_token"];
    const {companyName} = req.body
    await neverSee(access_token,companyName)
    // const {}
    //임시로 보내기
    res.send({"sss":"성공"})
})
// 내가 공고 보지 않기로 한 회사 목록
app.get("/api/companys",cookieParser(),requireLogin,async (req:Request,res:Response)=>{
    const access_token:string = req.cookies["access_token"];
    console.log("access_token",access_token)
    const companys = await neverSeeCompanys(access_token);
    res.send(companys);
})
//해당 회사 공고 지원 완료
app.post("/api/companyT",cookieParser(),requireLogin,async (req:Request,res:Response)=>{

})


//메인 페이지
app.get("/",(req:Request,res:Response)=>{
    res.sendFile(__dirname+"/src/index.html")
})

app.listen(port,()=>{
    console.log(`${port}포트로 서비스를 시작합니다~`);
})

module.exports = {app};