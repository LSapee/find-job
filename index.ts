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
// DB 조회 테스트
app.get("/getjob", async (req:Request,res:Response)=>{
    const {search:keyword,expAll:expAll,exp:myExp,startNum:startNum} = req.query;
    let stnum:number =0;
    if(typeof(startNum)==="string")  stnum = parseInt(startNum);
    const myList:MyList|boolean = await findAlljob(keyword,expAll,myExp,stnum);
    if(myList===false) res.send([{error:"키워드가 존재하지 않습니다."}]);
    else res.send(myList);
})

//메인 페이지
app.get("/",(req:Request,res:Response)=>{
    res.sendFile(__dirname+"/src/index.html")
})

app.listen(port,()=>{
    console.log("서비스를 시작합니다~");
})

module.exports = {app};