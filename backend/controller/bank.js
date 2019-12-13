var utils = require('../api/common/web3lib/utils');
const contractAddress = require('./config').contractAddress;
const web3 = require('./config').web3;
const extract = require('./method').extract;

const bankControl = {
    getAllRec4Bank: ()=>{
        return web3.call(contractAddress,"getAllRec4Bank()",[])
                .then((res)=>{
                    try{
                        // console.log(res)
                        let result = utils.decodeParams(['uint256[]','uint256[]','uint256[]'],res.result.output)
                        let final = {
                            "pendingRec":result['0'],
                            "unsettledRec":result['1'],
                            "settledRec":result['2']    
                        }
                        console.log(final)
                        return Promise.resolve(final)
                    }
                    catch(err){
                        return Promise.reject(err)
                    }
                })
    },

    acceptRec : (index,acceptOrNot)=>{
        return web3.sendRawTransaction(contractAddress,"acceptRec(uint256,bool)",[index,acceptOrNot])
                .then(res=>{
                    try{
                        // console.log(res)
                        let result = utils.decodeParams(['bool'],res.output)
                        let final ={
                            "success":result['0'],
                            "detail":result['0']?"Successful":"Not receipt for you"
                        }
                        console.log(final)
                        return Promise.resolve(final)
                    }
                    catch(err){
                        // console.log(err)
                        return Promise.reject(err)
                    }
                })
    },

    getApplication: ()=>{
        return web3.call(contractAddress,"getApplication()",[])
                    .then(res=>{
                        try{
                            // console.log(res)
                            let result = utils.decodeParams(["uint256[]","uint256[]","uint256[]","uint256[]"],res.result.output)
                            // console.log(result)
                            let final = {
                                "PendingAp4Finance":result['0'],
                                "PendingAp4Withdraw":result['1'],
                                "ALLAp4Finance":result['2'],
                                "ALLAp4Withdraw":result['3']
                            }
                            console.log(final)
                            return Promise.resolve(final)
                        }catch(err){
                            return Promise.reject(err)
                        }
                    })
    },

    getAp4Finance:(index)=>{
        return web3.call(contractAddress,"getAp4Finance(uint256)",[index])
                    .then(res=>{
                        try{
                            // console.log(res)
                            let result = utils.decodeParams(["uint256","uint256","address","uint16","address","bool","bool"],res.result.output)
                            let final = {
                                "tokenIndex":result['0'],
                                "amount":result['1'],
                                "applyer":result['2'],
                                "applyRate":result['3'],
                                "bank":result['4'],
                                "checked":result['5'],
                                "confirmed":result['6']
                            }
                            console.log(final)
                            return Promise.resolve(final)
                        }
                        catch(err){
                            return Promise.reject(err)
                        }
                    })
    },

    getAp4Withdraw:(index)=>{
        return web3.call(contractAddress,"getAp4Withdraw(uint256)",[index])
                    .then(res=>{
                        try{
                            let result = utils.decodeParams(["uint256","uint256","address","address","bool","bool"],res.result.output)
                            let final = {
                                "tokenIndex":result['0'],
                                "amount":result['1'],
                                "applyer":result['2'],
                                "bank":result['3'],
                                "checked":result['4'],
                                "confirmed":result['5']
                            }
                            return Promise.resolve(final)
                        }
                        catch(err){
                            return Promise.reject(err)
                        }
                    })
    },



    checkApp4Withdraw : (index,acceptOrNot)=>{
        return web3.sendRawTransaction(contractAddress,"checkAp4Withdraw(uint256,bool)",[index,acceptOrNot])
                .then(res=>{
                    try{
                        // console.log(res)
                        let result = utils.decodeParams(['bool','uint8'],res.output)
                        let final = {
                            "success":result['0'],
                            "detail": result['0']?"Successful":"Fail"
                        }
                        if(result['1']=='1')
                            final['detail']="Data Invalid(Invalid index/Not application for you/Has Been Checked)";
                        else if(result['1']=='2')
                            final['detail']="Token not enough/Receipt has not been settled or not reach returnTimestamp";
                        console.log(final)
                        return Promise.resolve(final)
                    }
                    catch(err){
                        // console.log(err)
                        return Promise.reject(err)
                    }
                })
    },


    checkApp4Finance : (index,acceptOrNot)=>{
        return web3.sendRawTransaction(contractAddress,"checkAp4Finance(uint256,bool)",[index,acceptOrNot])
                .then(res=>{
                    try{
                        // console.log(res)
                        let result = utils.decodeParams(['bool','uint8'],res.output)
                        let final = {
                            "success":result['0'],
                            "detail": result['0']?"Successful":"Fail"
                        }
                        if(result['1']=='1')
                            final['detail']="Data Invalid(Invalid index/Not Apply4Finance for you/Has been checked)";
                        else if(result['1']=='2')
                            final['detail']="Application has expired and removed this application now";
                        else if(result['1']=='3')
                            final['detail']="Token not enough";
                        console.log(final)
                        return Promise.resolve(final)
                    }
                    catch(err){
                        // console.log(err)
                        return Promise.reject(err)
                    }
                })
    },

    // getUnsettledRec: ()=>{
    //     return web3.call(contractAddress,"getAllUnsettledRec()",[])
    //             .then((res)=>{
    //                 try{
    //                     // console.log(res)
    //                     let result = utils.decodeParams(['uint256[]'],res.result.output)
    //                     let final = result['0']
    //                     console.log(final)
    //                     return Promise.resolve(final)
    //                 }
    //                 catch(err){
    //                     return Promise.reject(err)
    //                 }
    //             })
    // },

    settleRec : (index)=>{
        return web3.sendRawTransaction(contractAddress,"settleRec(uint256)",[index])
                .then(res=>{
                    try{
                        // console.log(res)
                        console.log(res)
                        let result = utils.decodeParams(['bool'],res.output)
                        let final = {
                            "success":result['0'],
                            "detail": result['0']?"Successful":"Fail"
                        }
                        console.log(final)
                        return Promise.resolve(final)
                    }
                    catch(err){
                        // console.log(err)
                        return Promise.reject(err)
                    }
                })
    },
}

module.exports = bankControl;
