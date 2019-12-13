
pragma solidity ^0.4.18;

contract SupplyChain {
    
    struct Bank{
        string name;
        address _address;
    }
    
    struct CoreCompany{
        string name;
        address _address;
    }
    
    struct NormalCompany{
        string name;
        address _address;
        address inviter;
    }

    Bank[] allbanks;        //所有银行信息
    CoreCompany[] allCoreCompanys;      //所有核企
    NormalCompany[] allNormalCompanys;  //所有下游企业
    mapping(address=>uint8) usertype;   //记录用户类型
    mapping(address=>uint256) banks;    //银行地址=>索引
    mapping(address=>uint256) coreCompanys;     //核企地址=>索引
    mapping(address=>uint256) normalCompanys;   //下游企业地址=>索引
    
    struct Receipt{
        uint256 index;    //账单号
        address borrower; //核心企业
        address lender;   //申请下游企业
        address bank;     //申请受理银行
        uint256 amount;   //账单金额
        uint256 sTimeStamp;//申请时间戳
        uint256 eTimeStamp;//应还款时间戳
        bool signed;       //核企审核
        bool confirmed;    //核企确认（审核是否通过）
        bool checkByBank;  //银行审核
        bool accepted;     //银行受理
        bool settled;      //核企已还款
    }
    
    struct Token{
        uint256 recIndex;  //该Token对应账单号
        uint256 amount;    //TOken数量
        address owner;     //Token拥有者
        address from;      //Token来源——上一级转让者
        address source;    //Token对应账单的核企
        address publisher; //Token发布者——对应账单的受理银行
        uint256 returnTimestamp;//账单应结算时间戳
        bool hasSettled;   //账单已结算——Token可提现
    }

    struct TransferRecord{
        uint256 prevToken; //来源TokenId
        uint256 curToken;  //当前新TokenId
        uint256 amount;    //转让金额
        address from;      //来源Token持有者
        address to;        //当前新Token持有者
    }
    
    struct Apply4Withdraw{
        uint256 tokenIndex;//申请提现的TokenId
        uint256 amount;    //申请提现的Token数量
        address applyer;   //提现申请者
        address bank;      //申请提现的银行（账单对应银行）
        bool checked;      //申请受审核
        bool confirmed;    //审核是否通过
    }
    
    struct Apply4Finance{
        uint256 tokenIndex;//申请融资Token
        uint256 amount;    //申请融资Token数量
        uint16 applyRate;  //申请融资费率*10000
        address applyer;   //申请者
        address bank;      //申请融资银行
        bool checked;      //申请受审核
        bool confirmed;    //审核是否通过
        uint256 expireDate;//申请失效时间（账单还款时间）
    }

    
    address private admin; 
    uint256 curIndex;
    


    mapping(address=>uint256[]) transferRecsOf;

    mapping(address=>uint256[]) ap4Withdraw2User;
    mapping(address=>uint256[]) ap4Finance2User;

    mapping(uint256=>uint256) ap4WithdrawsMap;
    mapping(uint256=>uint256) ap4FinancesMap;
    mapping(address=>uint256[]) ap4Withdraws2Bank;
    mapping(address=>uint256[]) ap4Finances2Bank;
    
    mapping(address=>uint256[]) allRec4User;
    
    mapping(address=>uint256[]) tokenOf;
    mapping(uint256=>uint256[]) recTokens;
    
    
    mapping(address=>uint256[]) unsignedRec;
    
    mapping(uint256=>uint256) unsignedRecMap;
    mapping(uint256=>uint256) pendingRecMap;
    
    mapping(address=>uint256[]) pendingRec;
    mapping(address=>uint256[]) unsettledRec;
    mapping(address=>uint256[]) settledRec; 
    
    mapping(uint256=>uint256) unsettledRecMap;
    
    mapping(address=>uint256) cash;
    
    mapping(uint256=>string) recDetails;
    Receipt[] receipts;
    
    // uint256[] pendingRec;
    
    
    Apply4Withdraw[] ap4Withdraws;
    Apply4Finance[] ap4Finances;

    Token[] tokens;
    TransferRecord[] transferRecords; 

    function isAdmin(address _address)private returns(bool){
        return (
            _address==admin
            );
    }
    
    function isBank(address _address)public returns(bool){
        return(
            allbanks.length!=0&&
            banks[_address]<allbanks.length&&
            allbanks[banks[_address]]._address==_address
            );
        
    }
    
    function isCoreCompany(address _address)public returns(bool){
        return (
            allCoreCompanys.length!=0&&
            coreCompanys[_address]<allCoreCompanys.length&&
            allCoreCompanys[coreCompanys[_address]]._address==_address
            );
    }

    function isNormalCompany(address user)public returns(bool){
        return (allNormalCompanys.length!=0&&
                normalCompanys[user]<allNormalCompanys.length&&
                allNormalCompanys[normalCompanys[user]]._address==user);
    }
    
    
    constructor() public {
        admin = msg.sender;
        curIndex = 0;
    }
    
    function getUserType()public view returns (uint8){
        return usertype[msg.sender];
    }

    function getBytes32(string memory source)private returns (bytes32 result) {
        assembly {
            result := mload(add(source, 32))
        }
    }

    function getBank(address bankAddress)public view 
        returns(string name)
    {
        require(isBank(bankAddress));
        Bank storage bank = allbanks[banks[bankAddress]];
        return (bank.name);
    }
    
    function getCoreCompany(address compAddress)public view 
        returns(string name)
    {
        require(isCoreCompany(compAddress));
        CoreCompany storage coreCompany = allCoreCompanys[coreCompanys[compAddress]];
        return (coreCompany.name);
    }

    //查询某一下游企业
    function getNormalCompany(address compAddress)public view 
        returns(string name , address inviter)
    {   
        require(isNormalCompany(compAddress));
        NormalCompany storage normalCompany = allNormalCompanys[normalCompanys[compAddress]];
        return (normalCompany.name,normalCompany.inviter);
    }

    // 获取所有银行——Admin添加
    function getAllBanks()public view returns(address[] bankAddresses,bytes32[] bankNames){
        bankAddresses = new address[](uint256(allbanks.length));
        bankNames = new bytes32[](uint256(allbanks.length));
        for(uint256 i = 0;i<allbanks.length;i++){
            bankAddresses[i] = allbanks[i]._address;
            bankNames[i] = getBytes32(allbanks[i].name);
        }
        return (bankAddresses,bankNames);
    }
    

    //所有的核心企业，由管理者添加
    function getAllCoreCompanys()public view returns(address[] coreCompanyAddresses,bytes32[] corecompanyNames){
        coreCompanyAddresses = new address[](uint256(allCoreCompanys.length));
        corecompanyNames = new bytes32[](uint256(allCoreCompanys.length));
        for(uint256 i = 0;i<allCoreCompanys.length;i++){
            coreCompanyAddresses[i] = allCoreCompanys[i]._address;
            corecompanyNames[i] = getBytes32(allCoreCompanys[i].name);
        }
        return (coreCompanyAddresses,corecompanyNames);
    }

    //获取所有的下游企业——邀请制
    function getAllNormalCompanys()public view returns(address[] companyAddresses,bytes32[] companyNames,address[] inviters){
        companyAddresses = new address[](uint256(allNormalCompanys.length));
        companyNames = new bytes32[](uint256(allNormalCompanys.length));
        inviters = new address[](uint256(allNormalCompanys.length));
        for(uint256 i = 0;i<allNormalCompanys.length;i++){
            companyAddresses[i] = allNormalCompanys[i]._address;
            companyNames[i] = getBytes32(allNormalCompanys[i].name);
            inviters[i] = allNormalCompanys[i].inviter;
        }
        return (companyAddresses,companyNames,inviters);
    }
    
    function addBank(address _address, string _name) 
        public returns(bool success)
    {
        require(isAdmin(msg.sender));
        if(isBank(_address))
            return false;
        banks[_address] = allbanks.length;
        allbanks.push(Bank(_name,_address));
        usertype[_address] = 1;
        return true;
    }

    
    function addCoreCompany(address _address, string _name) 
        public returns(bool success) 
    {
        require(isAdmin(msg.sender));
        if(isCoreCompany(_address))return false;
            // Fail to add coreCompany
        coreCompanys[_address]=allCoreCompanys.length;
        allCoreCompanys.push(CoreCompany(_name,_address));
        usertype[_address] = 2;
        return true;
    }

    function addNormalCompany(address _address, string _name) 
        public returns(bool success) 
    {
        
        if(isNormalCompany(_address))return false;
        if(!isCoreCompany(msg.sender)&&!isBank(msg.sender)&&!isAdmin(msg.sender))return false;
            // Fail to add coreCompany
        normalCompanys[_address]=allNormalCompanys.length;
        allNormalCompanys.push(NormalCompany(_name,_address,msg.sender));
        usertype[_address] = 3;
        return true;
    }
    

    function uploadReceipt(address _compAddress,address _bankAddress, uint256 amount, uint256 returnTimestamp,string detail)
        public  returns(bool success,uint256 receiptIndex)
    {
        require(isCoreCompany(_compAddress)&&isBank(_bankAddress)&&isNormalCompany(msg.sender));
        uint256 current = now;
        if(current>returnTimestamp)
            return (false,0);
        // Returntime should be later than current(uint256:ms)
        receipts.push(Receipt(curIndex,_compAddress,msg.sender,
                                _bankAddress,amount,current,returnTimestamp,
                                false,false,false,false,false));
        recDetails[curIndex] = detail;
        unsignedRecMap[curIndex]=unsignedRec[_compAddress].length;
        unsignedRec[_compAddress].push(curIndex);
        allRec4User[_compAddress].push(curIndex);
        allRec4User[msg.sender].push(curIndex);
        curIndex++;
        return (true,curIndex-1);
    }
    
    //核心企业获取尚未审批的申请
    function getUnsignedRec()
        public 
        returns(uint256[] unsignedRecIndex)
    {
        require(isCoreCompany(msg.sender));
        return uint256[](unsignedRec[msg.sender]);
    }
    
    function signRec(uint256 index,bool confirm)
        public returns(bool success)
    {
        if(receipts[index].borrower != msg.sender)
            return false;
            // Not receipt for you
        receipts[index].signed = true;
        if(confirm){
            receipts[index].confirmed = true;
            uint256 len = unsignedRec[msg.sender].length;
            uint256 i = unsignedRecMap[index];
            unsignedRec[msg.sender][i]= unsignedRec[msg.sender][len-1];
            unsignedRec[msg.sender].length--;
            
            pendingRecMap[index]=pendingRec[receipts[index].bank].length;
            pendingRec[receipts[index].bank].push(index);
        }
        allRec4User[receipts[index].bank].push(index);
    
        return true;
    }

    function acceptRec(uint256 index,bool accept)
        public returns(bool success)
    {
        Receipt storage receipt = receipts[index];
        if(!receipt.confirmed||receipt.checkByBank||receipt.bank!=msg.sender)
            return false;
            // Not receipt for you
        receipt.checkByBank = true;
        if(accept){
            receipt.accepted = true;
            tokens.push(Token(index,receipt.amount,receipt.lender,msg.sender,receipt.borrower, msg.sender,receipt.eTimeStamp,false));
            tokenOf[receipt.lender].push(tokens.length-1);
            recTokens[index].push(tokens.length-1);
            unsettledRecMap[index]=unsettledRec[msg.sender].length;
            unsettledRec[msg.sender].push(index);
        }
        pendingRec[msg.sender][pendingRecMap[index]] = pendingRec[msg.sender][pendingRec[msg.sender].length-1];
        pendingRec[msg.sender].length--;
        return true;
    }
    
    function getRec(uint256 index)
        public returns(uint256 recIndex,address coreCompanyAdd,
                address lenderAddress,
                address bankAddress,
                uint256 amount,uint256 sTimeStamp,
                uint256 eTimeStamp,bool signed,
                bool confirmed,bool checkByBank,
                bool accepted,bool settled)
    {
        require(
            index>=0&&
            index<receipts.length
            );
        Receipt storage receipt = receipts[index]; 
        return (index,receipt.borrower,
                receipt.lender,
                receipt.bank,
                receipt.amount,receipt.sTimeStamp,
                receipt.eTimeStamp,receipt.signed,
                receipt.confirmed,receipt.checkByBank,
                receipt.accepted,receipt.settled);
    }
    
    //只有账单的直接三方可以获取账单合约详情
    function getRecDetail(uint256 index)public returns(string detail){
        require(index>=0&&index<receipts.length&&
                (receipts[index].bank==msg.sender||receipts[index].lender==msg.sender||receipts[index].borrower==msg.sender));
        return recDetails[index];
    }

    function getRecBatch(uint256[] indexes)
        public returns(address[] coreCompanyAdd,
                address[] lenderAddress,
                address[] bankAddress,
                uint256[] amount,uint256[] sTimeStamp,
                uint256[] eTimeStamp,uint8[] code
                )
    {
        coreCompanyAdd= new address[](uint256(indexes.length));
        lenderAddress = new address[](uint256(indexes.length));
        bankAddress = new address[](uint256(indexes.length));
        amount = new uint256[](uint256(indexes.length));
        sTimeStamp = new uint256[](uint256(indexes.length));
        eTimeStamp = new uint256[](uint256(indexes.length));
        code = new uint8[](uint256(indexes.length));
        for(uint256 i = 0; i < indexes.length; i++){
            uint256 index = indexes[i];
            require(index>=0&&index<receipts.length);
            Receipt storage receipt = receipts[index];      
            coreCompanyAdd[i] = receipt.borrower;
            lenderAddress[i] = receipt.lender;
            bankAddress[i] = receipt.bank;
            amount[i] = receipt.amount;
            sTimeStamp[i] = receipt.sTimeStamp;
            eTimeStamp[i] = receipt.eTimeStamp;
            code[i] = 0;
            if(receipt.signed)code[i]+=16;
            if(receipt.confirmed)code[i]+=8;
            if(receipt.checkByBank)code[i]+=4;
            if(receipt.accepted)code[i]+=2;
            if(receipt.settled)code[i]+=1;
        }
    }
    
    
    function transfer(address receiver, uint256 index, uint256 amount)
        public returns(bool success)
    {
        if(!(index>=0&&
            index<tokens.length&&
            tokens[index].owner==msg.sender&&
            receiver!=msg.sender&&
            tokens[index].amount>=amount
            ))
            return false;
            //Data Invalid(Invalid index/Not your token/Token not enough)
        Token storage token =  tokens[index];
        token.amount -= amount;
        tokenOf[receiver].push(tokens.length);
        recTokens[index].push(tokens.length);
        uint256 newTokenIndex = tokens.length;
        Token memory newToken = Token(index,amount,receiver,token.owner,token.source,
                            token.publisher,token.returnTimestamp, token.hasSettled);
        tokens.push(newToken);
        uint256 recordIndex = transferRecords.length;
        transferRecords.push(TransferRecord(index,newTokenIndex,amount,
                                            msg.sender,receiver));
        transferRecsOf[msg.sender].push(recordIndex);
        transferRecsOf[receiver].push(recordIndex);
        return true;
    }
    
    function getAllTransferRecs()
        public returns(uint256[] prevToken,
                        uint256[] curToken,
                        uint256[] amount,
                        address[] from,address[] to)
    {
        uint256[] memory indexes = uint256[](transferRecsOf[msg.sender]);
        prevToken = new uint256[](uint256(indexes.length));
        curToken = new uint256[](uint256(indexes.length));
        amount = new uint256[](uint256(indexes.length));
        from = new address[](uint256(indexes.length));
        to = new address[](uint256(indexes.length));
        for(uint256 i = 0; i <indexes.length; i++){
            uint256 index = indexes[i];
            TransferRecord storage record = transferRecords[index];
            prevToken[i] =  record.prevToken;
            curToken[i] = record.curToken;
            amount[i] = record.amount;
            from[i] = record.from;
            to[i] = record.to;
        }
    }

    function getAllTokenIndex()public returns(uint256[] tokenIndex){
        return uint256[](tokenOf[msg.sender]);
    }
    
    function getToken(uint256 index)
        public returns(uint256 recIndex,address owner,address from,address coreCompany,
                        address publisher,
                        uint256 amount,uint256 returnTimestamp, bool hasSettled)
    {
        require(
            index>=0&&
            index<tokens.length
            );
        Token storage token = tokens[index];
        return (token.recIndex,token.owner,token.from,token.source,
                token.publisher,
                token.amount,token.returnTimestamp,token.hasSettled);
    }

    function getTokenInfoBatch(uint256[] indexes)
        public returns(uint256[] recIndex,
                        address[] from,address[] source,
                        address[] publisher,
                        uint256[] amount,uint256[] returnTimestamp, bool[] hasSettled)
    {
        recIndex = new uint256[](uint256(indexes.length));
        from = new address[](uint256(indexes.length));
        source = new address[](uint256(indexes.length));
        publisher = new address[](uint256(indexes.length));
        amount = new uint256[](uint256(indexes.length));
        returnTimestamp = new uint256[](uint256(indexes.length));
        hasSettled = new bool[](uint256(indexes.length));
        for(uint256 i = 0; i <indexes.length; i++){
            uint256 index = indexes[i];
            Token storage token = tokens[index];
            recIndex[i] =  token.recIndex;
            from[i] = token.from;
            source[i] = token.source;
            publisher[i] = token.publisher;
            amount[i] = token.amount;
            returnTimestamp[i] = token.returnTimestamp;
            hasSettled[i] = token.hasSettled;
        }
    }
    
    function settleRec(uint256 index)
        public returns(bool success)
    {
        if(!(index>=0&&
            index<receipts.length&&
            msg.sender==receipts[index].bank
            ))
            return false;
        uint256[] memory tokenIndex = recTokens[index];
        for(uint256 i = 0 ; i<tokenIndex.length;i++){
            tokens[tokenIndex[i]].hasSettled=true;
        }
        
        receipts[index].settled = true;
        uint256 len = unsettledRec[msg.sender].length;
        i = unsettledRecMap[index];
        unsettledRec[msg.sender][i]= unsettledRec[msg.sender][len-1];
        unsettledRec[msg.sender].length--;
        
        settledRec[msg.sender].push(index);
        return true;
    }
    
    function getUserRec()public returns(uint256 [] recIndex){
        return allRec4User[msg.sender];
    }

    function getAllRec4Bank()
        public returns(uint256[] pendingRecIndex,uint256[] unsettledRecIndex,uint256[] signedRecIndex)
    {
        require(isBank(msg.sender));
        return (pendingRec[msg.sender],unsettledRec[msg.sender],settledRec[msg.sender]);
    }
        
    function applyFinance(uint256 index,uint256 amount,address bank,uint16 rate)
        public returns(bool success)
    {
        if(index<0||
            index>=tokens.length||
            tokens[index].owner!=msg.sender||
            bank==msg.sender||
            tokens[index].amount<amount||
            (tokens[index].hasSettled&&
            now>=tokens[index].returnTimestamp)||
            rate==0||
            rate>10000  //控制融资比例，不可超出原有价值，也不可为0
        )return false;
        ap4Finances.push(Apply4Finance(index,amount,rate,msg.sender,bank,
                                false,false,tokens[index].returnTimestamp));
        uint256 _ind = ap4Finances.length-1;
        ap4Finance2User[msg.sender].push(_ind);
        ap4Finances2Bank[bank].push(_ind);
        ap4FinancesMap[_ind]=ap4Finances2Bank[bank].length-1;
        ap4Finance2User[bank].push(_ind);
        return true;
    }
    
    function applyWithdraw(uint256 index,uint256 amount)
        public returns(bool success)
    {
        if(!(index>=0&&
            index<tokens.length&&
            tokens[index].owner==msg.sender&&
            tokens[index].amount>=amount&&
            tokens[index].hasSettled&&
            now>=tokens[index].returnTimestamp
        ))return false;
        address bank = tokens[index].publisher;
        ap4Withdraws.push(Apply4Withdraw(index,amount,msg.sender,bank,false,false));
        uint256 _ind = ap4Withdraws.length-1;
        ap4Withdraw2User[msg.sender].push(_ind);
        ap4Withdraws2Bank[bank].push(_ind);
        ap4WithdrawsMap[_ind]=ap4Withdraws2Bank[bank].length-1;
        if(bank!=msg.sender)ap4Withdraw2User[bank].push(_ind);
        return true;
    }
    
    
    function getAp4Withdraw(uint256 index)
        public  
        returns(
            uint256 tokenIndex,
            uint256 amount,
            address applyer,
            address bank,
            bool checked,
            bool confirmed)
    {
        require(index>=0&&index<ap4Withdraws.length);
        Apply4Withdraw storage ap = ap4Withdraws[index];
        require(ap.bank == msg.sender||ap.applyer == msg.sender);
        return (ap.tokenIndex,ap.amount,ap.applyer,ap.bank,ap.checked,ap.confirmed);
    }

    function getAp4WithdrawBatch(uint256[] indexes)
        public returns(uint256[] tokenIndex, uint256[] amount, address[] applyer,
                                            address[] bank,bool[] checked,bool[] confirmed)
    {
        tokenIndex = new uint256[](uint256(indexes.length));
        amount = new uint256[](uint256(indexes.length));
        applyer = new address[](uint256(indexes.length));
        bank = new address[](uint256(indexes.length));
        checked = new bool[](uint256(indexes.length));
        confirmed = new bool[](uint256(indexes.length));
        for(uint256 i = 0; i < indexes.length;){
            uint256 index = indexes[i];
            if(index<0 || index >= ap4Withdraws.length)continue;
            Apply4Withdraw storage ap = ap4Withdraws[index];
            if(ap.bank!=msg.sender&&ap.applyer!=msg.sender)continue;
            tokenIndex[i] = ap.tokenIndex;
            amount[i]= ap.amount;
            applyer[i] =  ap.applyer;
            bank[i] = ap.bank;
            checked[i] = ap.checked;
            confirmed[i] = ap.confirmed;
            i++;
        }
    }
    
    function checkAp4Withdraw(uint256 index, bool confirm)
        public returns(bool success,uint8 code)
    {
        require(isBank(msg.sender));
        if(!(index>=0&&index<ap4Withdraws.length)
            ||ap4Withdraws[index].bank!=msg.sender
            ||ap4Withdraws[index].checked)
            return (false,1);
        Apply4Withdraw storage ap = ap4Withdraws[index];
        ap.checked = true;
        if(confirm){
            ap.confirmed = true;
            Token storage token = tokens[ap.tokenIndex];
            if(token.amount<ap.amount||!(token.hasSettled&&now>=token.returnTimestamp))
                return (false,2);
            token.amount -= ap.amount;
            cash[token.owner]+=ap.amount;
        }
        uint256 _ind = ap4WithdrawsMap[index];
        ap4Withdraws2Bank[msg.sender][_ind]=ap4Withdraws2Bank[msg.sender][ap4Withdraws2Bank[msg.sender].length-1];
        ap4Withdraws2Bank[msg.sender].length--;
        return (true,0);
    }
    
    
    function getApplication2All()
        public returns(uint256[] ap4Finances,uint256[] ap4Withdraws )
    {
        return (ap4Finance2User[msg.sender],ap4Withdraw2User[msg.sender]);
    }

    function getApplication()
        public returns(uint256[] Ap4finance,uint256[] Ap4Withdraw,uint256[]AllAp4Finance,uint256[]AllAp4Withdraw)
    {
        require(isBank(msg.sender));
        return (ap4Finances2Bank[msg.sender],ap4Withdraws2Bank[msg.sender],ap4Finance2User[msg.sender],ap4Withdraw2User[msg.sender]);
    }

    //根据index批量获取融资申请，只可获取自己作为银行或申请者的申请信息
    function getAp4FinanceBatch(uint256[] indexes)
        public returns(uint256[] tokenIndex, uint256[] amount, address[] applyer,uint16[] applyRate,
                                            address[] bank,bool[] checked,bool[] confirmed)
    {
        tokenIndex = new uint256[](uint256(indexes.length));
        amount = new uint256[](uint256(indexes.length));
        applyer = new address[](uint256(indexes.length));
        applyRate = new uint16[](uint256(indexes.length));
        bank = new address[](uint256(indexes.length));
        checked = new bool[](uint256(indexes.length));
        confirmed = new bool[](uint256(indexes.length));
        for(uint256 i = 0; i < indexes.length;){
            uint256 index = indexes[i];
            if(index<0 || index >= ap4Finances.length)continue;
            Apply4Finance storage ap = ap4Finances[index];
            if(ap.bank!=msg.sender&&ap.applyer!=msg.sender)continue;
            tokenIndex[i] = ap.tokenIndex;
            amount[i]= ap.amount;
            applyer[i] =  ap.applyer;
            applyRate[i] = ap.applyRate;
            bank[i] = ap.bank;
            checked[i] = ap.checked;
            confirmed[i] = ap.confirmed;
            i++;
        }
    }
    
    function getAp4Finance(uint256 index)
        public
        returns(
            uint256 tokenIndex,
            uint256 amount,
            address applyer,
            uint16 applyRate,
            address bank,
            bool checked,
            bool confirmed)
    {
        require(index>=0&&index<ap4Finances.length);
        Apply4Finance storage ap = ap4Finances[index];
        require(ap.bank == msg.sender || ap.applyer==msg.sender);
        return (ap.tokenIndex,ap.amount,ap.applyer,ap.applyRate,ap.bank,ap.checked,ap.confirmed);
    }
    
    
    function checkAp4Finance(uint256 index, bool confirm)
        public returns(bool success,uint8 code)
    {
        require(isBank(msg.sender));
        if(!(index>=0&&index<ap4Finances.length)
            ||msg.sender!=ap4Finances[index].bank
            ||ap4Finances[index].checked
            )return (false,1);
        
        Apply4Finance storage ap = ap4Finances[index];
        
        ap.checked = true;
        uint256 _ind = ap4FinancesMap[index];
        uint256 len = ap4Finances2Bank[msg.sender].length;
        ap4Finances2Bank[msg.sender][_ind]=ap4Finances2Bank[msg.sender][len-1];
        ap4Finances2Bank[msg.sender].length--;
        if(ap.expireDate<=now){
            return (false ,2);
        }
        if(confirm){
            ap.confirmed = true;
            Token storage token = tokens[ap.tokenIndex];
            if(token.amount<ap.amount)
            return (false,3);
            // return (false,"Token not enough");
            token.amount -= ap.amount;
            //TODO:Token to cash
            cash[ap.applyer]+=ap.amount*ap.applyRate/10000;
            tokenOf[msg.sender].push(tokens.length);
            recTokens[token.recIndex].push(tokens.length);
            tokens.push(Token(token.recIndex,ap.amount,msg.sender,token.owner,token.source,token.publisher,token.returnTimestamp,false));
        }
        return (true,0);
    }
    
    
    function getCash() public returns(uint256 cashAmount){
        return cash[msg.sender];
    }
    
}


