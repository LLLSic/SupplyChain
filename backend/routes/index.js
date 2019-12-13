var express = require('express');
var path = require('path');
var fs = require('fs');
var router = express.Router();
var Configuration = require('../api/common/configuration').Configuration;
var web3 = require('../controller/config').web3;
const normalControl = require('../controller/normal');


router.get('/accounts',(req,res)=>{
    // configDir = path.dirname();
    config = JSON.parse(fs.readFileSync("./api/conf/config.json"));
    res.json(config.privateKey);
})

router.post('/login',(req,res)=>{
    try{
        if(!Object.prototype.hasOwnProperty.call(req.body,'user'))
            return res.status(400).json({message:"Missing Param: user"})
        // configDir = path.dirname();
        config = JSON.parse(fs.readFileSync("./api/conf/config.json"));
        if(!config.privateKey.hasOwnProperty(req.body.user)) {
            return res.status(404).json({message:"User Not Found"});
        }
        Configuration.reset();
        Configuration.setConfig("./api/conf/config.json",req.body.user);
        web3.resetConfig();
        normalControl.getUserType().then(
            (result)=>{
                res.json({message:"Successful",usertype:result});
            },
            error=>{
                res.status(500).json(error);
            })
    }
    catch(err){
        res.status(500).json({message:"Fail",detail:err});
    }
});

router.get('/loginOrNot',(req,res)=>{
    try{
        res.json({logined : web3._config != undefined}); 
    }
    catch(err){
        res.status(500).json({message:"Fail",detail:err});
    }
})

// router.post('/logout',(req,res)=>{
//     try{
//         Configuration.reset();
//         web3.resetConfig();
//         res.json({message:"Successful"});
//         // throw new Error("123");
//     }
//     catch(err){
//         res.status(500).json({message:"Fail",err});
//     }
// })


module.exports = router;
