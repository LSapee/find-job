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
const {neverSee,neverSeeCompanys,delneverSeeCompany,delAllneverSeeCompany} = require("./Repository/compony.Repository")
const {application_completed,application_completed_companyList,application_completed_company_cen,application_completed_company_write,application_completed_status} = require("./Repository/application_completed_company.Repository")
const {getToken} = require("./auth/auth");
const port = 3000;

// COrs옵션 설정
const corsOptions = {
    origin: 'https://findjob.lsapee.com', // 허용할 오리진 명시
    // origin: 'http://localhost:3000', // 허용할 오리진 명시
    credentials: true, // 자격 증명(쿠키 등) 허용
    optionsSuccessStatus: 200 // 일부 브라우저에서 요구하는 응답 상태
};
//cors 설정
app.use(cors(corsOptions));
//json 데이터 파싱
app.use(express.json());
// 쿠키파서 적용
app.use(cookieParser());
// urlparam 파싱
app.use(express.urlencoded({ extended: true }));
// ec2StartTimet();
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
app.get("/api/logout",async (req:Request,res:Response)=>{
    await deleteAccessToken(req.cookies["access_token"]);
    res.clearCookie("access_token",{domain: '.lsapee.com'});
    res.clearCookie("access",{domain: '.lsapee.com'});
    res.redirect("https://findjob.lsapee.com");
});
// job DB 조회
app.get("/api/getjobs",checkToken, async (req:Request,res:Response)=>{
    let userLog ={sign:false, access_token :""};
    if(req.cookies["access_token"] !==undefined) userLog = {sign:true, access_token:req.cookies["access_token"]};
    const {search:keyword,expAll:expAll,exp:myExp,startNum:startNum} = req.query;
    // 추가 조회할 정보 데이터 시작번호
    let stnum:number =0;
    if(typeof(startNum)==="string")  stnum = parseInt(startNum);
    const myList:MyList|boolean = await findAlljob(keyword,expAll,myExp,stnum,userLog);
    res.send(myList);
})
//등록된 키워드 데이터 가져오기
app.get("/api/getKeywords",async (req:Request,res:Response)=>{
    const keywords = await findAllkeyWords();
    res.send(keywords);
})
// 해당 회사 공고 보지 않기
app.post("/api/companys",requireLogin,async (req:Request,res:Response)=>{
    const access_token:string = req.cookies["access_token"];
    const {companyName} = req.body
    const result =await neverSee(access_token,companyName)
    if(result === true) res.send({success:"성공"})
    else res.send({success:"실패"})
})
// 내가 공고 보지 않기로 한 회사 목록
app.get("/api/companys",requireLogin,async (req:Request,res:Response)=>{
    const access_token:string = req.cookies["access_token"];
    const companys = await neverSeeCompanys(access_token);
    res.send(companys);
})
// 내가 공고 보지 않기로 한 회사 목록 취소
app.delete("/api/companys",requireLogin,async (req:Request,res:Response)=>{
    const access_token:string = req.cookies["access_token"];
    const {companyName} = req.body
    await delneverSeeCompany(access_token,companyName);
    res.send({success:"성공"})
})
// 공고 보지 않기로 한 회사 목록 전부 제외
app.delete("/api/companys/all",requireLogin,async (req:Request,res:Response)=>{
    const access_token:string = req.cookies["access_token"];
    const delMessage = await delAllneverSeeCompany(access_token);
    res.send({success:delMessage})
})
//해당 회사 공고 지원 완료
app.post("/api/companyT",requireLogin,async (req:Request,res:Response)=>{
    const access_token:string = req.cookies["access_token"];
    const {companyName,titleName,siteName} = req.body
    const success:boolean =await application_completed(access_token,companyName,titleName,siteName);
    if(success!==false)res.send({"success":"지원 완료 등록 성공"})
    else res.send({success:"지원 완료 등록 실패"})
})
// 지원 완료한 회사 목록 가져오기
app.get("/api/companyT",requireLogin,async (req:Request,res:Response)=>{
    const access_token:string = req.cookies["access_token"];
    const data = await application_completed_companyList(access_token);
    res.send(data);
})
//지원 완료한 회사 status 변경
app.patch("/api/companyT",requireLogin,async (req:Request,res:Response)=>{
    const access_token:string = req.cookies["access_token"];
    const {status,companyName} = req.body;
    console.log(companyName);
    const returnStatus  = await application_completed_status(access_token,status,companyName);
    if(returnStatus===true) return res.send({status:status});
    else return res.send({status: "실패"});
})
//지원 완료한 회사 취소 기능
app.delete("/api/companyT",requireLogin,async (req:Request,res:Response)=>{
    const access_token:string = req.cookies["access_token"];
    const {companyName} = req.body
    await application_completed_company_cen(access_token,companyName);
    res.send({success:"성공"})
})
//지원 완료한 회사 직접 추가
app.post("/api/appCom",requireLogin,async (req:Request,res:Response)=>{
    const access_token:string = req.cookies["access_token"];
    const {comN,postT,subS} = req.body;
    const success:boolean = await application_completed_company_write(access_token,comN,postT,subS);
    if(success===false)res.send({success:"추가 실패"})
    else res.send(success)
})
//임시페이지
app.get("/",(req:Request,res:Response)=>{
    res.sendFile(__dirname+"/src/index.html")
})

app.listen(port,()=>{
    console.log(`${port}포트로 서비스를 시작합니다~`);
})

module.exports = {app};