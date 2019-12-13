var express = require('express');
var router = express.Router();

const normalControl = require('../controller/normal');
const checkProps = require('./utils').checkProps;


router.get('/usertype', function(req, res, next) {
  normalControl.getUserType().then(
      (result)=>{
          res.json({usertype:result});
      },
      error=>{
          res.status(500).json(error);
      }
  )
});

router.get('/allBanks', function(req, res, next) {
    normalControl.getAllBanks().then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
});

router.get('/bank', function(req, res, next) {
    if(!Object.prototype.hasOwnProperty.call(req.query, 'address'))
        return res.status(400).json({error:"Missing Param: address"})
    const bankAddress = req.query.address; 
    normalControl.getBank(bankAddress).then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
});

router.get('/allCorecompanys', function(req, res, next) {
    normalControl.getAllCoreCompanys().then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
});

router.get('/corecompany', function(req, res, next) {
    if(!Object.prototype.hasOwnProperty.call(req.query, 'address'))
        return res.status(400).json({error:"Missing Param: address"})
    const coreCompanyAddress = req.query.address; 
    normalControl.getCoreCompany(coreCompanyAddress).then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
});

router.get('/allNormalCompanys', function(req, res, next) {
    normalControl.getAllNormalCompanys().then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
});

router.get('/normalCompany', function(req, res, next) {
    if(!Object.prototype.hasOwnProperty.call(req.query, 'address'))
        return res.status(400).json({error:"Missing Param: address"})
    const CompanyAddress = req.query.address; 
    normalControl.getNormalCompany(CompanyAddress).then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
});

router.get('/cash', function(req, res, next) {
    normalControl.getCash().then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
});

router.get('/receipt', function(req, res, next) {
    if(!Object.prototype.hasOwnProperty.call(req.query, 'index'))
        return res.status(400).json({error:"Missing Param: index"})
    const index = req.query.index; 
    normalControl.getRec(index).then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
});

router.get('/receipts', function(req, res, next) {
    if(!Object.prototype.hasOwnProperty.call(req.query, 'indexes'))
        return res.status(400).json({error:"Missing Param: indexes"})
    if(!(req.query.indexes instanceof Array))
        return res.status(400).json({error:"Type Error"}); 
    normalControl.getRecBatch(req.query.indexes).then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
});



router.post('/receipt', function(req, res, next) {
    const checkResult = checkProps(req.body,['compAddress','bankAddress','amount','returnTimeStamp','detail'])
    if(!checkResult[0])
        return res.status(400).json({error:"Missing Param: "+checkResult[1]})
    normalControl.uploadReceipt(req.body.compAddress,req.body.bankAddress,req.body.amount,req.body.returnTimeStamp,req.body.detail).then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
});

router.get('/compRecepits', function(req, res, next) {
    normalControl.getUserRec().then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
});

router.get('/recDetail', function(req, res, next) {
    if(!Object.prototype.hasOwnProperty.call(req.query, 'index'))
        return res.status(400).json({error:"Missing Param: index"})
    normalControl.getRecDetail(req.query.index).then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
});

router.get('/myOwnRec',function(req, res, next){
    normalControl.getUserRec().then(result=>{
        normalControl.getRecBatch(result.recIndexs).then(
            receipts=>{
                return res.json(receipts);
            },err=>{
                return res.status(500).json(err);
            })
    },error=>{
        res.status(500).json(error);
    })
})

router.get('/application',function(req, res, next){
    normalControl.getApplication2All().then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
    }
);

router.get('/allAp4Finances',function(req, res, next){
    normalControl.getApplication2All().then(result=>{
        normalControl.getAp4FinanceBatch(result.ap4Finance).then(
            aps=>{
                return res.json(aps);
            },err=>{
                return res.status(500).json(err);
            })
    },error=>{
        res.status(500).json(error);
    })
});

router.get('/allAp4Withdraws',function(req, res, next){
    normalControl.getApplication2All().then(result=>{
        normalControl.getAp4WithdrawBatch(result.ap4Withdraw).then(
            aps=>{
                return res.json(aps);
            },err=>{
                return res.status(500).json(err);
            })
    },error=>{
        res.status(500).json(error);
    })
});


router.get('/allTokensIndex',function(req, res, next){
    normalControl.getAllTokenIndex().then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        }
    )
});

router.get('/token', function(req, res, next) {
    if(!Object.prototype.hasOwnProperty.call(req.query, 'index'))
        return res.status(400).json({error:"Missing Param: index"})
    const index = req.query.index; 
    normalControl.getToken(index).then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
});

router.get('/allTokenInfo', function(req, res, next) {
    normalControl.getAllTokenIndex().then(result=>{
        normalControl.getTokenInfoBatch(result).then(
            tokens=>{
                return res.json(tokens);
            },err=>{
                return res.status(500).json(err);
            })
    },error=>{
        res.status(500).json(error);
    })
});

router.post('/transfer', function(req, res, next) {
    const checkResult = checkProps(req.body,['receiver','index','amount'])
    if(!checkResult[0])
        return res.status(400).json({error:"Missing Param: "+checkResult[1]})
    normalControl.transfer(req.body.receiver,req.body.index,req.body.amount).then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
});

router.get('/allTransferRecord', function(req, res, next) {
    normalControl.getAllTransferRecord().then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
    });

router.post('/applyFinance',function(req, res, next){
    const checkResult = checkProps(req.body,['index','amount','bank','rate'])
    if(!checkResult[0])
        return res.status(400).json({error:"Missing Param: "+checkResult[1]})
    normalControl.applyFinance(req.body.index,req.body.amount,req.body.bank,req.body.rate).then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        }
    )
});

router.post('/applyWithdraw',function(req, res, next){
    const checkResult = checkProps(req.body,['index','amount'])
    if(!checkResult[0])
        return res.status(400).json({error:"Missing Param: "+checkResult[1]})
    normalControl.applyWithdraw(req.body.index,req.body.amount).then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        }
    )
});

router.get('/someAp4Finance', function(req, res, next) {
    if(!Object.prototype.hasOwnProperty.call(req.query, 'indexes'))
        return res.status(400).json({error:"Missing Param: indexes"})
    if(!(req.query.indexes instanceof Array))
        return res.status(400).json({error:"Type Error"});
    normalControl.getAp4FinanceBatch(req.query.indexes).then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
});

router.get('/someAp4Withdraw', function(req, res, next) {
    if(!Object.prototype.hasOwnProperty.call(req.query, 'indexes'))
        return res.status(400).json({error:"Missing Param: indexes"})
    if(!(req.query.indexes instanceof Array))
        return res.status(400).json({error:"Type Error"});
    bankControl.getAp4WithdrawBatch(req.query.indexes).then(
        result=>{
            res.json(result);
        },error=>{
            res.status(500).json(error);
        })
});

// router.get('/blockNumber',(req,res)=>{
//     util.getBlockNumber().then(function(result){
//         return res.send(result.result);
//     },error=>{
//         console.log(error);
//         return res.status(400).send(error);
//     });
// })

module.exports = router;
