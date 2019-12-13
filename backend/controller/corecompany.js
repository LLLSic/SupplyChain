const utils = require('../api/common/web3lib/utils');
const contractAddress = require('./config').contractAddress;
const web3 = require('./config').web3;

const coreCompanyControl = {
    getUnsignedRec : ()=>{
        return web3.call(contractAddress,"getUnsignedRec()",[])
                .then((res)=>{
                    try{
                        // console.log(res)
                        let result = utils.decodeParams(['uint256[]'],res.result.output)
                        let final = result['0']
                        console.log(final)
                        return Promise.resolve(final)
                    }
                    catch(err){
                        return Promise.reject(err)
                    }
                })
    },

    

    signRec: (index,acceptOrNot)=>{
        return web3.sendRawTransaction(contractAddress,"signRec(uint256,bool)",[index,acceptOrNot])
                .then(res =>{
                    try{
                        // console.log(res)
                        let result = utils.decodeParams(['bool'],res.output)
                        let final = {
                            "success":result['0'],
                            "details":result['0']?"Successful":"Not receipt for you"
                        }
                        console.log(final)
                        return Promise.resolve(final)
                    }
                    catch(err){
                        return Promise.reject(err)
                    }
                })
    }
}


module.exports = coreCompanyControl;
// coreCompanyControl.signRec(0,true)

// coreCompanyControl.getUnsignedRec();

// companyControl.uploadReceipt("0x43ed12399576540c80b3be1525e15897318ee044","0xa4fb3713c647fb79fa3a5ed057bcac99f1c635b9",1000000,Date.now()*1000+10000)

