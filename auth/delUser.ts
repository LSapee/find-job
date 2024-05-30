const { CognitoIdentityProviderClient, AdminDeleteUserCommand } = require("@aws-sdk/client-cognito-identity-provider");
const {getEmail,getUserId,getUserName,delUser} = require("../Repository/user.Repository");
//유저 삭제
const deleteUser = async (accessToken:string):Promise<boolean>=>{
    const client = new CognitoIdentityProviderClient({
        region: 'ap-northeast-2',
        credentials: {
            accessKeyId: process.env.AWS_COGDEL_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_COGDEL_SECRET_ACCESS_KEY,
        }
    });
    const email =await getEmail(accessToken);
    const userId:number = await getUserId(email);
    const UserName = await getUserName(userId);
    const params = {
        UserPoolId: process.env.COGNITO_USER_POOL_ID, // User Pool ID
        Username: UserName
    };
    const command = new AdminDeleteUserCommand(params);
    try {
        await client.send(command);
        await delUser(userId);
    } catch (error) {
        console.error('회원탈퇴 중 오류가 발생했습니다:', error);
        return false;
    }
    return true;
}

module.exports={deleteUser}