const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-northeast-1' });
const lambda = new AWS.Lambda();
const fs = require('fs');
var archiver = require('archiver');
const s3 = new AWS.S3();

/**
 * sleep処理
 */
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

/**
 * 関数名フォルダをzipファイルに圧縮→S3にアップロード→zipファイルを
 */
module.exports.handler  = async (func, param) => {  // 関数を作成
  // zip圧縮
  await zipArchive(func.name);
  await sleep(1000);

  // s3にアップロード
  let zipFilePath = `./functions/zip/${func.name}.zip`;
  let fileContent = await fs.readFileSync(zipFilePath);
  let s3Key = `${param.service_name}/functions/${func.name}.zip`;
  let s3Params = {
    Bucket: param.s3.bucket_name,
    Key: s3Key,
    Body: fileContent,
  };
  await s3.upload(s3Params).promise();

  // s3にあるファイルをlambdaに更新する
  let lambdaParam = {
    FunctionName: func.name,
    S3Bucket: param.s3.bucket_name,
    S3Key: s3Key,
  };
  console.log(lambdaParam);
  await lambda.updateFunctionCode(lambdaParam).promise();
};

/**
 * zip圧縮をする
 */
const zipArchive = async functionName => {
  let zipFilePath = `./functions/zip/${functionName}.zip`;
  const output = fs.createWriteStream(zipFilePath);
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });
  archive.pipe(output);
  let indexFilePath = `./functions/${functionName}/index.js`;
  await archive.append(fs.createReadStream(indexFilePath), {
    name: 'index.js',
  });
  await archive.finalize();
};
