const express =require("express")
const {Builder, Browser, By, Key, until,webdriver, logging} = require('selenium-webdriver');
const chrome = require("selenium-webdriver/chrome")
const {query} = require("express");
const app = express();
const cors =require("cors");
const fs  = require("fs");
const path = require("path");
// const router = require("./src/routes")
const port = 3000;

let chromeOptions = new chrome.Options();
chromeOptions.addArguments("--headless");
chromeOptions.addArguments("--no-sandbox");

app.use(cors({
    origin: 'https://findjob.lsapee.com'
}));


const hasElement = async (myElement,myTag)=>{
    let ans = "";
    try{
        ans = await myElement.findElement(By.css(`${myTag}`)).getText();
    }catch(e){
    }
    return ans;
}
const makeCSV = (targetSite,myList)=>{
    let csvContent = "";
    let fileName = targetSite;
    if(targetSite==="jobK"){
        csvContent = "회사명,공고제목,지역,분야,링크\n";
        myList.forEach(item=>{
            let row = `"${item.company}","${item.title}","${item.requirements}","${item.field}","${item.url}"`;
            csvContent += row + '\n';
        })
    }else{
        csvContent="회사명,공고제목,링크,마감일,기술스택,지역,특이사항\n";
        myList.forEach(item=>{
            let row = `"${item.company}","${item.postTitle}","${item.postUrl}","${item.endDate}","${item.skillStack}","${item.cont}","${item.requirements}"`;
            csvContent += row + '\n';
        })
    }
    fs.writeFile(path.join(__dirname, `${fileName}.csv`), csvContent, 'utf8', (err) => {
        if (err) {
            console.log('파일 저장 중 오류가 발생했습니다:', err);
        } else {
            console.log('파일이 성공적으로 저장되었습니다.');
        }
    });
}

// app.use("/Scraper",Scraper);
const hasURL =async (Aelement,targetSite)=>{
    let urlTag = "";
    if(targetSite ==="jobK"){
        urlTag = ".post-list-info>a";
    }
    try{
        const myURL = await Aelement.findElement(By.css(urlTag)).getAttribute("href");
        return myURL;
    }catch (e){
        return false;
    }
}

// 다음 페이지로 가는 버튼 유무 확인
const hasNextPage = async (driver,targetSite)=>{
    let nextTag ="";
    let nextBtn =null;
    const t = true;
    const f = false;
    if(targetSite==="jobK"){
        nextTag = ".btnPgnNext";
        try{
            nextBtn = await driver.findElement(By.css(nextTag));
        }catch(e){
            return f;
        }
    }else if(targetSite==="saramIn"){
        try {
            let pageNation = await driver.findElement(By.css(".pagination"));
            let pages = await pageNation.findElements(By.css("a"));
            let thisPage = await pageNation.findElement(By.css("span.page"))
            thisPage = await thisPage.getText();
            for (let i = 0; i < pages.length; i++) {
                let k = await pages[i].getText();
                if (k.indexOf("다음") !== -1) {
                    nextBtn = pages[i];
                } else if ( Number(k) > Number(thisPage)) {
                    nextBtn = pages[i];
                    break;
                } else if (Number(thisPage) == NaN) continue;
            }
            if(nextBtn==null) return f;
        }catch(e){
            return f;
        }
    }
    await nextBtn.click();
    await driver.sleep(1000);
    return t;
}

// 잡코리아
app.get("/jobk",async (req,res)=>{
    // 브라우저 크롬 세팅
    // let driver = await new Builder().forBrowser("chrome").setChromeOptions(chromeOptions).build();
    let driver = await new Builder().forBrowser("chrome").build();
    // return 해줄 배열
    let myList =[];
    // 구분자로 쓸 예정
    const thisSite ="jobK";
    const keyword = req.query.search;
    console.log("jobK 크롤링 시작합니다.");
    try{
        // 페이지 로딩
        await driver.get("https://www.jobkorea.co.kr/")
        let searchInput = await driver.findElement(By.css("#stext"));
        searchInput.sendKeys(keyword,Key.ENTER);
        // ok = 다음페이지 유무로 다음 버튼
        let ok = false;
        do {
            await driver.wait(until.elementLocated(By.css(".list-post")), 20000);
            // elements = 공고 블록
            let elements = await driver.findElements(By.css(".list-post"));
            for(let i=0; i<elements.length; i++){
                const post = await elements[i];
                const company = await hasElement(post,"a.name.dev_view");
                const postTitle = await hasElement(post,"a.title.dev_view");
                const exp = await hasElement(post,"span.exp")
                const edu = await hasElement(post,"span.edu")
                const loc = await hasElement(post,"span.loc.long")
                const date = await hasElement(post,"span.date")
                const stack = await hasElement(post,"p.etc")
                const postURL = await hasURL(elements[i],thisSite);
                if(postTitle==="")break;
                if(postURL===false)break;
                // if(requirements.indexOf("1년") !== -1||(requirements.indexOf("1년")!==-1&&requirements.indexOf("11년")===-1)){
                    myList.push({
                       company,
                        postTitle,
                        exp,
                        edu,
                        loc,
                        stack,
                        date,
                        postURL
                    });
                }
            // }
            ok = await hasNextPage(driver,thisSite);
        }while(ok)
        // 확인용 for문
        // for(let i=0; i<myList.length; i++){
        //     console.log(myList[i]);
        // }
    }catch(e){
        console.log("에러 발생: ",e)
        myList.push({error:"검색 결과가 없습니다."});
    }finally{
        await driver.quit();
    }
    // makeCSV(thisSite,myList);
    res.send(myList);
})
// 사람인
app.get("/saramin", async (req,res)=>{
    const myURL = "https://www.saramin.co.kr/zf_user/";
    // let driver = await new Builder().forBrowser("chrome").setChromeOptions(chromeOptions).build();
    let driver = await new Builder().forBrowser("chrome").build();
    const myList = await [];
    const thisSite = "saramIn";
    const keyword = req.query.search;
    try{
        await driver.get(myURL)
        // 검색을 위한 input을 띄우는 버튼
        let searchBtn =await driver.findElement(By.css("#btn_search"));
        searchBtn.click();
        let searchInput = await driver.findElement(By.css("#ipt_keyword_recruit"));
        searchInput.sendKeys(keyword);
        let searchBtn2 = await driver.findElement(By.css("#btn_search_recruit"));
        driver.sleep(1000);
        searchBtn2.click();
        await driver.sleep(2000);
        await driver.wait(until.elementLocated(By.css(".type_box")),10000);
        const tabList = await driver.findElements(By.css(".type_box>a"));
        for(let i=0; i<tabList.length; i++){
            const clickbtn = await tabList[i].getText();
            if(clickbtn==="채용정보"){
                tabList[i].click();
                break;
            }
        }
        let ok = false;
        do{
            await driver.wait(until.elementLocated(By.css(".item_recruit")),10000);
            await driver.sleep(1000);
            // 목록 가져오기
            let elements = await driver.findElements(By.css(".item_recruit"));
            await driver.wait(until.elementLocated(By.css(".pagination")),10000);
            await driver.sleep(1000);
            for(let i=0; i<elements.length; i++){
                const post = await elements[i].findElement(By.css(".area_job"));
                const com = await elements[i].findElement(By.css(".area_corp")).getText();
                const postTitle = await post.findElement(By.css(".job_tit")).getText();
                const postUrl = await post.findElement(By.css(".job_tit>a")).getAttribute("href");
                const endDate = await post.findElement(By.css(".job_date")).getText();
                let requirements = await post.findElement(By.css(".job_condition")).getText();
                requirements = requirements.split("\n");
                const cont = requirements[0];
                let temp = [];
                for(let i =1; i<requirements.length; i++)temp.push(requirements[i]);
                requirements = temp.toString();
                const skillStack = await post.findElement(By.css(".job_sector")).getText();
                let company = com.split("\n")[0];
                // console.log(`postTitle:${postTitle}\npostUrl:${postUrl}\nendDate:${endDate}\ncompany:${company}\n기술:${skillStack}\n위치:${cont}\n경력사항:${requirements}`);
                // if(requirements.indexOf("신입")!==-1||(requirements.indexOf("1년")!==-1&&requirements.indexOf("11년")===-1)){
                    myList.push({
                        company:company,
                        postTitle:postTitle,
                        postUrl:postUrl,
                        endDate:endDate,
                        skillStack:skillStack,
                        cont:cont,
                        requirements:requirements
                    })
                // }
            }
            ok = await hasNextPage(driver,thisSite);
        }while(ok);
    }catch(e){
        myList.push({error:"검색 결과가 없습니다."});
    }finally{
        await driver.quit();
    }
    makeCSV(thisSite,myList);
    res.send(myList);
})
//메인 페이지
app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/src/index.html")
})

app.listen(port,()=>{
    console.log("Hello Expree App");
})

module.exports = app;