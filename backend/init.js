var Configuration = require('./api/common/configuration').Configuration;
Configuration.setConfig("./api/conf/adminConfig.json","Admin");
var Web3jService = require('./api').Web3jService;
web3 = new Web3jService();
var utils = require('./api/common/web3lib/utils');


contractAddress = '0xa5f216dc6c0ca315262e72644a5a76e863ba02c2'

web3.sendRawTransaction(contractAddress,"addBank(address,string)",
['0xe42b97f9b42f3fa586b98065d1d4342ec18bfd3c','建设']).then(res=>{
        if(res.status!='0x0')return console.log('添加建设银行失败')
        let result = utils.decodeParams(['bool'],res.output)
        console.log(result?'成功添加建设银行':'添加建设银行失败')
}
,err=>console.log(err))

web3.sendRawTransaction(contractAddress,"addBank(address,string)",
['0xa4fb3713c647fb79fa3a5ed057bcac99f1c635b9','微众']).then(res=>{
    if(res.status!='0x0')return console.log('添加微众银行失败')
    let result = utils.decodeParams(['bool'],res.output)
    console.log(result?'成功添加微众银行':'添加微众银行失败')
},err=>console.log(err))

web3.sendRawTransaction(contractAddress,"addCoreCompany(address,string)",
['0x43ed12399576540c80b3be1525e15897318ee044','华为']).then(res=>{
    if(res.status!='0x0')return console.log('添加华为公司失败')
    let result = utils.decodeParams(['bool'],res.output)
    console.log(result?'成功添加华为公司为核企':'添加华为公司核企失败')
},err=>console.log(err))

web3.sendRawTransaction(contractAddress,"addNormalCompany(address,string)",
['0x62248e937c9af6a17f777d0aa8d1a9f9813ff727','高通']).then(res=>{
    if(res.status!='0x0')return console.log('添加高通公司失败')
    let result = utils.decodeParams(['bool'],res.output)
    console.log(result?'成功添加高通为一般企业':'添加高通为一般企业失败')
},err=>console.log(err))

