import {Builder, Browser, By, Key, until, WebDriver, logging, WebElement} from 'selenium-webdriver'
import chrome from "selenium-webdriver/chrome"
import {MyList} from "../types/types";
const {hasElement,hasURL,hasNextPage,exps,companyReNamed,endDateS} = require("../utils/utils");
const {crawlerRepository} =require("../Repository/crawler.Repository");

let chromeOptions:chrome.Options = new chrome.Options();
// headless 모드 실행
chromeOptions.addArguments("--headless");
chromeOptions.addArguments("window-size=1920x1080");
chromeOptions.addArguments("disable-gpu");
// 사용자 에이전트 변경
chromeOptions.addArguments("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36");
// WebDriver 속성 제거
chromeOptions.excludeSwitches('enable-automation');
chromeOptions.addArguments('--disable-blink-features=AutomationControlled');
// 잡코리아 크롤링
const jobKCrawler = async (keyword:string):Promise<boolean>=>{
    let driver = await new Builder().forBrowser("chrome").setChromeOptions(chromeOptions).build();
    // let driver = await new Builder().forBrowser("chrome").build();
    // DB에 추가해줄 배열
    const myList:MyList[] =[];
    const myURL:string="https://www.jobkorea.co.kr/";
    // 구분자로 쓸 예정
    const thisSite:string ="jobK";
    let hasError:boolean =false;
    console.log("jobK 크롤링 시작합니다.");
    try{
        // 페이지 로딩
        await driver.get(myURL)
        let searchInput:WebElement = await driver.findElement(By.css("#stext"));
        searchInput.sendKeys(keyword,Key.ENTER);
        // ok = 다음페이지 유무로 다음 버튼
        let ok = false;
        do {
            await driver.wait(until.elementLocated(By.css(".list-post")), 20000);
            // elements = 공고 블록
            let elements:WebElement[] = await driver.findElements(By.css(".list-post"));
            for(let i=0; i<elements.length; i++){
                const post:WebElement = await elements[i];
                const company:string = await hasElement(post,"a.name.dev_view");
                const postTitle:string = await hasElement(post,"a.title.dev_view");
                const exp:string = await hasElement(post,"span.exp")
                const edu:string = await hasElement(post,"span.edu")
                const loc:string = await hasElement(post,"span.loc.long")
                let endDate:string = await hasElement(post,"span.date")
                const skillStacks:string = await hasElement(post,"p.etc")
                const postURL:string|boolean = await hasURL(elements[i],thisSite);
                const companyName:string = companyReNamed(company);
                if(postTitle==="")break;
                if(postURL===false)break;
                const expArr:string[] =exps(exp);
                endDate = endDateS(endDate);
                myList.push({
                    company:companyName,
                    postTitle,
                    exp:expArr,
                    edu,
                    loc,
                    skillStacks,
                    endDate,
                    postURL
                });
            }
            await crawlerRepository(myList,keyword);
            myList.length=0;
            ok = await hasNextPage(driver,thisSite);
        }while(ok)
    }catch(e){
        myList.length=0;
        hasError=true;
    }finally{
        await driver.quit();
    }
    if(hasError) return false;
    // else makeCSV(thisSite,myList,keyword);
    console.log("jobK 크롤링 종료합니다.");
    return true;
}
// 사람인 크롤링
const saramInCrawler = async (keyword:string) :Promise<boolean>=>{
    const myURL = `https://www.saramin.co.kr/zf_user`;
    // let driver = await new Builder().forBrowser("chrome").build();
    let driver = await new Builder().forBrowser("chrome").setChromeOptions(chromeOptions).build();
    const myList:MyList[] = [];
    const thisSite:string = "saramIn";
    let hasError:boolean =false;
    console.log("saramIn 크롤링 시작합니다.")
    try{
        await driver.get(myURL)
        // 검색을 위한 input을 띄우는 버튼
        await driver.wait(until.elementLocated(By.css("#btn_search")),10000)
        let searchBtn:WebElement =await driver.findElement(By.css("#btn_search"));
        searchBtn.click();
        await driver.wait(until.elementLocated(By.css("#ipt_keyword_recruit")),10000)
        let searchInput:WebElement = await driver.findElement(By.css("#ipt_keyword_recruit"));
        searchInput.sendKeys(keyword);
        let searchBtn2:WebElement = await driver.findElement(By.css("#btn_search_recruit"));
        await driver.sleep(1000);
        searchBtn2.click();
        await driver.sleep(1000);
        await driver.wait(until.elementLocated(By.css(".type_box")),10000);
        const tabList:WebElement[] = await driver.findElements(By.css(".type_box>a"));
        for(let i=0; i<tabList.length; i++){
            const clickbtn:string = await tabList[i].getText();
            if(clickbtn==="채용정보"){
                tabList[i].click();
                break;
            }
        }
        let ok:boolean = false;
        do{
            await driver.wait(until.elementLocated(By.css(".item_recruit")),10000);
            // 목록 가져오기
            await driver.sleep(1000);
            let elements:WebElement[] = await driver.findElements(By.css(".item_recruit"));
            await driver.wait(until.elementLocated(By.css(".pagination")),10000);
            for(let i=0; i<elements.length; i++){
                const post:WebElement = await elements[i].findElement(By.css(".area_job"));
                const com:string = await elements[i].findElement(By.css(".area_corp")).getText();
                const postTitle:string = await post.findElement(By.css(".job_tit")).getText();
                const postURL:string= await post.findElement(By.css(".job_tit>a")).getAttribute("href");
                let endDate:string = await post.findElement(By.css(".job_date")).getText();
                const requirements:string = await post.findElement(By.css(".job_condition")).getText();// 경력 학력
                const Allrequirements:string[] = requirements.split("\n");
                const loc:string = Allrequirements[0];
                const exp :[]= exps(Allrequirements[1]);
                const edu:string = Allrequirements[2];
                let skillStack:WebElement[] = await post.findElements(By.css(".job_sector a"));
                let skillStacks:string = "";
                endDate = endDateS(endDate);
                for(let z= 0; z<skillStack.length; z++) {
                    skillStacks += await skillStack[z].getText();
                    if(z!==skillStack.length-1)skillStacks+= ",";
                }
                const company:string = com.split("\n")[0];
                const companyName :string = companyReNamed(company);
                myList.push({
                    company:companyName,
                    postTitle,
                    exp,
                    edu,
                    loc,
                    skillStacks,
                    endDate,
                    postURL
                });
            }
            await crawlerRepository(myList,keyword);
            myList.length=0;
            ok = await hasNextPage(driver,thisSite);
        }while(ok);
    }catch(e){
        myList.length =0;
        hasError =true;
    }finally{
        await driver.quit();
    }
    if(hasError) return false;
    // else makeCSV(thisSite,myList,keyword);
    console.log("saramIn 크롤링 종료합니다.");
    return true;
}

module.exports = {jobKCrawler,saramInCrawler}