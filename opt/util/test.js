const dayjs = require('../node_modules/dayjs');
const dayje_timezone = require('../node_modules/dayjs/plugin/timezone');
const dayje_utc = require('../node_modules/dayjs/plugin/utc');
const dayje_iso = require('../node_modules/dayjs/plugin/isoWeek');
const dayje_parse = require('../node_modules/dayjs/plugin/customParseFormat');
const gmt = 'Etc/GMT';
const jst = 'Asia/Tokyo';

function getDayjs (date = undefined, orgTz = gmt, destTz = gmt, isKeep = false) {
  let day = null;
  if (date === undefined) {
    day = dayjs().tz(orgTz, isKeep);
  } else if (date === '') {
    day = dayjs().tz(orgTz, isKeep);
  } else if (date === null) {
    day = dayjs().tz(orgTz, isKeep);
  } else {
    day = dayjs.tz(date, orgTz);
  }
  return day.tz(destTz, isKeep);
}

/**
 * タイムゾーンを取得する
 * デフォルト：JST
 */
module.exports.getTimeZone = timezone => {
  if (timezone === undefined) {
    return jst;
  } else if (timezone === '') {
    return jst;
  } else if (timezone) {
    return timezone;
  }
  return jst;
};

/**
 * 現在時刻の文字列を取得する(GMT)
 * 例：2020-08-15T12:34:56Z
 */
module.exports.getStrTime = (date, orgTz = gmt, destTz = gmt) => {
  let day = getDayjs(date, orgTz, destTz);
  return day.format();
};
