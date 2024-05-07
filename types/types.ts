export type MyList = {
    company :string
    postTitle :string
    exp : string[]|string
    edu : string
    loc : string
    skillStacks : string
    endDate : string
    postURL :string|boolean
}
type Identity ={
    dateCreated?: string; // 옵셔널로 변경
    userId?: string; // 옵셔널로 변경
    providerName?: string; // 옵셔널로 변경
    providerType?: string; // 옵셔널로 변경
    issuer?: null | string; // 옵셔널로 변경
    primary?: string; // 옵셔널로 변경
}
export type idTokenType ={
    at_hash: string;
    sub: string;
    "cognito:groups"?: string[];
    email_verified: boolean;
    iss: string;
    "cognito:username": string;
    origin_jti: string;
    aud: string;
    nonce?:string;
    identities?: Identity[];
    token_use: string;
    auth_time: number;
    name: string;
    exp: number;
    iat: number;
    jti: string;
    email: string;
    event_id?: string;
    given_name:string;
}
export type accessTokenType = {
    sub: string;
    "cognito:groups"?: string[];
    iss: string;
    version: number;
    client_id: string;
    origin_jti: string;
    token_use: string;
    scope: string;
    auth_time: number;
    exp: number;
    iat: number;
    jti: string;
    username: string;
    error?: string;
}

export type userLoggedIn = {
    sign : boolean;
    access_token: string;
}

/*
* company = 회사명
* postTitle = 공고명
* exp = 경력 n~m년 배열
* edu = 학력
* loc = 지역
* skillStacks = 기술스택
* endDate = 채용 마감일
* postURL = URL
* */