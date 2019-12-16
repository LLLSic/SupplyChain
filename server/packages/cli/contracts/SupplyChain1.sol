pragma solidity ^0.4.22;
 
//改变返回值de版本


/// @title 供应链
contract SupplyChain1 {
    // 这里声明了一个新的复合类型用于稍后的变量
    
    //公司
    struct Company{
        address adr;            //公司地址
        uint role;              //公司类型 0为核心企业 1为银行 2为中小企业
    }

    //应收款单据,用于凭证、转账、融资
    struct Receipt {
        //不可更新
        uint receiptID;         //单据ID，用于查询等
        address from;           //发起者地址
        address to;             //收款人地址
        uint mount;             //金额
        address prover;         //确认人地址，0代表没有确认人
        
        //可被更新
        bool financinged;       //是否已融资
        bool settled;           //是否已结算（由核心公司）
        uint[] transferRecord;  //被转让记录，里面是用此receipt作为凭证的转账的receiptID
        uint leftValue;         //剩余价值，实际可用于转账、融资、还款得到的剩余价值
    }

    //写入单据，第一个参数 new表示新的receipt，fresh表示刷新的receipt
    event NewReceipt(string ReceiptType, uint receiptID, address from, address to, uint amount, address prover, bool financinged, bool settled, uint[] transferRecord, uint leftValue);
    mapping(address => Company) public companys;
    Company[] public companysInChain;
    Receipt[] public receipts;


    //功能一，核心用户发起贸易合同
    //由核心企业发起，receiver为收款方，prove为见证的金融机构，amout为金额
    //首先核心机构、见证方和收款方入链，之后单据入链并打印
    //zheligail!!!!!
    function AddContract(address fromer, address receiver, address prover, uint amount) {
        //核心机构入链
        companysInChain.push(Company(fromer, 0));
        companys[fromer] = companysInChain[0];
        //见证方（这里是银行）入链
        companysInChain.push(Company(prover, 1));
        companys[prover] = companysInChain[1];
        //收款方入链
        companysInChain.push(Company(receiver, 2));
        companys[receiver] = companysInChain[2];
        
        //单据入链
        receipts.length ++;
        receipts[receipts.length - 1].receiptID = receipts.length;
        receipts[receipts.length - 1].from = fromer;
        receipts[receipts.length - 1].to = receiver;
        receipts[receipts.length - 1].mount = amount;
        receipts[receipts.length - 1].financinged = false;
        receipts[receipts.length - 1].settled = false;
        receipts[receipts.length - 1].prover = prover;
        receipts[receipts.length - 1].leftValue = amount;
        //单据打印
        emit NewReceipt("new", receipts[receipts.length - 1].receiptID, receipts[receipts.length - 1].from, receipts[receipts.length - 1].to, receipts[receipts.length - 1].mount, receipts[receipts.length - 1].prover, receipts[receipts.length - 1].financinged, receipts[receipts.length - 1].settled, receipts[receipts.length - 1].transferRecord, receipts[receipts.length - 1].leftValue);
        
    }

    //检查company是否在链上
    function InChain(address com) public view returns (bool) {
        bool isInChain = false;
        for (uint i = 0; i < companysInChain.length; i ++) {
            if (companysInChain[i].adr == com) {
                isInChain = true;
                break;
            }
        }
        return isInChain;
    }

    //授权入链，只有已经在链上的才能给别人授权2
    function giveRightToIn(address com) public {
        require(
            InChain(msg.sender),
            "Only company already in this chain can give right to get in this chain."
        );
        if (!InChain(com)) {
            companysInChain.push(Company(com, 2));
            companys[com] = companysInChain[companysInChain.length - 1];
        }
    }


    //功能二：实现应收账款的转让上链
    //由票据拥有者发起，receiver为收款方，amout为金额，receiptID为所用的转让单据ID
    //首先检查合法性，收款方入链，之后新单据入链并打印、旧单据更新并打印
    function Transfer(address fromer, address receiver, uint amount, uint receiptID) {
        //由票据拥有者发起
        /*
        require(
            msg.sender == receipts[receiptID].to,
            "Only receipt owner can give right to transfer."
        );
        */
        //没有被用来融资
        require(
            !receipts[receiptID].financinged,
            "This receipt has been used to financing."
        );
        //金额足够
        require(
            receipts[receiptID].leftValue >= amount,
            "This receipt's leftValue is not enough now."
        );

        //收款方入链(若还没有在链上)
        giveRightToIn(receiver);

        //新单据入链并打印
        receipts.length ++;
        receipts[receipts.length - 1].receiptID = receipts.length;
        receipts[receipts.length - 1].from = receipts[receiptID].to;
        receipts[receipts.length - 1].to = receiver;
        receipts[receipts.length - 1].mount = amount;
        receipts[receipts.length - 1].financinged = false;
        receipts[receipts.length - 1].settled = false;
        receipts[receipts.length - 1].leftValue = amount;
        emit NewReceipt("new", receipts[receipts.length - 1].receiptID, receipts[receipts.length - 1].from, receipts[receipts.length - 1].to, receipts[receipts.length - 1].mount, receipts[receipts.length - 1].prover, receipts[receipts.length - 1].financinged, receipts[receipts.length - 1].settled, receipts[receipts.length - 1].transferRecord, receipts[receipts.length - 1].leftValue);


        //旧单据更新并打印
        receipts[receiptID].transferRecord.push(receipts.length - 1);
        receipts[receiptID].leftValue -= amount;
        emit NewReceipt("fresh", receiptID, receipts[receiptID].from, receipts[receiptID].to, receipts[receiptID].mount, receipts[receiptID].prover, receipts[receiptID].financinged, receipts[receiptID].settled, receipts[receiptID].transferRecord, receipts[receiptID].leftValue);

    }

    //功能三： 利用应收账款向银行融资上链
    //由票据拥有者发起，receiptID为所用的转让单据ID
    //首先检查合法性，之后旧单据更新并打印
    function Financing(uint receiptID) {
        //由票据拥有者发起
        /*
        require(
            msg.sender == receipts[receiptID].to,
            "Only receipt owner can give right to transfer."
        );
        */
        //没有被用来融资
        require(
            !receipts[receiptID].financinged,
            "This receipt has been used to financing."
        );
        receipts[receiptID].financinged = true;
        emit NewReceipt("fresh", receiptID, receipts[receiptID].from, receipts[receiptID].to, receipts[receiptID].mount, receipts[receiptID].prover, receipts[receiptID].financinged, receipts[receiptID].settled, receipts[receiptID].transferRecord, receipts[receiptID].leftValue);

    }

    //功能四：应收账款支付结算上链
    //由中小企业设置，receiptID为所用的单据ID，一个receipt只能找核心企业结算其leftValue值
    function Settle(uint receiptID) {
        //由票据拥有者发起
        /*
        require(
            msg.sender == receipts[receiptID].to,
            "Only receipt owner can give right to transfer."
        );
        */
        receipts[receiptID].settled = true;
        emit NewReceipt("fresh", receiptID, receipts[receiptID].from, receipts[receiptID].to, receipts[receiptID].mount, receipts[receiptID].prover, receipts[receiptID].financinged, receipts[receiptID].settled, receipts[receiptID].transferRecord, receipts[receiptID].leftValue);

    }

    
    //功能五 查询和打印单据
    //所有人均可发起
    function printRecipt(uint receiptID) public view  {
        uint x = receiptID;
        emit NewReceipt("fresh", x, receipts[receiptID].from, receipts[receiptID].to, receipts[receiptID].mount, receipts[receiptID].prover, receipts[receiptID].financinged, receipts[receiptID].settled, receipts[receiptID].transferRecord, receipts[receiptID].leftValue);
    
    }
    

    //功能六 第三方对单据认证
    //由第三方发起，receiptID为验证的单据ID
    //首先检查合法性，之后旧单据更新并打印
    function Prove(uint receiptID) {
        //由第三方发起
        require(
            msg.sender == companysInChain[1].adr,
            "Only bank can give right to prove this receipt."
        );
        receipts[receiptID].prover = msg.sender;
        emit NewReceipt("fresh", receiptID, receipts[receiptID].from, receipts[receiptID].to, receipts[receiptID].mount, receipts[receiptID].prover, receipts[receiptID].financinged, receipts[receiptID].settled, receipts[receiptID].transferRecord, receipts[receiptID].leftValue);
    
    }
}

