const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-northeast-1' });
const lambda = new AWS.Lambda();

module.exports.handler  = async (func, data) => {  // 関数を作成
  const param_layer = {
    FunctionName: func.name,
    Timeout: func.timeout ? func.timeout : data.default.timeout,
    MemorySize: func.memorysize ? func.memorysize : data.default.memorysize,
    Layers: data.layers,
    Environment: data.environment,
    Runtime: 'nodejs14.x',
  };
  let res = await lambda.updateFunctionConfiguration(param_layer).promise();
  console.log(res);
};
