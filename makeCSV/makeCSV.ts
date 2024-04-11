import fs from "fs";
import path from "path";
import {MyList} from "../types/myList";

const makeCSV = (targetSite:string,myList:MyList[]):void=>{
    let csvContent:string = "회사명,공고제목,경력,학력,지역,기술스택,마감일,링크\n";
    let fileName = targetSite;
    if(targetSite==="jobK"){
        myList.forEach(item=>{
            let row = `"${item.company}","${item.postTitle}","${item.exp}","${item.edu}","${item.loc}","${item.skillStacks}","${item.endDate}","${item.postURL}"`;
            csvContent += row + '\n';
        })
    }else{
        myList.forEach(item=>{
            let row = `"${item.company}","${item.postTitle}","${item.exp}","${item.edu}","${item.loc}","${item.skillStacks}","${item.endDate}","${item.postURL}"`;
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