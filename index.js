const express =require("express")
const {Builder, Browser, By, Key, until,webdriver,chrome, logging} = require('selenium-webdriver');
const app = express();
const port = 3000;

const screen = {
    width: 640,
    height: 480
};
const hasURL =async (Aelement,targetSite)=>{
    let urlTag = "";
    if(targetSite ==="jobK"){
        urlTag = ".post-list-info>a";
    }else if(targetSite === "saramIn" ){

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
    let driver = await new Builder().forBrowser("chrome").build();
    // return 해줄 배열
    let myList =await [];
    // 구분자로 쓸 예정
    const thisSite ="jobK";
    try{
        // 페이지 로딩
        await driver.get("https://www.jobkorea.co.kr/")
        let searchInput = await driver.findElement(By.css("#stext"));
        let keyword = "node";
        searchInput.sendKeys(keyword,Key.ENTER);
        // ok = 다음페이지 유무로 다음 버튼
        let ok = false;
        do {
            await driver.wait(until.elementLocated(By.css(".list-post")), 10000);
            let elements = await driver.findElements(By.css(".list-post"))
            for(let i=0; i<elements.length; i++){
                const post = await elements[i].getText();
                const postText = post.split("\n");
                const company = postText[0];
                const postTitle = postText[1];
                const requirements = postText[2];
                const field = postText[3];
                const postURL = await hasURL(elements[i],thisSite);
                if(postURL===false)break;
                if(requirements.indexOf("1년") !== -1||(requirements.indexOf("1년")!==-1&&requirements.indexOf("11년")===-1)){
                    myList.push({
                        company:company,
                        title:postTitle,
                        requirements:requirements,
                        field:field,
                        url:postURL
                    });
                }
            }
            ok = await hasNextPage(driver,thisSite);
        }while(ok)
        // 확인용 for문
        // for(let i=0; i<myList.length; i++){
        //     console.log(myList[i]);
        // }
    }finally{
        await driver.quit();
    }
    res.send(myList);
})
// 사람인
app.get("/saramin", async (req,res)=>{
    const myURL = "https://www.saramin.co.kr/zf_user/";
    let driver = await new Builder().forBrowser("chrome").build();
    const myList = await [];
    const thisSite = "saramIn";
    try{
        await driver.get(myURL)
        // 검색을 위한 input을 띄우는 버튼
        let searchBtn =await driver.findElement(By.css("#btn_search"));
        searchBtn.click();
        let searchInput = await driver.findElement(By.css("#ipt_keyword_recruit"));
        let keyword = "node";
        searchInput.sendKeys(keyword,Key.ENTER);
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
                if(requirements.indexOf("신입")!==-1||(requirements.indexOf("1년")!==-1&&requirements.indexOf("11년")===-1)){
                    console.log(requirements)
                    myList.push({
                        company:company,
                        postTitle:postTitle,
                        postUrl:postUrl,
                        endDate:endDate,
                        skillStack:skillStack,
                        cont:cont,
                        requirements:requirements
                    })
                }
            }
            ok = await hasNextPage(driver,thisSite);
        }while(ok);
    }finally{
        await driver.quit();
    }
    res.send(myList);
})


//메인 페이지
app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/src/index.html")

})

app.listen(port,()=>{
    console.log("Hello Expree App");
})