const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-northeast-1' });
const lambda = new AWS.Lambda();

/**
 * 現在のLambda上にあるデータで新しいバージョンを作成し、作成したバージョンを本番エイリアスに適用する
 */
module.exports.handler  = async (func) => {  // 関数を作成
  const paramVersion = {
    FunctionName: func.name,
    Description: Date(),
  };
  // バージョンを切る
  let ret = await lambda.publishVersion(paramVersion).promise();
  const version = ret.FunctionArn.split(':').pop();
  console.log(`publish version ${func.name}:${version}`);

  /**
   * 最新バージョンにエイリアス「prod（本番用）」を設定する
   */
  const paramAlias = {
      FunctionName: func.name,
      FunctionVersion: version,
      Name: 'prod',
    };
  await lambda.updateAlias(paramAlias).promise();
  console.log(`Alias:prod set to ${func.name}:${version}`);
};
