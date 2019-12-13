const utils = require('../api/common/web3lib/utils');
const contractAddress = require('./config').contractAddress;
const web3 = require('./config').web3;

module.exports.invite = function(address,name){
    return web3.sendRawTransaction(contractAddress,"addNormalCompany(address,string)",[address,name])
            .then(function(res){
                try{
                    if(res.status!="0x0")return Promise.reject("Failed!Please check data!");
                    console.log(res)
                    let result = utils.decodeParams(['bool'],res.output)
                    let final = {
                        "success":result['0'],
                        "detail":result['0']?"Successful":"Failed!Please check data!"
                    }
                    console.log(final)
                    return Promise.resolve(final)
                }catch(err){
                    return Promise.reject(err)
                }
            })
}