var express = require('express');
var router = express.Router();

const bankControl = require('../controller/bank');
const checkProps = require('./utils').checkProps;

router.patch('/acceptRec',(req, res)=>{
    const checkResult = checkProps(req.body,['index','acceptOrNot'])
    if(!checkResult[0])
        return res.status(400).json({error:"Missing Param: "+checkResult[1]})
    req.body.index = parseInt(req.body.index)
    // req.body.acceptOrNot == req.body.acceptOrNot.toLowerCase()=="true" ? true : false;
    bankControl.acceptRec(req.body.index,req.body.acceptOrNot).then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        }
    )
});

router.get('/application', function(req, res, next) {
    bankControl.getApplication().then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
});

router.get('/allRec4Bank',function(req, res, next){
    bankControl.getAllRec4Bank().then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        }
    )
});

    
router.get('/ap4Withdraw', function(req, res, next) {
    if(!Object.prototype.hasOwnProperty.call(req.params, 'index'))
        return res.status(400).json({error:"Missing Param: index"})
    const index = parseInt(req.params.index); 
    bankControl.getAp4Withdraw(index).then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
});
   

router.get('/ap4Finance', function(req, res, next) {
    if(!Object.prototype.hasOwnProperty.call(req.params, 'index'))
        return res.status(400).json({error:"Missing Param: index"})
    const index = parseInt(req.params.index); 
    bankControl.getAp4Finance(index).then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
});


    
router.patch('/ap4Withdraw',(req, res)=>{
    const checkResult = checkProps(req.body,['index','acceptOrNot'])
    if(!checkResult[0])
        return res.status(400).json({error:"Missing Param: "+checkResult[1]})
    // req.body.index = parseInt(req.body.index)
    // req.body.acceptOrNot == req.body.acceptOrNot.toLowerCase()=="true" ? true : false;
    bankControl.checkApp4Withdraw(req.body.index,req.body.acceptOrNot).then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        }
    )
})



router.patch('/ap4Finance',(req, res)=>{
    const checkResult = checkProps(req.body,['index','acceptOrNot'])
    if(!checkResult[0])
        return res.json({error:"Missing Param: "+checkResult[1]})
    // req.body.acceptOrNot == req.body.acceptOrNot.toLowerCase()=="true" ? true : false;
    req.body.index = parseInt(req.body.index)
    bankControl.checkApp4Finance(req.body.index,req.body.acceptOrNot).then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        }
    )
})

router.patch('/settleRec',(req, res)=>{
    if(!Object.prototype.hasOwnProperty.call(req.body, 'index'))
        return res.status(400).json({error:"Missing Param: index"})
    bankControl.settleRec(parseInt(req.body.index)).then(result=>{
        res.json(result);
    },error=>{
        res.status(500).json(error);
    }
    )
})



module.exports = router;

