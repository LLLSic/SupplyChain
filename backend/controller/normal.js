var utils = require('../api/common/web3lib/utils');
const contractAddress = require('./config').contractAddress;
// var Configuration = require('../api/common/configuration').Configuration;
const extract = require('./method').extract;
// Configuration.setConfig("./api/conf/config.json","normal");

const web3 = require('./config').web3;

const normalControl = {
    getUserType: ()=>{
        return web3.call(contractAddress,"getUserType()",[])
                    .then(res=>{
                        try{
                            if(res.result.status!="0x0")return Promise.reject("Fail to Fetch");
                            let result = utils.decodeParams(['uint8'],res.result.output)
                            let final = result['0']== 1 ? "Bank": (result['0']==2?"CoreCompany":"Company");
                            console.log(final);
                            return Promise.resolve(final)
                        }
                        catch(err){
                            return Promise.reject(final)
                        }
                    })
    },

    getAllBanks : ()=>{
        return web3.call(contractAddress,"getAllBanks()",[])
        .then(res=>{
            try{
                if(res.result.status!="0x0")return Promise.reject("Fail to Fetch");
                // console.log(res)
                let result = utils.decodeParams(['address[]','bytes32[]'],res.result.output)
                let final =  {address : result['0'],name:result['1']};
                // console.log(final)
                final = extract(final,["address","name"],[0,1]);
                console.log(final)
                return Promise.resolve(final)
            }
            catch(err){
                return Promise.reject(err)
            }
        })
    },

    getBank : (address) => {
        return web3.call(contractAddress,"getBank(address)",address)
                .then(res=>{
                    try{
                        if(res.result.status!="0x0")return Promise.reject("Fail to Fetch");
                        let result = utils.decodeParams(['string'],res.result.output)
                        let final = {"name":result['0']}
                        console.log(final)
                        return Promise.resolve(final)
                    }
                    catch(err){
                        return Promise.reject(err)
                    }
                })
    },

    getAllCoreCompanys : ()=>{
        return web3.call(contractAddress,"getAllCoreCompanys()",[])
        .then(res=>{
            // console.log(res)
            if(res.result.status!="0x0")return Promise.reject("Fail to Fetch");
            let result = utils.decodeParams(['address[]','bytes32[]'],res.result.output)
            let final =  {address : result['0'],name:result['1']};
            // console.log(final)
            final = extract(final,["address","name"],[0,1]);
            console.log(final)
            return Promise.resolve(final)
        }
        )
    },
    getAllNormalCompanys : ()=>{
        return web3.call(contractAddress,"getAllNormalCompanys()",[])
        .then(res=>{
            // console.log(res)
            if(res.result.status!="0x0")return Promise.reject("Fail to Fetch");
            let result = utils.decodeParams(['address[]','bytes32[]','address[]'],res.result.output)
            let final =  {address : result['0'],name:result['1'],inviter:result['2']};
            // console.log(final)
            final = extract(final,["address","name","inviter"],[0,1,0]);
            console.log(final)
            return Promise.resolve(final)
        })
    },

    getCoreCompany : (address) => {
        return web3.call(contractAddress,"getCoreCompany(address)",address)
                .then(res=>{
                    try{
                        if(res.result.status!="0x0")return Promise.reject("Fail to Fetch");
                        let result = utils.decodeParams(['string'],res.result.output)
                        let final = {"name":result['0']}
                        console.log(final)
                        return Promise.resolve(final)
                    }
                    catch(err){
                        return Promise.reject(err)
                    }
                })
    },

    getNormalCompany : (address) => {
        return web3.call(contractAddress,"getNormalCompany(address)",address)
                .then(res=>{
                    try{
                        if(res.result.status!="0x0")return Promise.reject("Fail to Fetch");
                        let result = utils.decodeParams(['string','address'],res.result.output)
                        let final = {name:result['0'],inviter:result['1']}
                        console.log(final)
                        return Promise.resolve(final)
                    }
                    catch(err){
                        return Promise.reject(err)
                    }
                })
    },


    getRec:(index)=>{
        return web3.call(contractAddress,"getRec(uint256)",[index])
                .then(res=>{
                    try{
                        // console.log(res)
                        if(res.result.status!="0x0")return Promise.reject("Fail to Fetch");
                        let result = utils.decodeParams(['uint256','address','address','address','uint256','uint256',
                                                            'uint256','bool','bool','bool','bool','bool'],res.result.output)
                        console.log(result)
                        let final = {}
                        props =[
                            'recIndex', 'coreCompanyAdd',
                            'lenderAddress','bankAddress',
                            'amount', 'sTimeStamp',
                            'eTimeStamp', 'signed',
                            'confirmed', 'checkByBank',
                            'accepted', 'settled']
                        for(var i = 0;i<props.length;i++)
                            final[props[i]]=result[i.toString()];
                        console.log(final)
                        return Promise.resolve(final)
                    }
                    catch(err){
                        return Promise.reject(err)
                    }
                })
    },
    getRecBatch:(indexes)=>{
        return web3.call(contractAddress,"getRecBatch(uint256[])",[indexes])
                .then(res=>{
                    try{
                        // console.log(res)
                        if(res.result.status!="0x0")return Promise.reject("Fail to Fetch");
                        let result = utils.decodeParams(['address[]','address[]','address[]','uint256[]','uint256[]',
                                                            'uint256[]','uint8[]'],res.result.output)
                        console.log(result)
                        let final = {}
                        props =[
                            'coreCompanyAdd',
                            'lenderAddress','bankAddress',
                            'amount', 'sTimeStamp',
                            'eTimeStamp','code']
                        for(var i = 0;i<props.length;i++)
                            final[props[i]]=result[i.toString()];
                        final = extract(final,props);
                        if(!final)return Promise.reject("Fail to Fetch");
                        for(var i = 0;i<final.length;i++){
                            final[i].recIndex = indexes[i];
                            codeStr = (parseInt(final[i].code)).toString(2).padStart(5,"0");
                            final[i].signed = codeStr[0]=='1'?true:false;
                            final[i].confirmed = codeStr[1]=='1'?true:false;
                            final[i].checkByBank = codeStr[2]=='1'?true:false;
                            final[i].accepted = codeStr[3]=='1'?true:false;
                            final[i].settled = codeStr[4]=='1'?true:false;
                        }
                        return Promise.resolve(final)
                        

                    }
                    catch(err){
                        return Promise.reject(err)
                    }
                })
    },

    getCash : ()=>{
        return web3.call(contractAddress,"getCash()",[])
        .then(res=>{
            // console.log(res)
            if(res.result.status!="0x0")return Promise.reject("Fail to Fetch");
            let result = utils.decodeParams(['uint256'],res.result.output)
            let final = {cash:result['0']}
            console.log(final)
            return Promise.resolve(final)
        })
    },

    uploadReceipt : (compAddress,bankAddress,amount,returnTimeStamp,detail)=>{
        return web3.sendRawTransaction(contractAddress,"uploadReceipt(address,address,uint256,uint256,string)",[compAddress,bankAddress,amount,returnTimeStamp,detail])
                .then((res)=>{
                    try{
                        // console.log(res)
                        if(res.status!="0x0")return Promise.reject("Failed!Please check data!");
                        let result = utils.decodeParams(['bool','uint256'],res.output)
                        let final = {
                            "success":result['0'],
                            "index":result['0']?result['1']:-1,
                            "detail":result['0']?"Successful":"Returntime might be earlier than current(uint:s)"
                        }
                        console.log(final)
                        return Promise.resolve(final)
                    }
                    catch(err){
                    return Promise.reject(err)
                    }
                })
    },

    getRecDetail:(index)=>{
        return web3.call(contractAddress,"getRecDetail(uint256)",[index])
                    .then(res=>{
                        try{
                            if(res.result.status!="0x0")return Promise.reject("Fail to Fetch");
                            let result = utils.decodeParams(['string'],res.result.output)
                            let final = {detail:result['0']}
                            console.log(final)
                            return Promise.resolve(final)
                        }
                        catch(err){
                            return Promise.reject(err)
                        }
                    })
    },

    getUserRec:()=>{
        return web3.call(contractAddress,"getUserRec()",[])
                    .then(res=>{
                        try{
                            if(res.result.status!="0x0")return Promise.reject("Fail to Fetch");
                            let result = utils.decodeParams(['uint256[]'],res.result.output)
                            let final = {recIndexs:result['0']}
                            console.log(final)
                            return Promise.resolve(final)
                        }
                        catch(err){
                            return Promise.reject(err)
                        }
                    })
    },

    getApplication2All:()=>{
        return web3.call(contractAddress,"getApplication2All()",[])
                    .then(res=>{
                        try{
                            if(res.result.status!="0x0")return Promise.reject("Fail to Fetch");
                            let result = utils.decodeParams(['uint256[]',"uint256[]"],res.result.output)
                            let final = {ap4Finance:result['0'],ap4Withdraw:result['1']};
                            console.log(final)
                            return Promise.resolve(final)
                        }
                        catch(err){
                            return Promise.reject(err)
                        }
                    })
    },


    getAllTokenIndex: ()=>{
        return web3.call(contractAddress,"getAllTokenIndex()",[])
                .then(res=>{
                    try{
                        if(res.result.status!="0x0")return Promise.reject("Fail to Fetch");
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

    getToken: (index)=>{
        return web3.call(contractAddress,"getToken(uint256)",[index])
                .then(res=>{
                    try{
                        // uint256 recIndex,address owner,address from,address source,
                        // // string coreCompanyName,
                        // address publisher,
                        // // string publisherName,
                        // uint256 amount,uint256 returnTimestamp, bool hasSettled
                        if(res.result.status!="0x0")return Promise.reject("Fail to Fetch");
                        let result = utils.decodeParams(['uint256','address','address','address',
                                                        'address','uint256','uint256','bool'],res.result.output)
                        let final = {
                            "recIndex": result['0'],
                            "owner":result['1'],
                            "from":result['2'],
                            "source":result['3'],
                            "publisher":result['4'],
                            "amount":result['5'],
                            "returnTimestamp":result['6'],
                            "hasSettled":result['7']
                        }
                        console.log(final)
                        return Promise.resolve(final)
                    }
                    catch(err){
                        return Promise.reject(err)
                    }
                })
    },

    getTokenInfoBatch: (indexes)=>{
        return web3.call(contractAddress,"getTokenInfoBatch(uint256[])",[indexes])
                .then(res=>{
                    try{
                        // uint256 recIndex,address owner,address from,address source,
                        // // string coreCompanyName,
                        // address publisher,
                        // // string publisherName,
                        // uint256 amount,uint256 returnTimestamp, bool hasSettled
                        if(res.result.status!="0x0")return Promise.reject("Fail to Fetch");
                        let result = utils.decodeParams(['uint256[]','address[]','address[]','address[]',
                                                        'uint256[]','uint256[]','bool[]'],res.result.output)
                        let final = {
                            "recIndex": result['0'],
                            "from":result['1'],
                            "source":result['2'],
                            "publisher":result['3'],
                            "amount":result['4'],
                            "returnTimeStamp":result['5'],
                            "hasSettled":result['6']
                        }
                        console.log(final)
                        final = extract(final,["recIndex","from",
                                            "source","publisher","amount","returnTimeStamp","hasSettled"]);
                        if(!final){return Promise.reject("Fail to Fetch")};
                        for(var i = 0;i<final.length;i++){
                            final[i].tokenIndex = indexes[i];
                        }
                        console.log(final);
                        return Promise.resolve(final)
                    }
                    catch(err){
                        return Promise.reject(err)
                    }
                })
    },

    transfer :(receiver, index,amount)=>{
        return web3.sendRawTransaction(contractAddress,"transfer(address,uint256,uint256)",[receiver,index,amount])
                    .then(res=>{
                        try{
                            if(res.status!="0x0")return Promise.reject("Failed!Please check data!");
                            let result = utils.decodeParams(['bool'],res.output)
                            let final = {
                                "success":result['0'],
                                "detail":result['0']?"Successful":"Data Invalid(Invalid index/Not your token/Token not enough)"
                            }
                            console.log(final)
                            return Promise.resolve(final)
                        }
                        catch(err){
                            return Promise.reject(err)
                        }
                    })
    },

    getAllTransferRecord:()=>{
        return web3.call(contractAddress,"getAllTransferRecs()",[])
                    .then(res=>{
                        try{
                            if(res.result.status!="0x0")return Promise.reject("Fail to Fetch");
                            let result = utils.decodeParams(["uint256[]","uint256[]","uint256[]","address[]","address[]"],res.result.output)
                            let final = {
                                "prevToken":result['0'],
                                "curToken":result['1'],
                                "amount":result['2'],
                                "from":result['3'],
                                "to":result['4']
                            }
                            console.log(final)
                            final = extract(final,["prevToken","curToken","amount","from","to"]);
                            console.log(final);
                            return Promise.resolve(final)
                        }
                        catch(err){
                            return Promise.reject(err)
                        }
                    })
    },


    applyFinance: (index,amount,bank,rate)=>{
        return web3.sendRawTransaction(contractAddress,"applyFinance(uint256,uint256,address,uint16)",[index,amount,bank,rate])
                .then((res)=>{
                    try{
                        if(res.status!="0x0")return Promise.reject("Failed!Please check data!");
                        // console.log(res)
                        let result = utils.decodeParams(['bool'],res.output)
                        let final = {
                            "success":result['0'],
                            "detail":result['0']?"Successful":"Data Invalid(Invalid index/Token not enough/Not application for you/Token is free to withdraw)"
                        }
                        console.log(final)
                        return Promise.resolve(final)
                    }catch(err){
                        return Promise.reject(err)
                    }
                })
    },
    applyWithdraw: (index,amount)=>{
        return web3.sendRawTransaction(contractAddress,"applyWithdraw(uint256,uint256)",[index,amount])
                .then((res)=>{
                    try{
                        if(res.status!="0x0")return Promise.reject("Failed!Please check data!");
                        let result = utils.decodeParams(['bool'],res.output)
                        let final = {
                            "success":result['0'],
                            "detail":result['0']?"Successful":"Invalid index/Not you token/Token not enough/Token not free to withdraw"
                        }
                        return Promise.resolve(final)
                    }catch(err){
                        return Promise.reject(err)
                    }
                })
    },
    getAp4FinanceBatch:(indexes)=>{
        if(indexes.length == 0)return Promise.resolve([]);
        return web3.call(contractAddress,"getAp4FinanceBatch(uint256[])",[indexes])
                    .then(res=>{
                        try{
                            let result = utils.decodeParams(["uint256[]","uint256[]","address[]","uint16[]","address[]","bool[]","bool[]"],res.result.output)
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
                            final = extract(final,["tokenIndex","amount","applyer","applyRate","bank","checked","confirmed"]);
                            console.log(final);
                            if(!final)return Promise.reject("Fail to Fetch");
                            for(var i = 0;i<final.length;i++){
                                final[i].index = indexes[i];
                            }
                            return Promise.resolve(final)
                        }
                        catch(err){
                            return Promise.reject(err)
                        }
                    })
    },

    getAp4WithdrawBatch:(indexes)=>{
        if(indexes.length == 0)return Promise.resolve([]);
        return web3.call(contractAddress,"getAp4WithdrawBatch(uint256[])",[indexes])
                    .then(res=>{
                        try{
                            let result = utils.decodeParams(["uint256[]","uint256[]","address[]","address[]","bool[]","bool[]"],res.result.output)
                            let final = {
                                "tokenIndex":result['0'],
                                "amount":result['1'],
                                "applyer":result['2'],
                                "bank":result['3'],
                                "checked":result['4'],
                                "confirmed":result['5']
                            }
                            console.log(final)
                            final = extract(final,["tokenIndex","amount","applyer","bank","checked","confirmed"]);
                            if(!final)return Promise.reject("Fail to Fetch");
                            for(var i = 0;i<final.length;i++){
                                final[i].index = indexes[i];
                            }
                            console.log(final);
                            return Promise.resolve(final)
                        }
                        catch(err){
                            return Promise.reject(err)
                        }
                    })
    }
}


module.exports = normalControl