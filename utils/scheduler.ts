const cron = require("node-cron");
const {findKeywords} = require("../Repository/crawler.Repository")
const {jobKCrawler,saramInCrawler} =  require("../crawler/crawler")

// 분 시 일 월 요일
export const crawlingScheduler = async ()=>{
    cron.schedule(("0 0 * * *"), async () =>{
        const keywords : string[] = await findKeywords();
        for(const item of keywords){
            const resultJok = await jobKCrawler(item);
            const resultSaramIn = await saramInCrawler(item);
            console.log(resultJok);
            console.log(resultSaramIn);
        }
    })
}