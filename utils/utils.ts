import {By, promise, WebDriver, WebElement} from "selenium-webdriver";
// 해당 태그가 존제하는지
const hasElement = async (myElement:WebElement,myTag:[]):Promise<string>=>{
    let ans = "";
    try{
        ans = await myElement.findElement(By.css(`${myTag}`)).getText();
    }catch(e){
        return ans;
    }
    return ans;
}
//URL이 존재하는지 확인
const hasURL =async (Aelement:WebElement,targetSite:string):Promise<boolean|string>=>{
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
const hasNextPage = async (driver:WebDriver,targetSite:string):Promise<boolean>=>{
    let nextTag ="";
    let nextBtn:any=null;
    const t:boolean = true;
    const f :boolean= false;
    if(targetSite==="jobK"){
        nextTag = ".btnPgnNext";
        try{
            nextBtn = await driver.findElement(By.css(nextTag));
            await nextBtn.click();
        }catch(e){
            return f;
        }
    }else if(targetSite==="saramIn"){
        try {
            let pageNation = await driver.findElement(By.css(".pagination"));
            let pages = await pageNation.findElements(By.css("a"));
            let thisPage:any = await pageNation.findElement(By.css("span.page"))
            thisPage = await thisPage.getText();
            for (let i = 0; i < pages.length; i++) {
                let k = await pages[i].getText();
                if (k.indexOf("다음") !== -1) {
                    nextBtn = pages[i];
                } else if ( Number(k) > Number(thisPage)) {
                    nextBtn = pages[i];
                    break;
                } else if (Number.isNaN(parseInt(thisPage))) continue;
            }
            if(nextBtn==null) return f;
            await nextBtn.click();
        }catch(e){
            return f;
        }
    }
    await driver.sleep(1000);
    return t;
}
// 경력을 n~m년차를 (1년,2년,3년)으로 나누기 또는 n년 이상을 n~10(5년,6년,7년 ...)으로 바꾸는 작업
const exps = (exp:string):string[] =>{
    const expList:string[]  =[];
    const nToMRegex:RegExp = /경력 (\d+)~(\d+)년/;
    const overN:RegExp = /경력(\d+)년↑/;
    if(exp.includes("경력무관"))expList.push("경력무관");
    if(exp.match(nToMRegex)){
        const match:RegExpMatchArray|null = exp.match(nToMRegex);
        if(match!==null){
            const n:number = parseInt(match[1]);
            const m:number = parseInt(match[2]);
            for(let i:number=n; i<=m; i++) {
                if(i<10) expList.push(`0${i}년`);
                else expList.push(`${i}년`);
            }
        }
    }
    if(exp.match(overN)){
        const match:RegExpMatchArray|null  = exp.match(overN);
        if(match!==null) {
            const n: number = parseInt(match[1]);
            for (let i:number = n; i <= 10; i++){
                if(i<10) expList.push(`0${i}년`);
                else expList.push(`${i}년`);
            }
        }
    }
    if(exp.includes("신입·경력")){expList.push("신입");expList.push("경력");}
    else if(exp.includes("신입")){expList.push("신입");}
    if(expList.length===0) expList.push(`정규화 되지 않은 경력 ${exp}`);
    return expList;
}
// 경력 조건이 충족하는가
const expOk = (exp:string,myExp:string,expAllOk:boolean) =>{
    if(myExp=="전부") return true;
    if(expAllOk===true&&exp.includes("경력무관"))return true;
    if(myExp==="신입"&&exp.includes("신입"))return true;
    if(exp.includes(`${myExp}년`)) return true;
    return false;
}
// 회사이름에서 (주),주식회사 같은 내용이랑 띄어쓰기 제거하기
const companyReNamed = (company:string) : string=>{
    let companyName = company.replace("㈜","");
    companyName = companyName.replace("(주)","");
    companyName = companyName.replace("주식회사","");
    companyName = companyName.replace(/ /gi,"");
    return companyName;
}
//DB 데이터에서 월/일 추출
const dateArr = (date:string):number[]=>{
    const regex = /\d+/g;
    const matches = date.match(regex) || [];
    return matches.map(Number);
}
//endDate에서 지원 문구제외
const endDateS = (endDate:string):string=>{
    endDate.replace("입사지원","");
    endDate.replace("홈페이지 지원","");
    return endDate;
}

module.exports = {hasElement,hasURL,hasNextPage,exps,expOk,companyReNamed,dateArr,endDateS}