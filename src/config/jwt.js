/** @type {{issuer:string,secret:string,audience:string,alg:string,idTokenExp:number,accessTokenExp:number}} */
module.exports = {
  issuer: 'hoavo.kr.com', // must be loaded from env
  secret: '5f8400a0b199306c8e92d71ac11cb1fd9f0db6cff200e54eb08f036271e54d62', // must be loaded from env
  audience: undefined, // must be loaded from env
  alg: 'HS256',
  idTokenExp: 60 * 60 * 5,
  accessTokenExp: 60 * 60
};
