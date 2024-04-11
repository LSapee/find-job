const express =require("express")
const app = express();
const cors =require("cors");
const {jobKCrawler,saramInCrawler} = require("./crawler/crawler");
const port = 3000;

app.use(cors({
    origin: 'https://findjob.lsapee.com'
}));

// 잡코리아
app.get("/jobk",async (req,res)=>{
    // 검색한 단어
    const keyword = req.query.search;
    const expAll = req.query.expAll;
    const myExp = req.query.exp
    const myList = await jobKCrawler(keyword,myExp,expAll);
    res.send(myList);
})
// 사람인
app.get("/saramin", async (req,res)=>{
    //검색한 단어
    const keyword = req.query.search;
    const expAll = req.query.expAll;
    const myExp = req.query.exp
    const myList = await saramInCrawler(keyword,myExp,expAll);
    res.send(myList);
})
//메인 페이지
app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/src/index.html")
})

app.listen(port,()=>{
    console.log("서비스를 시작합니다~");
})

module.exports = app;