const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-northeast-1' });
const lambda = new AWS.Lambda();
const path = require('path');

/**
 * sleep処理
 */
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

/**
 * 関数を追加し、本番用とテスト用のエイリアスを作成する。
 */
module.exports.handler  = async (functionName, param) => {  // 関数を作成
  // param.yamlファイルの読み込み
  const paramAddFunction = {
    FunctionName: functionName,           //関数名
    Runtime: param.add_function.runtime,   //実行ラインタイム
    Role: param.add_function.role,         //arn
    Handler: param.add_function.handler,   //実行ファイル名
    Code: {
      S3Bucket: param.s3.bucket_name,       //S3バケット名
      S3Key: param.add_function.s3_key,    //バケット内のパス
    },
  };
  console.log(paramAddFunction);
  try {
    await lambda.createFunction(paramAddFunction).promise();
    await sleep(3000);
    // バージョンを作成
    const paramVersion = {
      FunctionName: functionName,
      Description: 'created at ' + Date(),
    };
    let ret = await lambda.publishVersion(paramVersion).promise();
    const version = ret.FunctionArn.split(':').pop();
    console.log(`publish version ${functionName}:${version}`);

    /**
     * エイリアスを作成
     */
    // prod
    await addAlias({
      funcName: functionName,
      version: version,
      aliasName: param.alias.prod,
    });
    // stg
    await addAlias({
      funcName: functionName,
      version: param.version.latest,
      aliasName: param.alias.stg,
    });
    let paramNewFunction = {
      is_set: true,
      name: functionName,
    }
    // param.yamlから読み込んだ情報に、新しい関数情報を追加
    param.functions.push(paramNewFunction);

  } catch (e) {
    console.log(e);
  }
};


/**
 * エイリアスを追加する
 * すでにエイリアスがある場合、エラーを出力する
 */
async function addAlias({ funcName, version, aliasName }) {
  const param = {
    FunctionName: funcName,
    FunctionVersion: version,
    Name: aliasName,
  };
  await lambda.createAlias(param).promise();
  console.log(`add alias ${aliasName}`);
}
