const {Builder, Browser, By, Key, until,webdriver, logging} = require('selenium-webdriver');
const chrome = require("selenium-webdriver/chrome");
const {hasElement,hasURL,hasNextPage,hasError} = require("../utils/utils");

let chromeOptions = new chrome.Options();
chromeOptions.addArguments("--headless");
chromeOptions.addArguments("--no-sandbox");

const jobKCrawler = async (keyword)=>{
    let driver = await new Builder().forBrowser("chrome").setChromeOptions(chromeOptions).build();
    // let driver = await new Builder().forBrowser("chrome").build();
    // return 해줄 배열
    const myList =[];
    const myURL="https://www.jobkorea.co.kr/";
    // 구분자로 쓸 예정
    const thisSite ="jobK";
    console.log("jobK 크롤링 시작합니다.");
    let cnt =0;
    try{
        // 페이지 로딩
        await driver.get(myURL)
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
                const endDate = await hasElement(post,"span.date")
                const skillStacks = await hasElement(post,"p.etc")
                const postURL = await hasURL(elements[i],thisSite);
                if(postTitle==="")break;
                if(postURL===false)break;
                if(exp.indexOf("1년")!=-1 ||exp.indexOf("신입")!=-1){
                    myList.push({
                        company,
                        postTitle,
                        exp,
                        edu,
                        loc,
                        skillStacks,
                        endDate,
                        postURL
                    });
                }
            }
            cnt++;
            ok = await hasNextPage(driver,thisSite);
            if(cnt===10)break;
        }while(ok)
    }catch(e){
        myList.length=0;
        myList.push({error:"검색 결과가 없습니다."});
    }finally{
        await driver.quit();
    }
    return myList;
}

const saramInCrawler = async (keyword)=>{
    const myURL = "https://www.saramin.co.kr/zf_user/";
    // let driver = await new Builder().forBrowser("chrome").build();
    let driver = await new Builder().forBrowser("chrome").setChromeOptions(chromeOptions).build();
    const myList = await [];
    const thisSite = "saramIn";
    console.log("saramIn 크롤링 시작합니다.")
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
        await driver.sleep(1000);
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
        let cnt= 0;
        do{
            await driver.wait(until.elementLocated(By.css(".item_recruit")),10000);
            // 목록 가져오기
            driver.sleep(1000);
            let elements = await driver.findElements(By.css(".item_recruit"));
            await driver.wait(until.elementLocated(By.css(".pagination")),10000);
            for(let i=0; i<elements.length; i++){
                const post = await elements[i].findElement(By.css(".area_job"));
                const com = await elements[i].findElement(By.css(".area_corp")).getText();
                const postTitle = await post.findElement(By.css(".job_tit")).getText();
                const postURL = await post.findElement(By.css(".job_tit>a")).getAttribute("href");
                const endDate = await post.findElement(By.css(".job_date")).getText();
                let requirements = await post.findElement(By.css(".job_condition")).getText();// 경력 학력
                requirements = requirements.split("\n");
                const loc = requirements[0];
                const exp = requirements[1];
                const edu = requirements[2];
                let temp = [];
                for(let i =1; i<requirements.length; i++)temp.push(requirements[i]);
                requirements = temp.toString();
                let skillStack = await post.findElements(By.css(".job_sector a"));
                let skillStacks = "";
                for(const item of skillStack) {
                    skillStacks += await item.getText();
                    skillStacks+= ",";
                }
                skillStacks.length = skillStacks.length-1;
                let company = com.split("\n")[0];
                if(exp.indexOf("1년")!=-1 ||exp.indexOf("신입")!=-1){
                    myList.push({
                        company,
                        postTitle,
                        exp,
                        edu,
                        loc,
                        skillStacks,
                        endDate,
                        postURL
                    });
                }
            }
            cnt++;
            ok = await hasNextPage(driver,thisSite);
            if(cnt===10)break;
        }while(ok);
    }catch(e){
        console.log(e);
        myList.length =0;
        myList.push({error:"검색 결과가 없습니다."});
    }finally{
        await driver.quit();
    }
    return myList;
    // makeCSV(thisSite,myList);
}

module.exports = {jobKCrawler,saramInCrawler}