import fetch from "node-fetch";
import qs from "qs";
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import {idTokenType,accessTokenType} from '../types/types';
const {getRefreshToken,deleteRefreshToken,updateAccessToken} = require("../Repository/user.Repository");

const COGNITO_ISSUER = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`;
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

const getToken =async (code:string):Promise<string|null> =>{
    let data;
    const params = qs.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.CLIENT_ID,
        redirect_uri: process.env.REDIRECT_URI,
        code: code,
    });
    try {
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });
        data = await response.json();
        return data;
    } catch (error) {
        data = null;
        console.error('Error converting authorization code to token:', error);
    }
    return data;
}
// 서명 키 가져오기
const getKey = (header:jwt.JwtHeader, callback:jwt.SigningKeyCallback):void=>{
    const client =  new JwksClient({
        jwksUri: `${COGNITO_ISSUER}/.well-known/jwks.json`
    });
    client.getSigningKey(header.kid, (err, key) => {
        if(err) {
            return callback(err);
        }
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
    });
}

// 토큰 검사
type VerifyIdTokenResult = idTokenType | string | undefined;
// ID 토큰 검사
const verifyIdToken = async (token:string|null):Promise<VerifyIdTokenResult|false> =>{
    if(token===null) return false;
    return new Promise((resolve, reject) => {
        jwt.verify(token, getKey, {
            issuer: process.env.JWKSURI,
            algorithms: ['RS256']
        },  (err, decoded) => {
            if (err) {
                reject(err); // 네트워크 오류 처리
            } else {
                resolve(decoded as idTokenType);
            }
        });
    });
};
type VerifyAccessTokenResult = accessTokenType | string | undefined;
// 엑세스토큰 검사
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
                    const refreshToken = await getRefreshToken(token);
                    console.log("refreshToken 존재 여부",refreshToken)
                    const response = await fetch(tokenEndpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ refresh_token: refreshToken })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        // 새 엑세스 토큰 디코드
                        const newDecoded = jwt.decode(data.access_token)as accessTokenType;
                        await updateAccessToken(refreshToken,data.access_token);
                        console.log("accessToken 재발급 완료")
                        resolve({accessToken: data.access_token, decoded: newDecoded} );
                    } else {
                        await deleteRefreshToken(refreshToken);
                        reject(false ); // API 오류 처리
                    }
                } catch (error) {
                    reject(false);  // 네트워크 오류 처리
                }
            } else {
                resolve({ accessToken: token, decoded: decoded as accessTokenType });
            }
        });
    });
};

const isLoggedIn = async (access_token:string):Promise<isLoggedInResponse> => {
    const tokenData = await verifyAccessToken(access_token).catch(e=>{return null});
    let myTokenisError = false;
    if(!tokenData) return ({accessToken: access_token, sign :myTokenisError})
    else if(tokenData===undefined){
        return ({accessToken: access_token, sign :myTokenisError})
    }else{
        if((tokenData.decoded as accessTokenType).error === undefined){
            myTokenisError =true;
        }
    }
    return ({accessToken: access_token, sign :myTokenisError,decodeData : tokenData.decoded })

}

module.exports={getToken,verifyIdToken,verifyAccessToken,isLoggedIn}
