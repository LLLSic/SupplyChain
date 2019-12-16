<template>
  <div>
    <Card>
        <h1>借还服务</h1>
        <Row style = "margin: 10px 0">
            <Col span="20">
                <Row>
                    <Button type="primary" style="width: 100px; font-size: 13px; margin-right: 10px" @click="openRegister">注册用户</Button>
                    <Button type="primary" style="width: 100px; font-size: 13px; margin-right: 10px" @click="openDeal">借贷服务</Button>
                    <Button type="success" style="width: 100px; font-size: 13px; margin-right: 10px" @click="openInfo">用户信息</Button>
                </Row>
            </Col>
        </Row>
    </Card>
    <!-- //表格部分 -->
      <Card>
      <Table border :columns="columns" :data="datalist" disabled-hover></Table>
      <div style="margin: 10px;overflow: hidden">
          <div style="float: right;">
          <Page show-total show-elevator :total="page.total" :current="page.currentPage"
                  ></Page>
          </div>
      </div>
      </Card>
      <Modal v-model="isRegister" title="注册用户">
          <Form :model="addForm" ref="addForm" :label-width="110" :rules="addRules">
              <FormItem label="用户名称" prop="account" >
                  <Input  clearable v-model="addForm.account" placeholder = "请输入用户名称"/>
              </FormItem>
              <FormItem label="用户资产" prop="property" >
                  <Input  clearable v-model="addForm.property" placeholder = "请输入用户资产"/>
              </FormItem>
              <FormItem label="用户信用额度" prop="credit" >
                  <Input  clearable v-model="addForm.credit" placeholder = "请输入用户信用额度"/>
              </FormItem>
              <FormItem label="合约名称" prop="contract" >
                  <Input  clearable v-model="addForm.contract" placeholder = "请输入合约名称"/>
              </FormItem>
              <FormItem label="合约地址" prop="addr" >
                  <Input  clearable v-model="addForm.addr" placeholder = "请输入合约地址"/>
              </FormItem>
          </Form>
          <div slot="footer">
            <Button type="text" @click="cancelRegister">取消</Button>
          <Button type="primary" @click="doRegister">注册</Button>
      </div>
      </Modal>
      

    <!-- 借贷服务 -->
    <Modal v-model="isDeal" title="借贷服务">
          <Form :model="dealForm" ref="dealForm" :label-width="110" :rules="dealRules">
              <FormItem label="买家" prop="fromAccount" >
                  <Input  clearable v-model="dealForm.fromAccount" placeholder = "请输入用户名称"/>
              </FormItem>
              <FormItem label="卖家" prop="toAccount" >
                  <Input  clearable v-model="dealForm.toAccount" placeholder = "请输入用名称"/>
              </FormItem>
              <FormItem label="金额" prop="amount" >
                  <Input  clearable v-model="dealForm.amount" placeholder = "请输入金额"/>
              </FormItem>
              <FormItem label="合约名称" prop="contract" >
                  <Input  clearable v-model="dealForm.contract" placeholder = "请输入合约名称"/>
              </FormItem>
              <FormItem label="合约地址" prop="addr" >
                  <Input  clearable v-model="dealForm.addr" placeholder = "请输入合约地址"/>
              </FormItem>
          </Form>
          <div slot="footer">
            <Button type="text" @click="cancelDeal">取消</Button>
          <Button type="primary" @click="doDeal">交易</Button>
      </div>
      </Modal>


       <!-- 用户信息 -->
    <Modal v-model="isInfo" title="用户信息">
          <Form :model="infoForm" ref="infoForm" :label-width="110" :rules="infoRules">
              <FormItem label="用户名称" prop="account" >
                  <Input  clearable v-model="infoForm.account" placeholder = "请输入用户名称"/>
              </FormItem>
              <FormItem label="合约名称" prop="contract" >
                  <Input  clearable v-model="infoForm.contract" placeholder = "请输入合约名称"/>
              </FormItem>
              <FormItem label="合约地址" prop="addr" >
                  <Input  clearable v-model="infoForm.addr" placeholder = "请输入合约地址"/>
              </FormItem>
          </Form>
          <div slot="footer">
            <Button type="text" @click="cancelInfo">取消</Button>
          <Button type="primary" @click="doInfo">查询</Button>
      </div>
      </Modal>
  </div>
</template>

<script>
import axios from "@/libs/api.request";
import qs from 'qs'
// Vue.prototype.$qs = qs
export default {
  data() {
    return {
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '用户名称',
          align: 'center',
          key: 'account',
          // 过滤器
          render: (h, params) => {
            let temp = params.row[params.column.key]
            if (typeof (temp) === 'undefined') {
              return h('div', '0')
            } else {
              return h('div', params.row[params.column.key])
            }
          }
        },
        {
          title: '用户资产',
          align: 'center',
          key: 'property',
          // 过滤器
          render: (h, params) => {
            let temp = params.row[params.column.key]
            if (typeof (temp) === 'undefined') {
              return h('div', '0')
            } else {
              return h('div', params.row[params.column.key])
            }
          }
        },
        {
          title: '用户信用额度',
          align: 'center',
          key: 'credit',
          // 过滤器
          render: (h, params) => {
            let temp = params.row[params.column.key]
            if (typeof (temp) === 'undefined') {
              return h('div', '0')
            } else {
              return h('div', params.row[params.column.key])
            }
          }
        },
      ],
      // 表单校验对象
      addRules: {
        account: [
          { required: true, message: '用户名称不能为空', trigger: 'blur' },
        ],
        property: [
          { required: true, message: '用户资产不能为空', trigger: 'blur' }
        ],
        credit: [
          { required: true, message: '用户信用不能为空', trigger: 'blur' }
        ],
        contract: [
          { required: true, message: '合约名称不能为空', trigger: 'blur' }
        ],
        addr: [
          { required: true, message: '合约地址不能为空', trigger: 'blur' }
        ],
      },
      dealRules: {
        fromAccount: [
          { required: true, message: '买家名称不能为空', trigger: 'blur' },
        ],
        toAccount: [
          { required: true, message: '卖家名称不能为空', trigger: 'blur' }
        ],
        amount: [
          { required: true, message: '金额不能为空', trigger: 'blur' }
        ],
        contract: [
          { required: true, message: '合约名称不能为空', trigger: 'blur' }
        ],
        addr: [
          { required: true, message: '合约地址不能为空', trigger: 'blur' }
        ],
      },
      // 表单校验对象
      infoRules: {
        account: [
          { required: true, message: '用户名称不能为空', trigger: 'blur' },
        ],
        contract: [
          { required: true, message: '合约名称不能为空', trigger: 'blur' }
        ],
        addr: [
          { required: true, message: '合约地址不能为空', trigger: 'blur' }
        ],
      },
      page: {// 系统用户翻页对象
        total: 10,
        currentPage: 1,
        current: 1
      },
      isRegister: false,
      isDeal: false,
      isInfo: false,
      addForm: {},
      dealForm: {},
      infoForm: {},
      datalist: [
      ]
    };
  },
  methods: {
      //make deal
    async makeDeal(params) {
      //直接全局变量给他是不行的
      //要设置一个self中介
      let self = this
      let result = {}

      console.info('param ',params)
      await axios.request({
          url: "transfer",
          data: params,
          headers:{
            'Content-type': 'application/x-www-form-urlencoded',
          },
          method: "post"
      }).then(function(res) {
          console.info(res.data);
          result = res.data
          let retCode = result.output
        //   self.datalist.push(params)
        let form = {}
        form.account = params.account
        form.property = result.output[1]
        form.credit = result.output[2]
        // self.datalist.push(form)
      });
    },  
      //user information
    async information(params) {
      //直接全局变量给他是不行的
      //要设置一个self中介
      let self = this
      let result = {}

      console.info('param ',params)
      await axios.request({
          url: "select",
          data: params,
          headers:{
            'Content-type': 'application/x-www-form-urlencoded',
          },
          method: "post"
      }).then(function(res) {
          console.info(res.data);
          result = res.data
          let retCode = result.output
        //   self.datalist.push(params)
        let form = {}
        form.account = params.account
        form.property = result.output[1]
        form.credit = result.output[2]
        let flag = false
        for(let i = 0; i < self.datalist.length; i = i +1){
            if(self.datalist[i].account == form.account){
                flag = true
                self.datalist[i].property = form.property
                
                self.datalist[i].credit = form.credit
            }
        }
        if(flag == false){
            self.datalist.push(form)
        }
      });
    },


    async register(params) {
      //直接全局变量给他是不行的
      //要设置一个self中介
      let self = this
      let result = {}
    //   let da = {
    //     contractName: param,
    //   }
      console.info('param ',params)
      await axios.request({
          url: "register",
          data: params,
          headers:{
            'Content-type': 'application/x-www-form-urlencoded',

          },
          method: "post"
      }).then(function(res) {
          console.info(res.data);
          result = res.data
          let retCode = result.output
          //注册失败
            if(retCode[0] != "0") {
            }
            else {
                self.datalist.push(params)
                console.info('333',result.output)
                return 1
            }
          // this.list.push({name: 'Asset'})
        //   self.datalist.push({name: param,contractAddress: result.contractAddress})
      });
    },
    openRegister(){
      this.isRegister = true
    },
    doRegister(){
        let self = this
        this.$refs.addForm.validate(async (valid) =>{ //检验表单
        if(valid){
          console.info('register form',this.addForm.account, this.addForm.property, this.addForm.credit)
          let content = {}
          content.account = this.addForm.account
          content.property = this.addForm.property
          content.credit = this.addForm.credit
          content.contract = this.addForm.contract
          content.addr = this.addForm.addr
          content.func = 'register'
          this.register(content)
          
          
          this.$Message.success('注册成功')
          this.cancelRegister()
        }
        else {
          this.$Message.error('请正确填写表单')
        }
      })
      // this.isRegister = false
    },
    cancelRegister () {
      // 重置功能添加表单对象
      this.$refs.addForm.resetFields()
      this.addForm = {}
      this.isRegister = false
    },
    cancelInfo() {
      this.$refs.infoForm.resetFields()
      this.infoForm = {}
      this.isInfo = false
    },
    cancelDeal() {
      this.$refs.dealForm.resetFields()
      this.dealForm = {}
      this.isDeal = false
    },
    openDeal() {
        this.isDeal = true
    },
    openInfo(){
        this.isInfo = true
    },
    doInfo() {
        let self = this
        this.$refs.infoForm.validate(async (valid) =>{ //检验表单
        if(valid){
          let content = {}
          content.account = this.infoForm.account
          content.contract = this.infoForm.contract
          content.addr = this.infoForm.addr
          content.func = 'select'
          this.information(content)
        //   this.deploy(this.addForm.name)
          this.$Message.success('查询成功')
          this.cancelInfo()
        }
        else {
          this.$Message.error('请正确填写表单')
        }
      })
    },
    doDeal() {
        let self = this
        this.$refs.dealForm.validate(async (valid) =>{ //检验表单
        if(valid){
          let content = {}
          content.fromAccount = this.dealForm.fromAccount
          content.toAccount = this.dealForm.toAccount
          content.amount = this.dealForm.amount
          content.contract = this.dealForm.contract
          content.addr = this.dealForm.addr
          content.func = 'transfer'
          this.makeDeal(content)
        //   this.deploy(this.addForm.name)
          this.$Message.success('借贷成功')
          this.cancelDeal()
        }
        else {
          this.$Message.error('请正确填写表单')
        }
      })
    }
  },
  created () {
    // this.deploy('Asset')
    this.isRegister = false
  },
  
};
</script>

<style lang="css">
</style>