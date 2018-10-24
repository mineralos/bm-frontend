export function getStorage(name) {
    if (typeof (Storage) !== 'undefined') {
      return localStorage.getItem(name)
    } else {
      return null;
    }
  }

export function setStorage(name, val) {
  if (typeof (Storage) !== 'undefined') {
    localStorage.setItem(name, val)
  } else {
    return null;
  }
}

export function deleteStorage(name) {
  if (typeof (Storage) !== 'undefined') {
    localStorage.removeItem(name);
  }
}

export function formatUpTime(timestamp)
{
    var time = new Date(timestamp);
    var days=Math.floor(time/(24*3600*1000));
    var leave1=time%(24*3600*1000);
    var hours=Math.floor(leave1/(3600*1000));
    var leave2=leave1%(3600*1000);
    var minutes=Math.floor(leave2/(60*1000));
    var leave3=leave2%(60*1000);
    var seconds=Math.round(leave3/1000);
    var daysText="";
    var hoursText="";
    var minutesText="";
    if (days>0)
      daysText=days+'d ';
    if (hours>0)
      hoursText=hours+'h ';
    if (minutes>0)
      minutesText=minutes+'m';
    if (days==0&&hours==0&&minutes==0&&seconds>0)
        return seconds+'s'
    return daysText+hoursText+minutesText;
}

export function convertHashRate(hashRate) {
    if (hashRate<1000) {
        return hashRate.toFixed(2)+' MH/s';
    } else if (hashRate>=1000 && hashRate<1000000) {
        return (hashRate/1000).toFixed(2)+' GH/s ';
    } else if (hashRate>=1000000) {
        return (hashRate / 1000000).toFixed(2) + ' TH/s ';
    }
}
export function parseQueryString(url)
{
    var obj={};
    var keyvalue=[];
    var key="",value="";
    var paraString=url.split("&");
    for(var i in paraString)
    {
        keyvalue=paraString[i].split("=");
        key=keyvalue[0];
        value=keyvalue[1];

        obj[key]=value;
    }
    return obj;
}
export function isUrlValid(url) {
  return /^(https?|stratum\+tcp|tcp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
}

export function isValidIP(ip) {
    var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    return reg.test(ip);
}

export function isValidNetMask(mask)
{
    var exp=/^(254|252|248|240|224|192|128|0)\.0\.0\.0|255\.(254|252|248|240|224|192|128|0)\.0\.0|255\.255\.(254|252|248|240|224|192|128|0)\.0|255\.255\.255\.(254|252|248|240|224|192|128|0)$/;
    var reg = mask.match(exp);
    if(reg==null)
    {
        return false; //"非法"
    }
    else
    {
        return true; //"合法"
    }
}
export function generateUrlEncoded(fields) {
  var formBody = [];
  Object.keys(fields).forEach(function(index)  {
    var encodedKey = encodeURIComponent(index);
    var encodedValue = encodeURIComponent(fields[index]);
    formBody.push(encodedKey + "=" + encodedValue);
  });
  return formBody.join("&");
}
