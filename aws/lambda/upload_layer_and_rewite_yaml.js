const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-northeast-1' });
const lambda = new AWS.Lambda();
const s3 = new AWS.S3();
const fs = require('fs');

/**
 * sleep処理
 */
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

module.exports.handler  = async (layerName, param) => {  // 関数を作成
  /**
   * Zip圧縮
   */
  process.chdir('opt');
  const {exec} = require('child_process');

  let zipFileName = `./zip/${layerName}.zip`;
  exec(`zip -r ${zipFileName} ./${layerName}`, (err, stdout, stderr) => {
      if (err) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    }
  );
  let s3BucketName = 'lambda.zip-files';
  let s3KeyPath = `${param.service_name}/layer/${layerName}.zip`;
  await sleep(5000);
  {
    // S3にアップロード
    try {
      let fileContent = await fs.readFileSync(zipFileName);
      let s3Params = {
        Bucket: s3BucketName,
        Key: s3KeyPath,
        Body: fileContent,
      };
      console.log(s3Params);
      await s3.upload(s3Params).promise();
    } catch (e) {
      console.log(e);
    }
  }
  let lambdalayerName = `test_${layerName}`;
  let lambdalayerVersion = 0;
  {
    // Layerに追加する
    const param = {
      Content: {
        S3Bucket: s3BucketName,
        S3Key: s3KeyPath,
      },
      LayerName: lambdalayerName,
      CompatibleRuntimes: ['nodejs14.x'],
    };
    console.log(param);
    let res = await lambda.publishLayerVersion(param).promise();
    console.log(res.LayerVersionArn);
    lambdalayerVersion = res.LayerVersionArn.split(':').pop();
  }
  {
    for (let no in param.layers) {
      let index = param.layers[no].indexOf(lambdalayerName);
      if (index < 0) {
        continue;
      }
      const regex = /:\d*$/i;
      console.log(no);
      param.layers[no] = param.layers[no].replace(regex, `:${lambdalayerVersion}`);
    }
    process.chdir('..');
  }

};
