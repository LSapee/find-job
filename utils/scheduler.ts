const cron = require("node-cron");
import {DescribeInstancesCommand, EC2Client, StartInstancesCommand} from "@aws-sdk/client-ec2";
const { exec } = require("child_process");

const awsRegion:string = process.env.AWS_REGION as string;
const awsInstanceId:string = process.env.AWS_EC2_INSTANCE_ID as string;
const awsAccessKey:string =process.env.AWS_ACCESS_KEY_ID as string;
const awsSecretAccessKey:string =process.env.AWS_SECRET_ACCESS_KEY as string;
const myPemKey:string = process.env.MY_PEM_KEY as string;
const credentials = {
    accessKeyId: awsAccessKey,
    secretAccessKey: awsSecretAccessKey
};

// EC2Client 객체 생성
const ec2Client = new EC2Client({ region: awsRegion ,credentials});

// EC2 인스턴스 시작 요청
const params = {
    InstanceIds: [awsInstanceId], // 시작할 인스턴스의 ID
};

// EC2 실행
const startEC2Instance= async() =>{
    const startCommand = new StartInstancesCommand(params);
    try {
        const start = await ec2Client.send(startCommand);
        console.log("인스턴스 시작 요청 : ", start);
        return true;
    } catch (err) {
        console.error("인스턴스 시작 중 오류 :", err);
        return false;
    }
}
//EC2 상태체크
const checkEC2InstanceState= async () =>{
    const command = new DescribeInstancesCommand(params);
    try {
        const data = await ec2Client.send(command);
        const state = data.Reservations?.[0]?.Instances?.[0]?.State?.Name;
        if (state) {
            console.log(`EC2 인스턴스 상태: ${state}`);
            return state === "running";
        } else {
            console.log("EC2 인스턴스 상태를 못 가져옴");
            return false;
        }
    } catch (err) {
        console.error("EC2 인스턴스 오류 발생 :", err);
        return false;
    }

}
// Ec2 실행 및 상태 확인
const ec2Start = async  () =>{
    try{
        const started = await startEC2Instance();
        if (started) {
            const running = await checkEC2InstanceState();
            if (running) {
                console.log("EC2 실행중");
            } else {
                console.log("EC2 실행중 아님.");
            }
        } else {
            console.log("EC2 인스턴스 시작 실패");
        }
    }catch (e){
        console.log("e",e);
    }
}
// EC2에서 pm2 실행
const startPm2OnEC2Instance = async ()=> {
    // SSH로 EC2 인스턴스에 연결하여 pm2를 실행
    const sshCommand = `ssh -i "${myPemKey}" ubuntu@${process.env.MY_INSTANCE_IP} "pm2 start ./find-job-craling-only/node_modules/.bin/ts-node --name "find-job" -- index.ts"`;
    exec(sshCommand, (error:any, stdout:any, stderr:any) => {
        if (error) {
            console.error(`pm2 실행 중 오류 발생: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`pm2 실행 중 에러: ${stderr}`);
            return;
        }
        console.log(`pm2 실행 결과: ${stdout}`);
    });
}
// EC2가 켜질 타이밍
export const ec2StartTimet = async ()=>{
    cron.schedule(("06 18 * * *"), async () =>{
        // await ec2Start();
        // setTimeout(async () => {
            await startPm2OnEC2Instance();
        // }, 2 * 60 * 1000);
    })
}
