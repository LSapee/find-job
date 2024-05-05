import fetch from "node-fetch";
import qs from "qs";
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import {idTokenType,accessTokenType} from '../types/types';
const {getRefreshToken} = require("../Repository/user.Repository");

const COGNITO_ISSUER = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`;
const tokenEndpoint = `${process.env.MYURL}/oauth2/token`;

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
const verifyIdToken = async (token:string|null):Promise<VerifyIdTokenResult|false> =>{
    if(token===null) return false;
    return new Promise((resolve, reject) => {
        jwt.verify(token, getKey, {
            issuer: process.env.JWKSURI,
            algorithms: ['RS256']
        }, async (err, decoded) => {
            if (err) {
                try {
                    const refreshToken = await getRefreshToken(token);
                    const response = await fetch(tokenEndpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ refresh_token: refreshToken })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        const newDecoded = jwt.decode(data.access_token); // 새 토큰 디코드
                        console.log('Decoded New Token:', newDecoded); // 디코드된 토큰 내용 출력
                        resolve(data.access_token); // 새 액세스 토큰 반환
                    } else {
                        reject(data); // API 오류 처리
                    }
                } catch (error) {
                    reject(error); // 네트워크 오류 처리
                }
            } else {
                resolve(decoded as idTokenType);
            }
        });
    });
};
type VerifyAccessTokenResult = accessTokenType | string | undefined;
const verifyAccessToken = async (token:string|null):Promise<VerifyAccessTokenResult|false> =>{
    if(token===null) return false;
    return new Promise((resolve, reject) => {
        jwt.verify(token, getKey, {
            issuer: process.env.JWKSURI,
            algorithms: ['RS256']
        }, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded as accessTokenType);
            }
        });
    });
};

module.exports={getToken,verifyIdToken,verifyAccessToken}
