import * as jwt from "jsonwebtoken";
import {accessTokenType} from "../types/types";
const {getKey} = require("../auth/auth");
const {getRefreshToken,updateAccessToken,deleteRefreshToken} = require("../Repository/user.Repository");

const tokenEndpoint = `${process.env.MYURL}/oauth2/token`;
interface TokenResponse {
    accessToken: string|boolean;
    decoded?: VerifyAccessTokenResult;
}
interface isLoggedInResponse{
    accessToken: string;
    sign :boolean
    decodeData?: VerifyAccessTokenResult;
}
type VerifyAccessTokenResult = accessTokenType | string | undefined;

const verifyAccessToken = async (token:string|null):Promise<TokenResponse|false> =>{
    if(token===null) return false;
    return new Promise((resolve, reject) => {
        jwt.verify(token, getKey, {
            issuer: process.env.JWKSURI,
            algorithms: ['RS256']
        }, async (err, decoded) => {
            if (err) {
                try {
                    console.log("accessToken 오류 있음")
                    // 리프레시 토큰 가져오기
                    const refreshToken = await getRefreshToken(token);
                    console.log("refreshToken",refreshToken)
                    const client_id = process.env.CLIENT_ID;
                    if (client_id !== undefined) {
                        const response = await fetch(tokenEndpoint, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: new URLSearchParams({
                                'grant_type': 'refresh_token',
                                'client_id': client_id,
                                'refresh_token': refreshToken,
                            }),
                        });
                        const data = await response.json();
                        console.log("data",data)
                        if (response.ok) {
                            // 새 엑세스 토큰 디코드
                            console.log("refreshToken으로 엑세스 토큰 발급 성공")
                            const newDecoded = jwt.decode(data.access_token) as accessTokenType;
                            await updateAccessToken(refreshToken, data.access_token);
                            resolve({accessToken: data.access_token, decoded: newDecoded});
                        }else {
                            await deleteRefreshToken(refreshToken);
                            console.log("리프레시 토큰 삭제")
                            reject(false); // API 오류 처리
                        }
                    }
                } catch (error) {
                    console.error("error",error)
                    reject(false);  // 네트워크 오류 처리
                }
            } else {
                resolve({ accessToken: token, decoded: decoded as accessTokenType });
            }
        });
    });
};

const isLoggedIn = async (access_token:string):Promise<isLoggedInResponse|null> => {
    const tokenData = await verifyAccessToken(access_token).catch(e=>{
        console.log("tokenData Error : ",e);
        return e;
    });
    console.log("tokenData",tokenData)
    let myTokenisError = false;
    if (!tokenData) return ({accessToken: access_token, sign: myTokenisError})
    else if (tokenData === undefined) {
        // 토큰 데이터를 찾을 수 없음. => 쿠키에 토큰 자체가 없음.
        return ({accessToken: access_token, sign: myTokenisError})
    } else {
        if((tokenData.decoded as accessTokenType).error === undefined){
            myTokenisError =true;
        }
    }
    return ({accessToken: access_token, sign :myTokenisError,decodeData : tokenData.decoded })
}
module.exports = {isLoggedIn}