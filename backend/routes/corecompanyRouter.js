var express = require('express');
var router = express.Router();

const coreCompanyControl = require('../controller/corecompany')
const checkProps = require('./utils').checkProps;

router.get('/unsignedRec', function(req, res, next) {
  coreCompanyControl.getUnsignedRec().then(
      (result)=>{
          res.json(result);
      },
      error=>{
          res.status(500).json(error);
      }
  )
});

router.patch('/signRec', function(req, res, next) {
    const checkResult = checkProps(req.body,['index','acceptOrNot'])
    if(!checkResult[0])
        return res.status(400).json({error:"Missing Param: "+checkResult[1]})
    req.body.index = parseInt(req.body.index)
    // req.body.acceptOrNot == req.body.acceptOrNot.toLowerCase()=="true" ? true : false;
    coreCompanyControl.signRec(req.body.index,req.body.acceptOrNot).then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
});



module.exports = router;
