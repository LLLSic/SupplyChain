## 项目说明
该项目是区块链供应链金融系统的后端项目，需将前端生成的dist文件置于本目录下的public文件夹中。
另外，后端除与节点连接的配置信息以及不同账号的私钥外并不保存任何信息，账户配置见下文。
连接新节点需要配置\api\conf\config.json下的节点地址和RPC通讯端口,并替换\api\conf\key,\api\conf\ca,\api\conf\cert下的证书。
```
    "nodes": [
        {
            "ip": "47.98.133.64",
            "port": "20200"
        }
```
## 使用注意

```
npm install         // 安装项目依赖

// 开启服务器，浏览器访问 http://localhost:3000
npm start

```


## 添加新账户方法

将根目录下get_account.sh生成的私钥文件置于\api\conf\accounts\目录下
并修改\api\conf\config.json文件的privateKey项,添加新增项,添加格式如：
```
        "华为":{ 
            "type": "pem",
            "value":"./accounts/0x43ed12399576540c80b3be1525e15897318ee044.pem"
        },
```