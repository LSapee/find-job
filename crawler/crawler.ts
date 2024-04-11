import {Builder, Browser, By, Key, until, WebDriver, logging, WebElement} from 'selenium-webdriver'
import chrome from "selenium-webdriver/chrome"
import {MyList} from "../types/myList";
const {hasElement,hasURL,hasNextPage,exps,expOk} = require("../utils/utils");

let chromeOptions:chrome.Options = new chrome.Options();
chromeOptions.addArguments("--headless");
chromeOptions.addArguments("--no-sandbox");

const jobKCrawler = async (keyword:string,myExp:string,expAll:boolean)=>{
    let driver = await new Builder().forBrowser("chrome").setChromeOptions(chromeOptions).build();
    // let driver = await new Builder().forBrowser("chrome").build();
    // return 해줄 배열
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
                const endDate:string = await hasElement(post,"span.date")
                const skillStacks:string = await hasElement(post,"p.etc")
                const postURL:string|boolean = await hasURL(elements[i],thisSite);
                if(postTitle==="")break;
                if(postURL===false)break;
                const expArr:string[] =exps(exp);
                const expT = expOk(exp,myExp,expAll);
                if(expT){
                    myList.push({
                        company,
                        postTitle,
                        exp:expArr,
                        edu,
                        loc,
                        skillStacks,
                        endDate,
                        postURL
                    });
                }
            }
            ok = await hasNextPage(driver,thisSite);
        }while(ok)
    }catch(e){
        myList.length=0;
        hasError=true;
    }finally{
        await driver.quit();
    }if(hasError) return [{error:"검색 결과가 없습니다."}];
    return myList;
}

const saramInCrawler = async (keyword:string,myExp:string,expAll:boolean) :Promise<MyList[]|object[]>=>{
    const myURL = `https://www.saramin.co.kr/zf_user`;
    let driver = await new Builder().forBrowser("chrome").build();
    // let driver = await new Builder().forBrowser("chrome").setChromeOptions(chromeOptions).build();
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
                const endDate:string = await post.findElement(By.css(".job_date")).getText();
                const requirements:string = await post.findElement(By.css(".job_condition")).getText();// 경력 학력
                const Allrequirements:string[] = requirements.split("\n");
                const loc:string = Allrequirements[0];
                const exp :[]= exps(Allrequirements[1]);
                const edu:string = Allrequirements[2];
                let skillStack:WebElement[] = await post.findElements(By.css(".job_sector a"));
                let skillStacks:string = "";
                for(let z= 0; z<skillStack.length; z++) {
                    skillStacks += await skillStack[z].getText();
                    if(z!==skillStack.length-1)skillStacks+= ",";
                }
                const company:string = com.split("\n")[0];
                const expT:string[] = expOk(exp,myExp,expAll);
                if(expT){
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
            ok = await hasNextPage(driver,thisSite);
        }while(ok);
    }catch(e){
        myList.length =0;
        hasError =true;
    }finally{
        await driver.quit();
    }
    if(hasError) return [{error:"검색 결과가 없습니다."}];
    return myList;
}

module.exports = {jobKCrawler,saramInCrawler}