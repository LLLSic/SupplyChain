var Configuration = require('./api/common/configuration').Configuration;
Configuration.setConfig("./api/conf/adminConfig.json","Admin");
var Web3jService = require('./api').Web3jService;
web3 = new Web3jService();
var utils = require('./api/common/web3lib/utils');

web3.deploy("./SupplyChain.sol","./deployContracts")
.then(function(result){
    console.log(result);
},err=>console.log(err));

