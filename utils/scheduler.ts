const cron = require("node-cron");
const {findKeywords,postDel} = require("../Repository/crawler.Repository")
const {jobKCrawler,saramInCrawler} =  require("../crawler/crawler")
import { EC2Client, StartInstancesCommand ,StopInstancesCommand} from "@aws-sdk/client-ec2";

const awsRegion:string = process.env.AWS_REGION as string;
const awsInstanceId:string = process.env.AWS_EC2_INSTENT_ID as string;
console.log(awsInstanceId)
// EC2Client 객체 생성
const ec2Client = new EC2Client({ region: awsRegion });

// EC2 인스턴스 시작 요청
const params = {
    InstanceIds: [awsInstanceId], // 시작할 인스턴스의 ID
};

const startCommand = new StartInstancesCommand(params);
const stopCommand = new StopInstancesCommand(params);

export const ec2Start = async  () =>{
    try{
        ec2Client.send(startCommand)
            .then((data) => {
                console.log("인스턴스 시작 요청 : ", data);
            })
            .catch(err => {
                console.error("인스턴스 시작 중 오류 발생:", err);
            });
    }catch (e){
        console.log("e",e);
    }
}
export const ec2Stop = async  () =>{
    try {
        ec2Client.send(stopCommand)
            .then((data) => {
                console.log("인스턴스 중지 요청 : ", data);
            })
            .catch(err => {
                console.error("인스턴스 중지 중 오류 발생:", err);
            });
    }catch (e){
        console.log("e",e);
    }
}

export const ec2StartTimet = async ()=>{
    cron.schedule(("53 22 * * *"), async () =>{
        ec2Start();
    })
}
export const ec2StopTimet = async ()=>{
    cron.schedule(("0 23 * * *"), async () =>{
        ec2Stop();
    })
}

// 분 시 일 월 요일
// export const crawlingScheduler = async ()=>{
//     cron.schedule(("0 0 * * *"), async () =>{
//         await postDel();
//         const keywords : string[] = await findKeywords();
//         for(const item of keywords){
//             const resultJok = await jobKCrawler(item);
//             const resultSaramIn = await saramInCrawler(item);
//             console.log(`크롤링 resultJob ${item}:`, resultJok );
//             console.log(`크롤링 resultSaramIn ${item}:`, resultSaramIn );
//         }
//     })
// }