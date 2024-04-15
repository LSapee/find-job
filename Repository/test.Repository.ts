import {prisma} from "./prismaDB";
import {MyList} from "../types/myList";

async function crawlerRepository(Mylists:MyList[],keyWord:string):Promise<string> {
    let ans :string = "성공"
    try{
        // 키워드 ID 찾기
        const keyWordFind = await prisma.keywords.findFirst({
            where:{
                keyword:keyWord
            }
        })
        // 키워드 없을시 에러 발생시켜서 처리
        if(keyWordFind===null){
            throw new Error("키워드가 없어");
        }
        const keywordId:number = keyWordFind.id;
        for (const item of Mylists) {
            // 해당 url 있는지 확인
            const okData = await prisma.job_Posting.findFirst({
                where :{
                    link: item.postURL.toString()
                }
            })
            // url이 이미 존재한다면
            if(okData!==null){
                const postId = okData.id
                // 검색한 키워드가 해당 url과 연결되어있는지 확인
                const keywordIn  = await prisma.job_Keywords.findFirst({
                    where:{
                        posting_id:postId,
                        keyword_id:keywordId
                    }
                })
                // 연결되어 있지 않다면 연결
                if(keywordIn===null){
                    await prisma.job_Keywords.create({
                        data:{
                            posting_id:postId,
                            keyword_id:keywordId
                        }
                    })
                }else{
                    //연결되어있으면 그냥 건너뛰기
                    continue;
                }
            }else{
                // 새로운 글 등록하기
                const thisPost = await prisma.job_Posting.create({
                    data: {
                        company_name :item.company,
                        title :item.postTitle,
                        experience_level:item.exp.toString(),
                        education_level :item.edu,
                        tech_stack :item.skillStacks,
                        closing_date:item.endDate,
                        link:item.postURL.toString(),
                    }
                })
                // 해당 글과 키워드를 연결하기
                await prisma.job_Keywords.create({
                    data:{
                        posting_id:thisPost.id,
                        keyword_id:keywordId
                    }
                })
            }
        }
    }catch(e){
        console.log(e)
        ans ="실패";
    }finally{
        await prisma.$disconnect();
    }
    return ans;
}
module.exports = {crawlerRepository}

