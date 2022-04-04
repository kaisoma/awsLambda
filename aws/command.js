const addFunction = require('./lambda/add_function')
const updateLayer = require('./lambda/upload_layer_and_rewite_yaml');
const setLayer = require('./lambda/set_layer');
const upFunction = require('./lambda/upload_function');
const deploy = require('./lambda/deploy_latest_version');
const rollback = require('./lambda/rollebak_prod_version');
const path = require('path');

const PARAM_PATH = './param.yaml';

/**
 * 指定されたパスの Yaml ファイルを読み込みます。
 */
function loadYamlFile (filename) {
  try {
    const fs = require('fs');
    const yaml = require('js-yaml');
    const yamlText = fs.readFileSync(filename, 'utf8');
    return yaml.load(yamlText);
  } catch (err) {
    console.error(err.message);
  }
}

/**
 * 指定されたパスの Yaml ファイルを保存します
 */
function saveYamlFile (filePath, data) {
  try {
    const fs = require('fs');
    const yaml = require('js-yaml');
    const yamlText = yaml.dump(data);
    fs.writeFileSync(filePath, yamlText, 'utf8');
  } catch (err) {
    console.error(err.message);
  }
}

(async () => {
  let argvName = process.argv[3];
  console.log(process.argv[2]);
  let param = loadYamlFile(path.resolve(__dirname, PARAM_PATH ));
  let isSave = false;

  switch (process.argv[2]) {
    case 'add_function':
      await addFunction.handler(argvName, param);
      isSave = true;
      break;
    case 'upload_function':
      await roopFunctions(upFunction.handler, argvName, param);
      break;
    case 'set_layer':
      await roopFunctions(setLayer.handler, argvName, param);
      break;
    case 'deploy':
      await roopFunctions(deploy.handler, argvName, param);
      break;
    case 'rollback':
      await roopFunctions(rollback.handler, argvName, param);
      break;
    case 'upload_layer':
      await updateLayer.handler(argvName, param);
      isSave = true;
      break;
    default:
      console.log('Adding functions to lambda: $node aws/command.js add_function [function_name]');
      console.log('Upgrade the lambda layer: $node upload_layer [layer_name]');
      console.log('Configure all lambda functions in the configuration file: $node set_function');
      console.log('Configure a lambda function: $node upload_function [function_name]');
      console.log('Set in a layer of all lambda functions in the configuration file: $node upload_function');
      console.log('Set in a layer of lambda function: $node upload_function [function_name]');
      console.log('Deploy all lambda functions in the configuration file: $node deploy');
      console.log('Deploy a lambda function: $node deploy [function_name]');
      console.log('Deploy all lambda functions in the configuration file: $node rollback');
      console.log('Deploy a lambda function: $node rollback [function_name]');
      break;
  }
  if (isSave) {
    saveYamlFile(path.resolve(__dirname, PARAM_PATH), param);
  }
})();

/**
 * yamlファイル内のfunctionsをループする
 */
async function roopFunctions (handler, argvFunctionName, param) {
  const funcLength = param.functions.length;
  for (let i in param.functions) {
    let func = param.functions[i];
    let funcNo = parseInt(i) + 1;
    if (isSkip(func.is_set, param.is_set_all, func.name, argvFunctionName)) {
      continue;
    }
    console.log('--------------------------------------');
    console.log(`  ${funcNo} / ${funcLength}`);
    console.log(func.name);
    await handler(func, param);
  }
}

/**
 * 処理をスキップする関数か否か
 */
function isSkip (isSet, isSetAll, functionName, argFunctionName) {
  // 引数に関数名が指定されている場合、指定した関数以外はスキップ対象とする
  if (argFunctionName === undefined) {
    //yaml内の設定値をみてスキップ対象か否かを判定する
    if (isSetAll === false && isSet === false) {
      return true;
    }
  } else {
    if (functionName !== argFunctionName) {
      return true;
    }
    return false;
  }
}
