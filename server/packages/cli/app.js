var DEFAULTCONTRCT='SupplyChain1';
var DEFAULTCONTRACTADDRESS='0x2fc2d00121fa4210948fbefa913e4de5a8c54797';

var express=require('express');
var app =express();
var bodyParser = require('body-parser'); 
//引用bodyParser 这个不要忘了写

//++++/
var cli = require('./cli')  //????
// const Web3jService = require('../api/web3j/web3jService').Web3jService
// var web3 = new Web3jService()
//++++//

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded  ggggg

//+++/
const path = require('path');
const utils = require('../api/common/utils');
const fs = require('fs');
const { Web3jService, ConsensusService, SystemConfigService } = require('../api');  //这一步就相当于include了
const { ContractsDir, ContractsOutputDir } = require('./constant');

const web3 = new Web3jService();
const consensusService = new ConsensusService();
const systemConfigService = new SystemConfigService();

const { check, string, boolean } = require('../api/common/typeCheck');
const channelPromise = require('../api/common/channelPromise');
const web3Sync = require('../api/common/web3lib/web3sync');
const isArray = require('isarray');
const ServiceBase = require('../api/common/serviceBase').ServiceBase;
const { produceSubCommandInfo, FLAGS, getAbi } = require('./interfaces/base');
//deploy 部署一个合约
//++++//


//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
 });

 //甚至我觉得可以不用部署--有地址了
 app.post('/deploy',function(req, res){
    //处理前端发回来的数据
    let data = req.body
    let temp = {}
    for(let item in data){
        temp = item
    }
    temp = JSON.parse(temp)
    console.info('temp',temp.contractName)

    let name = temp.contractName
    
    let contractName = name;

        if (!contractName.endsWith('.sol')) {
            contractName += '.sol';
        }
       
        let contractPath = path.join(ContractsDir, contractName);
        // res.send(contractPath)
        if (!fs.existsSync(contractPath)) {
            throw new Error(`${contractName} doesn't exist`);
        }
        let outputDir = ContractsOutputDir;

        web3.deploy(contractPath, outputDir).then(result => {
            let contractAddress = result.contractAddress;
            if (result.status === '0x0') {
                let addressPath = path.join(outputDir, `.${path.basename(contractName, '.sol')}.address`);

                try {
                    fs.appendFileSync(addressPath, contractAddress + '\n');
                } catch (error) { }
            }
            res.send({ contractAddress: contractAddress, status: result.status })
        });
})

 //----/
 /*
 var questions=[
    {
    data:213,
    num:444,
    age:12
    },
    {
    data:456,
    num:678,
    age:13
    }];
*/
//----//

//----/
/*
//写个接口123
app.get('/123',function(req,res){
    res.status(200),
    res.json(questions)
    });
app.post('/wdltest',function(req,res){
    console.log(req.stack);
    console.log(req.body);
    console.log(req.url);
    console.log(req.query);
    res.json(req.body)
})
*/
//----//

//++++/1
app.post('/AddContract',function(req,res) {
    //处理前端数据
    let data = req.body
    let temp = {}
    for(let item in data){
        temp = item
    }
    temp = JSON.parse(temp)
    console.info('temp',temp)

    let content = temp
    // res.send(content)
    let contractName = DEFAULTCONTRCT;  //??????
    let contractAddress = DEFAULTCONTRACTADDRESS;
    let functionName = content.func;
    let parameters = [];

    // let s = content.params
    // s = s.split(',')
    // let num = parseInt(s[2])
    // if(content.params) {
        // parameters = content.params
        // parameters.push(content.params.toString())
        parameters.push(content.fromAccount)
        parameters.push(content.toAccount)
        parameters.push(content.prover)
        parameters.push(parseInt(content.amount))
    // }
    // console.info('22',contractName,contractAddress,functionName,parameters)
    //控制链端
    let abi = getAbi(contractName);
    
    if (!abi) {
        throw new Error(`no abi file for contract ${contractName}`);
    }

    for (let item of abi) {
        if (item.name === functionName && item.type === 'function') {
            if (item.inputs.length !== parameters.length) {
                throw new Error(`wrong number of parameters for function \`${item.name}\`, expected ${item.inputs.length} but got ${parameters.length}`);
            }

            functionName = utils.spliceFunctionSignature(item);

            if (item.constant) {
                return web3.call(contractAddress, functionName, parameters).then(result => {
                    let status = result.result.status;
                    let ret = {
                        status: status
                    };
                    let output = result.result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                        // return ret;
                    res.send(ret)
                });
            } else {
                return web3.sendRawTransaction(contractAddress, functionName, parameters).then(result => {
                    let txHash = result.transactionHash;
                    let status = result.status;
                    let ret = {
                        transactionHash: txHash,
                        status: status
                    };
                    let output = result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                    // return ret;
                    res.send(ret)
                });
            }
        }
    }
})

app.post('/Transfer',function(req,res) {
    //处理前端数据
    let data = req.body
    let temp = {}
    for(let item in data){
        temp = item
    }
    temp = JSON.parse(temp)
    console.info('temp',temp)

    let content = temp
    // res.send(content)
    let contractName = DEFAULTCONTRCT;  //??????
    let contractAddress = DEFAULTCONTRACTADDRESS;
    let functionName = content.func;
    let parameters = [];

    // let s = content.params
    // s = s.split(',')
    // let num = parseInt(s[2])
    // if(content.params) {
        // parameters = content.params
        // parameters.push(content.params.toString())
        //parameters.push(content.fromAccount)  //---
        parameters.push(content.fromAccount)
        parameters.push(content.toAccount)
        parameters.push(parseInt(content.amount))
        parameters.push(parseInt(content.receiptID))  //+++
    // }
    // console.info('22',contractName,contractAddress,functionName,parameters)
    //控制链端
    let abi = getAbi(contractName);
    
    if (!abi) {
        throw new Error(`no abi file for contract ${contractName}`);
    }

    for (let item of abi) {
        if (item.name === functionName && item.type === 'function') {
            if (item.inputs.length !== parameters.length) {
                throw new Error(`wrong number of parameters for function \`${item.name}\`, expected ${item.inputs.length} but got ${parameters.length}`);
            }

            functionName = utils.spliceFunctionSignature(item);

            if (item.constant) {
                return web3.call(contractAddress, functionName, parameters).then(result => {
                    let status = result.result.status;
                    let ret = {
                        status: status
                    };
                    let output = result.result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                        // return ret;
                    res.send(ret)
                });
            } else {
                return web3.sendRawTransaction(contractAddress, functionName, parameters).then(result => {
                    let txHash = result.transactionHash;
                    let status = result.status;
                    let ret = {
                        transactionHash: txHash,
                        status: status
                    };
                    let output = result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                    // return ret;
                    res.send(ret)
                });
            }
        }
    }
})

app.post('/Financing',function(req,res) {
    //处理前端数据
    let data = req.body
    let temp = {}
    for(let item in data){
        temp = item
    }
    temp = JSON.parse(temp)
    console.info('temp',temp)

    let content = temp
    // res.send(content)
    let contractName = DEFAULTCONTRCT;  //??????
    let contractAddress = DEFAULTCONTRACTADDRESS;
    let functionName = content.func;
    let parameters = [];

    // let s = content.params
    // s = s.split(',')
    // let num = parseInt(s[2])
    // if(content.params) {
        // parameters = content.params
        // parameters.push(content.params.toString())
        //parameters.push(content.fromAccount)
        //parameters.push(content.toAccount)
        //parameters.push(parseInt(content.amount))
        parameters.push(parseInt(content.receiptID))  //+++
    // }
    // console.info('22',contractName,contractAddress,functionName,parameters)
    //控制链端
    let abi = getAbi(contractName);
    
    if (!abi) {
        throw new Error(`no abi file for contract ${contractName}`);
    }

    for (let item of abi) {
        if (item.name === functionName && item.type === 'function') {
            if (item.inputs.length !== parameters.length) {
                throw new Error(`wrong number of parameters for function \`${item.name}\`, expected ${item.inputs.length} but got ${parameters.length}`);
            }

            functionName = utils.spliceFunctionSignature(item);

            if (item.constant) {
                return web3.call(contractAddress, functionName, parameters).then(result => {
                    let status = result.result.status;
                    let ret = {
                        status: status
                    };
                    let output = result.result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                        // return ret;
                    res.send(ret)
                });
            } else {
                return web3.sendRawTransaction(contractAddress, functionName, parameters).then(result => {
                    let txHash = result.transactionHash;
                    let status = result.status;
                    let ret = {
                        transactionHash: txHash,
                        status: status
                    };
                    let output = result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                    // return ret;
                    res.send(ret)
                });
            }
        }
    }
})

app.post('/Settle',function(req,res) {
    //处理前端数据
    let data = req.body
    let temp = {}
    for(let item in data){
        temp = item
    }
    temp = JSON.parse(temp)
    console.info('temp',temp)

    let content = temp
    // res.send(content)
    let contractName = DEFAULTCONTRCT;  //??????
    let contractAddress = DEFAULTCONTRACTADDRESS;
    let functionName = content.func;
    let parameters = [];

    // let s = content.params
    // s = s.split(',')
    // let num = parseInt(s[2])
    // if(content.params) {
        // parameters = content.params
        // parameters.push(content.params.toString())
        //parameters.push(content.fromAccount)
        //parameters.push(content.toAccount)
        //parameters.push(parseInt(content.amount))
        parameters.push(parseInt(content.receiptID))  //+++
    // }
    // console.info('22',contractName,contractAddress,functionName,parameters)
    //控制链端
    let abi = getAbi(contractName);
    
    if (!abi) {
        throw new Error(`no abi file for contract ${contractName}`);
    }

    for (let item of abi) {
        if (item.name === functionName && item.type === 'function') {
            if (item.inputs.length !== parameters.length) {
                throw new Error(`wrong number of parameters for function \`${item.name}\`, expected ${item.inputs.length} but got ${parameters.length}`);
            }

            functionName = utils.spliceFunctionSignature(item);

            if (item.constant) {
                return web3.call(contractAddress, functionName, parameters).then(result => {
                    let status = result.result.status;
                    let ret = {
                        status: status
                    };
                    let output = result.result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                        // return ret;
                    res.send(ret)
                });
            } else {
                return web3.sendRawTransaction(contractAddress, functionName, parameters).then(result => {
                    let txHash = result.transactionHash;
                    let status = result.status;
                    let ret = {
                        transactionHash: txHash,
                        status: status
                    };
                    let output = result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                    // return ret;
                    res.send(ret)
                });
            }
        }
    }
})

/*
app.post('/printRecipt',function(req,res) {
    //处理前端数据
    let data = req.body
    let temp = {}
    for(let item in data){
        temp = item
    }
    temp = JSON.parse(temp)
    console.info('temp',temp)

    let content = temp
    // res.send(content)
    let contractName = content.contract;  //??????
    let contractAddress = content.addr;
    let functionName = content.func;
    let parameters = [];

    // let s = content.params
    // s = s.split(',')
    // let num = parseInt(s[2])
    // if(content.params) {
        // parameters = content.params
        // parameters.push(content.params.toString())
        //parameters.push(content.fromAccount)
        //parameters.push(content.toAccount)
        //parameters.push(parseInt(content.amount))
        parameters.push(parseInt(content.receiptID))  //+++
    // }
    // console.info('22',contractName,contractAddress,functionName,parameters)
    //控制链端
    let abi = getAbi(contractName);
    
    if (!abi) {
        throw new Error(`no abi file for contract ${contractName}`);
    }

    for (let item of abi) {
        if (item.name === functionName && item.type === 'function') {
            if (item.inputs.length !== parameters.length) {
                throw new Error(`wrong number of parameters for function \`${item.name}\`, expected ${item.inputs.length} but got ${parameters.length}`);
            }

            functionName = utils.spliceFunctionSignature(item);

            if (item.constant) {
                return web3.call(contractAddress, functionName, parameters).then(result => {
                    let status = result.result.status;
                    let ret = {
                        status: status
                    };
                    let output = result.result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                        // return ret;
                    res.send(ret)
                });
            } else {
                return web3.sendRawTransaction(contractAddress, functionName, parameters).then(result => {
                    let txHash = result.transactionHash;
                    let status = result.status;
                    let ret = {
                        transactionHash: txHash,
                        status: status
                    };
                    let output = result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                    // return ret;
                    res.send(ret)
                });
            }
        }
    }
})
*/

app.post('/Prove',function(req,res) {
    //处理前端数据
    let data = req.body
    let temp = {}
    for(let item in data){
        temp = item
    }
    temp = JSON.parse(temp)
    console.info('temp',temp)

    let content = temp
    // res.send(content)
    let contractName = DEFAULTCONTRCT;  //??????
    let contractAddress = DEFAULTCONTRACTADDRESS;
    let functionName = content.func;
    let parameters = [];

    // let s = content.params
    // s = s.split(',')
    // let num = parseInt(s[2])
    // if(content.params) {
        // parameters = content.params
        // parameters.push(content.params.toString())
        //parameters.push(content.fromAccount)
        //parameters.push(content.toAccount)
        //parameters.push(parseInt(content.amount))
        parameters.push(parseInt(content.receiptID))  //+++
    // }
    // console.info('22',contractName,contractAddress,functionName,parameters)
    //控制链端
    let abi = getAbi(contractName);
    
    if (!abi) {
        throw new Error(`no abi file for contract ${contractName}`);
    }

    for (let item of abi) {
        if (item.name === functionName && item.type === 'function') {
            if (item.inputs.length !== parameters.length) {
                throw new Error(`wrong number of parameters for function \`${item.name}\`, expected ${item.inputs.length} but got ${parameters.length}`);
            }

            functionName = utils.spliceFunctionSignature(item);

            if (item.constant) {
                return web3.call(contractAddress, functionName, parameters).then(result => {
                    let status = result.result.status;
                    let ret = {
                        status: status
                    };
                    let output = result.result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                        // return ret;
                    res.send(ret)
                });
            } else {
                return web3.sendRawTransaction(contractAddress, functionName, parameters).then(result => {
                    let txHash = result.transactionHash;
                    let status = result.status;
                    let ret = {
                        transactionHash: txHash,
                        status: status
                    };
                    let output = result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                    // return ret;
                    res.send(ret)
                });
            }
        }
    }
})
//++++2//



//配置服务端口
var server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.info('listen 8080')
    //----/
    //console.log('Example app listening at http://%s:%s', host, port);
    //----//
})
