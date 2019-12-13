
function Str2Bytes(str)
{
    var pos = 0;
    var len = str.length;
    if(len %2 != 0)
       return null; 
    len /= 2;
    var hexA = new Array();
    for(var i=0; i<len; i++)
    {
        var s = str.substr(pos, 2);
       var v = parseInt(s, 16);
       hexA.push(v);
       pos += 2;
    }
    // console.log(hexA)
    return hexA; 
}


module.exports.bytes2str = function(byteStr){
    var arr = Str2Bytes(byteStr);
    var str = '',
    _arr = arr;
    for(var i = 0; i < _arr.length; i++) {
        var one = _arr[i].toString(2);
        if(one != "0"){
            var v = one.match(/^1+?(?=0)/);
            if(v && one.length == 8) {
                var bytesLength = v[0].length;
                var store = _arr[i].toString(2).slice(7 - bytesLength);
                for(var st = 1; st < bytesLength; st++) {
                    store += _arr[st + i].toString(2).slice(2);
                }
                str += String.fromCharCode(parseInt(store, 2));
                i += bytesLength - 1;
            } else {
                str += String.fromCharCode(_arr[i]);
            }
        }
    }
    // console.log(str)
    return str;
}

module.exports.extract = function(data,props,isBytes){
    if(!Object.prototype.hasOwnProperty.call(data,props[0]))
        return false;
        let size = data[props[0]].length;
    let result = [];
    try{
        for (let i = 0; i < size;i++){
            let item = {};
            for(let j = 0; j < props.length;j++){
                item[props[j]] = data[props[j]][i];
                if(isBytes&&isBytes[j])
                    item[props[j]] = exports.bytes2str(item[props[j]].substr(2));
            }
            result.push(item);
        }
        return result;
    }
    catch(err){
        console.log(err);
        return false;
    }
}

// this.bytes2str('e5beaee4bc970000000000000000000000000000000000000000000000000000');