const { By } = require('selenium-webdriver');

// 해당 태그가 존제하는지
const hasElement = async (myElement,myTag)=>{
    let ans = "";
    try{
        ans = await myElement.findElement(By.css(`${myTag}`)).getText();
    }catch(e){
    }
    return ans;
}
//URL이 존재하는지 확인
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

// 에러 확인용
const hasError = (myList) =>{
    console.log("에러가 있는지 검사를 시작합니다.");
    myList.forEach(item =>{
        if(item.error ==="검색 결과가 없습니다.") {
            console.log("에러 발생했다");
            return true;
        }
    })
    console.log("에러가 검출되지 않았습니다.");
    return false;
}

module.exports = {hasElement,hasURL,hasNextPage,hasError}