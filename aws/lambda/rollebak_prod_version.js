const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-northeast-1' });
const lambda = new AWS.Lambda();

module.exports.handler  = async (func) => {  // 関数を作成
  /**
   * 関数の最新バージョンを取得し、1つ前のバージョンを特定する
   */
  const param_version = {
    FunctionName: func.name,
  };
  let ret = await lambda.publishVersion(param_version).promise();
  let version = ret.FunctionArn.split(':').pop();
  let targetVersion = Number(version) - 1;
  if (targetVersion === 0) {
    console.log('Cannot revert the version. Current version is 1.')
  }
  console.log(`publish version ${func.name}:${targetVersion}`);

  /**
   * ロールバック先のバージョンにエイリアス「prod（本番用）」を設定する
   */
    // 引数を設定
  const paramm_alias = {
      FunctionName: func.name,
      FunctionVersion: `${targetVersion}`,
      Name: 'prod',
    };
  await lambda.updateAlias(paramm_alias).promise();
  console.log(`Alias:prod set to ${func.name}:${targetVersion}`);
};
