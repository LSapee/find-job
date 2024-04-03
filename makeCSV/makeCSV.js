import fs from "fs";
import path from "path";

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