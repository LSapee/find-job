import fetch from "node-fetch";
import qs from "qs";
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import {DecodedTokenType} from '../types/myList';

const COGNITO_ISSUER = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`;

const getToken =async (code:string):Promise<string|null> =>{
    let data;
    const params = qs.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.CLIENT_ID,
        redirect_uri: process.env.REDIRECT_URI,
        code: code,
    });
    const tokenUrl = `${process.env.MYURL}/oauth2/token`;
    try {
        const response = await fetch(tokenUrl, {
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
type VerifyResult = DecodedTokenType | string | undefined;
const verifyToken = async (token:string|null):Promise<VerifyResult|false> =>{
    if(token===null) return false;
    return new Promise((resolve, reject) => {
        jwt.verify(token, getKey, {
            issuer: process.env.JWKSURI,
            algorithms: ['RS256']
        }, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded as DecodedTokenType);
            }
        });
    });
};

module.exports={getToken,verifyToken}
