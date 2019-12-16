pragma solidity ^0.4.24;

import "./Table.sol";

contract Asset {
    // event
    event RegisterEvent(int256 ret, string account, uint256 asset_value);
    event TransferEvent(int256 ret, string from_account, string to_account, uint256 amount);
    
    constructor() public {
        // 构造函数中创建t_asset表
        createTable();
    }

    function createTable() private {
        TableFactory tf = TableFactory(0x1001); 
        // 资产管理表, key : account, field : asset_value
        // |  资产账户(主键)      |     资产金额       |
        // |-------------------- |-------------------|
        // |        account      |    asset_value    |     
        // |---------------------|-------------------|
        //
        // 创建表
        tf.createTable("t_asset2", "account", "asset_value");
         // 资产管理表, key : account, field : asset_value
        // |  资产账户(主键)      |     信用额度       |
        // |-------------------- |-------------------|
        // |        account      |    credit    |     
        // |---------------------|-------------------|
        //
        tf.createTable("t_credit2", "account", "credit");
    }

    function openTable() private returns(Table) {
        TableFactory tf = TableFactory(0x1001);
        Table table = tf.openTable("t_asset2");
        return table;
    }
    function openTable1() private returns(Table) {
        TableFactory tf = TableFactory(0x1001);
        Table table = tf.openTable("t_credit2");
        return table;
    }
    /*
    描述 : 根据资产账户查询资产金额
    参数 ： 
            account : 资产账户

    返回值：
            参数一： 成功返回0, 账户不存在返回-1
            参数二： 第一个参数为0时有效，资产金额
    */
    function select(string account) public constant returns(int256, uint256, uint256) {
        // 打开表
        Table table = openTable();
        // 查询
        Entries entries = table.select(account, table.newCondition());
        uint256 asset_value = 0;
        uint256 credit = 0;
        if (0 == uint256(entries.size())) {
            return (-1, asset_value, credit);
        } else {
            Entry entry = entries.get(0);
            uint256 res1 = uint256(entry.getInt("asset_value"));

            table = openTable1();
            entries = table.select(account, table.newCondition());
            entry = entries.get(0);
            uint256 res2 = uint256(entry.getInt("credit"));
            return (0, res1, res2);
        }
    }

    /*
    描述 : 资产注册
    参数 ： 
            account : 资产账户
            amount  : 资产金额
    返回值：
            0  资产注册成功
            -1 资产账户已存在
            -2 其他错误
    */
    function register(string account, uint256 asset_value, uint256 credit) public returns(int256){
        int256 ret_code = 0;
        int256 ret= 0;
        uint256 temp_asset_value = 0;
        uint256 temp_credit = 0;
        // 查询账户是否存在
        (ret, temp_asset_value, temp_credit) = select(account);
        if(ret != 0) {
            Table table = openTable();
            
            Entry entry = table.newEntry();
            entry.set("account", account);
            entry.set("asset_value", int256(asset_value));
            // 插入
            int count = table.insert(account, entry);

            table = openTable1();
            entry = table.newEntry();
            entry.set("account",account);
            entry.set("credit", int256(credit));
            count = table.insert(account, entry);
            if (count == 1) {
                // 成功
                ret_code = 0;
            } else {
                // 失败? 无权限或者其他错误
                ret_code = -2;
            }
        } else {
            // 账户已存在
            ret_code = -1;
        }

        emit RegisterEvent(ret_code, account, asset_value);

        return ret_code;
    }

    /*
    描述 : 使用信用额度交易
    参数 ： 
            from_account : 转移资产账户
            to_account ： 接收资产账户
            amount ： 转移金额
    返回值：
            0  资产转移成功
            -1 转移资产账户不存在
            -2 接收资产账户不存在
            -3 信用不足
            -4 信用溢出
            -5 其他错误
    */
    function transfer(string from_account, string to_account, uint256 amount) public returns(int256) {
        // 查询转移资产账户信息
        int ret_code = 0;
        int256 ret = 0;
        uint256 from_asset_value = 0;
        uint256 to_asset_value = 0;
        uint256 from_credit = 0;
        uint256 to_credit = 0;
        // 转移账户是否存在?
        (ret, from_asset_value, from_credit) = select(from_account);
        if(ret != 0) {
            ret_code = -1;
            // 转移账户不存在
            emit TransferEvent(ret_code, from_account, to_account, amount);
            return ret_code;

        }

        // 接受账户是否存在?
        (ret, to_asset_value, to_credit) = select(to_account);
        if(ret != 0) {
            ret_code = -2;
            // 接收资产的账户不存在
            emit TransferEvent(ret_code, from_account, to_account, amount);
            return ret_code;
        }

        if(from_credit < amount) {
            ret_code = -3;
            // 转移资产的账户金额不足
            emit TransferEvent(ret_code, from_account, to_account, amount);
            return ret_code;
        } 

        if (to_credit + amount < to_credit) {
            ret_code = -4;
            // 接收账户信用
            emit TransferEvent(ret_code, from_account, to_account, amount);
            return ret_code;
        }

        Table table = openTable1();

        Entry entry0 = table.newEntry();
        entry0.set("account", from_account);
        entry0.set("credit", int256(from_credit - amount));
        // 更新转账账户
        int count = table.update(from_account, entry0, table.newCondition());
        if(count != 1) {
            ret_code = -5;
            // 失败? 无权限或者其他错误?
            emit TransferEvent(ret_code, from_account, to_account, amount);
            return ret_code;
        }

        Entry entry1 = table.newEntry();
        entry1.set("account", to_account);
        entry1.set("credit", int256(to_credit + amount));
        // 更新接收账户
        table.update(to_account, entry1, table.newCondition());

        emit TransferEvent(ret_code, from_account, to_account, amount);

        return ret_code;
    }
    /*
    描述 : 将部分信用额度转化为资产
    参数 ： 
            account: 用户
            amount ： 转移金额
    返回值：
            0  资产转移成功
            -1 资产账户不存在
            -2 信用下溢
            -3
    */
    function makeMoney(string from_account, uint256 amount) public returns(int256) {
        // 查询转移账户信息
        int ret_code = 0;
        int256 ret = 0;
        uint256 from_asset_value = 0;
        uint256 from_credit = 0;
        // 转移账户是否存在?
        (ret, from_asset_value, from_credit) = select(from_account);
        if(ret != 0) {
            ret_code = -1;
            // 账户不存在
            return ret_code;

        }

        if(from_credit < amount + 50000) {
            ret_code = -2;
            // 转移资产的账户信用不足
            return ret_code;
        } 


        Table table = openTable1();

        Entry entry0 = table.newEntry();
        entry0.set("account", from_account);
        entry0.set("credit", int256(from_credit - amount));
        // 更新转账账户
        int count = table.update(from_account, entry0, table.newCondition());
        if(count != 1) {
            ret_code = -3;
            // 失败? 无权限或者其他错误?
            return ret_code;
        }
        table = openTable();
        Entry entry1 = table.newEntry();
        entry1.set("account", from_account);
        entry1.set("asset_value", int256(from_asset_value + amount));
        // 更新接收账户
        table.update(from_account, entry1, table.newCondition());
        return ret_code;
    }
}