function checkProps(data,props){
    for(var i = 0;i<props.length ; i++){
        if(!Object.prototype.hasOwnProperty.call(data,props[i]))
            return[false,props[i]];
    }
    return [true];
}

module.exports.checkProps = checkProps;