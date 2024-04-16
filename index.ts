import express, { Request, Response } from 'express';
import cors from 'cors';
import {MyList} from "./types/myList";

const app = express();
const {jobKCrawler,saramInCrawler} = require("./crawler/crawler");
const {findAlljob} = require("./Repository/findjob.Repository")
const {crawlingScheduler} = require("./utils/scheduler")
const port = 3000;

app.use(cors({
    origin:"*"
}));
crawlingScheduler();
// 잡코리아
app.get("/jobk",async (req:Request,res:Response)=>{
    // 검색한 단어
    const {search:keyword,expAll:expAll,exp:myExp} = req.query;
    const myList = await jobKCrawler(keyword,myExp,expAll);
    res.send(myList);
})
// 사람인
app.get("/saramin", async (req:Request,res:Response)=>{
    //검색한 단어
    const {search:keyword,expAll:expAll,exp:myExp} = req.query;
    const myList = await saramInCrawler(keyword,myExp,expAll);
    res.send(myList);
})
// DB 조회 테스트
app.get("/test", async (req:Request,res:Response)=>{
    const {search:keyword,expAll:expAll,exp:myExp} = req.query;
    const myList:MyList|boolean = await findAlljob(keyword,expAll,myExp);
    if(myList===false) [{error:"키워드가 존재하지 않습니다."}]
    res.send(myList);
})

//메인 페이지
app.get("/",(req:Request,res:Response)=>{
    res.sendFile(__dirname+"/src/index.html")
})

app.listen(port,()=>{
    console.log("서비스를 시작합니다~");
})

module.exports = {app};