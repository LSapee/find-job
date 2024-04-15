import fs from "fs";
import path from "path";
import {MyList} from "../types/myList";

const makeFile = (fileName:string,keyword:string,csvContent:string,cnt:number):void=>{
    fs.writeFile(path.join(__dirname, `${fileName}${keyword}0${cnt}.csv`), csvContent, 'utf8', (err) => {
        if (err) {
            console.log('파일 저장 중 오류가 발생했습니다:', err);
        } else {
            console.log('파일이 성공적으로 저장되었습니다.');
        }
    });
}

const csvContentClear = (fileName:string,keyword:string,csvContent:string,cnt:number):string=>{
    makeFile(fileName,keyword,csvContent,cnt)
    csvContent = "회사명,공고제목,경력,학력,지역,기술스택,마감일,링크\n";
    return csvContent;
}

export const makeCSV = (targetSite:string,myList:MyList[],keyword:string):void=>{
    let csvContent:string = "회사명,공고제목,경력,학력,지역,기술스택,마감일,링크\n";
    let fileName:string = targetSite;
    let count:number =0;
    let cnt:number =1;
    if(targetSite==="jobK"){
        myList.forEach(item=>{
            let row = `"${item.company}","${item.postTitle}","${item.exp}","${item.edu}","${item.loc}","${item.skillStacks}","${item.endDate}","${item.postURL}"`;
            csvContent += row + '\n';
            count++;
            if(count==400) {csvContent = csvContentClear(fileName,keyword,csvContent,cnt);count=0;cnt++;}
        })
        if(csvContent!=="회사명,공고제목,경력,학력,지역,기술스택,마감일,링크\n")makeFile(fileName,keyword,csvContent,cnt);
    }else{
        myList.forEach(item=>{
            let row = `"${item.company}","${item.postTitle}","${item.exp}","${item.edu}","${item.loc}","${item.skillStacks}","${item.endDate}","${item.postURL}"`;
            csvContent += row + '\n';
            count++;
            if(count==400) {csvContent = csvContentClear(fileName,keyword,csvContent,cnt);count=0;cnt++;}
        })
        if(csvContent!=="회사명,공고제목,경력,학력,지역,기술스택,마감일,링크\n")makeFile(fileName,keyword,csvContent,cnt);
    }

}


