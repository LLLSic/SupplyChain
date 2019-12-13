var express = require('express');
var router = express.Router();

const invite = require('../controller/bankOrCC').invite;
const checkProps = require('./utils').checkProps;

router.post('/',(req, res)=>{
    const checkResult = checkProps(req.body,['address','name'])
    if(!checkResult[0])
        return res.status(400).json({error:"Missing Param: "+checkResult[1]})

    invite(req.body.address,req.body.name).then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        }
    )
});

module.exports = router;