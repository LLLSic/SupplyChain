<template>

  <div>
    <!-- //页面里面的左上角（几个按钮上面的标题） -->
    <Card>
        <h1>SupplyChain</h1>
        <Row style = "margin: 10px 0">
            <Col span="20">
                <Row>
                    <!-- 1.0 点击发起新合同 -->
                    <Button type="primary" style="width: 100px; font-size: 13px; margin-right: 10px" @click="openAddContract">发起新合同</Button>
                    <Button type="primary" style="width: 100px; font-size: 13px; margin-right: 10px" @click="openTransfer">单据转让</Button>
                    <Button type="success" style="width: 100px; font-size: 13px; margin-right: 10px" @click="openFinancing">单据融资</Button>
                    <Button type="success" style="width: 100px; font-size: 13px; margin-right: 10px" @click="openSettle">结算账款</Button>
                </Row>
            </Col>
        </Row>
    </Card>
    <!-- //表格部分 -->  <!-- 先排版，内容看后面的datalist -->
      <Card>
      <Table border :columns="columns" :data="datalist" disabled-hover></Table>
      <div style="margin: 10px;overflow: hidden">
          <div style="float: right;">
          <Page show-total show-elevator :total="page.total" :current="page.currentPage"
                  ></Page>
          </div>
      </div>

      <!-- 发起新合同 -->
      </Card>
      <!-- 3.0 isAddContract为1从而展开这个card -->
      <Modal v-model="isAddContract" title="发起新合同">
          <!-- 3.0.1 AddContractForm 是一个数组 3.0.2 AddContractRules -->
          <Form :model="AddContractForm" ref="AddContractForm" :label-width="110" :rules="AddContractRules">
              <FormItem label="欠款方地址" prop="fromAccount" >
                  <Input  clearable v-model="AddContractForm.fromAccount" placeholder = "请输入新合同收款方地址"/>
              </FormItem>
              <FormItem label="收款方地址" prop="toAccount" >
                  <Input  clearable v-model="AddContractForm.toAccount" placeholder = "请输入新合同收款方地址"/>
              </FormItem>
              <FormItem label="见证方地址" prop="prover" >
                  <Input  clearable v-model="AddContractForm.prover" placeholder = "请输入见证该合同方地址"/>
              </FormItem>              
              <FormItem label="金额" prop="amount" >
                  <Input  clearable v-model="AddContractForm.amount" placeholder = "请输入转让金额"/>
              </FormItem>
          </Form>
          <div slot="footer">
            <!-- 3.0.3 点击取消 到cancelAddContract函数 -->
            <Button type="text" @click="cancelAddContract">取消</Button>
          <!-- 4.0 提交发起-->
          <Button type="primary" @click="doAddContract">确认发起</Button>
      </div>
      </Modal>
      

      <!-- 单据转让 -->
      <Modal v-model="isTransfer" title="单据转让">
          <Form :model="TransferForm" ref="TransferForm" :label-width="110" :rules="TransferRules">
              <FormItem label="单据拥有者地址" prop="fromAccount" >
                  <Input  clearable v-model="TransferForm.fromAccount" placeholder = "请输入该用户地址"/>
              </FormItem>
              <FormItem label="转让地址" prop="toAccount" >
                  <Input  clearable v-model="TransferForm.toAccount" placeholder = "请输入该用户地址"/>
              </FormItem>
              <FormItem label="金额" prop="amount" >
                  <Input  clearable v-model="TransferForm.amount" placeholder = "请输入转让金额"/>
              </FormItem>
              <FormItem label="单据ID" prop="receiptID" >
                  <Input  clearable v-model="TransferForm.receiptID" placeholder = "请输入用于转让的凭借单据ID"/>
              </FormItem>
          </Form>
          <div slot="footer">
            <Button type="text" @click="cancelTransfer">取消</Button>
          <Button type="primary" @click="doTransfer">确认交易</Button>
      </div>
      </Modal>

      <!-- 单据融资 -->
      <Modal v-model="isFinancing" title="单据融资">
          <Form :model="FinancingForm" ref="FinancingForm" :label-width="110" :rules="FinancingRules">
              <FormItem label="单据ID" prop="receiptID" >
                  <Input  clearable v-model="FinancingForm.receiptID" placeholder = "请输入用于融资的凭借单据ID"/>
              </FormItem>
          </Form>
          <div slot="footer">
            <Button type="text" @click="cancelFinancing">取消</Button>
          <Button type="primary" @click="doFinancing">确认融资</Button>
      </div>
      </Modal>

      <!-- 结算账款 -->
      <Modal v-model="isSettle" title="结算账款">
          <Form :model="SettleForm" ref="SettleForm" :label-width="110" :rules="SettleRules">
              <FormItem label="单据ID" prop="receiptID" >
                  <Input  clearable v-model="SettleForm.receiptID" placeholder = "请输入结算的单据ID"/>
              </FormItem>
          </Form>
          <div slot="footer">
            <Button type="text" @click="cancelSettle">取消</Button>
          <Button type="primary" @click="doSettle">确认已结算</Button>
      </div>
      </Modal>
  </div>
</template>


<script>
import axios from "@/libs/api.request";
import qs from 'qs';

// Vue.prototype.$qs = qs
export default {
  data() {
    //那个中间的单据表
    return {
      columns: [
        /*{
          type: 'selection',
          width: 60,
          align: 'center'
        },*/
        {
          title: '单据刷新原因',
          align: 'center',
          key: 'ReceiptType',
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
          title: '单据ID',
          align: 'center',
          key: 'receiptID',
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
          title: '发起者地址',
          align: 'center',
          key: 'fromAccount',
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
          title: '收款人地址',
          align: 'center',
          key: 'toAccount',
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
          title: '金额',
          align: 'center',
          key: 'amount',
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
          title: '确认人地址',
          align: 'center',
          key: 'prover',
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
          title: '是否已融资',
          align: 'center',
          key: 'financinged',
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
          title: '是否已结算',
          align: 'center',
          key: 'settled',
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
        /*
        {
          title: '被转让记录',
          align: 'center',
          key: 'transferRecord',
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
        */
        {
          title: '剩余价值',
          align: 'center',
          key: 'leftValue',
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
      //3.0.2 AddContractRules
      AddContractRules: {
        fromAccount: [
          { required: true, message: '欠款人地址不能为空', trigger: 'blur' }
        ],
        toAccount: [
          { required: true, message: '转让地址（收款人）不能为空', trigger: 'blur' }
        ],
        prover: [
          { required: true, message: '见证方地址不能为空', trigger: 'blur' }
        ],
        amount: [
          { required: true, message: '金额不能为空', trigger: 'blur' }
        ],
      },
      TransferRules: {
        fromAccount: [
          { required: true, message: '此单据拥有者地址不能为空', trigger: 'blur' }
        ],
        toAccount: [
          { required: true, message: '转让地址不能为空', trigger: 'blur' }
        ],
        amount: [
          { required: true, message: '金额不能为空', trigger: 'blur' }
        ],
        receiptID: [
          { required: true, message: '单据ID不能为空', trigger: 'blur' }
        ],
      },
      FinancingRules: {
        receiptID: [
          { required: true, message: '单据ID不能为空', trigger: 'blur' }
        ],
      },
      SettleRules: {
        receiptID: [
          { required: true, message: '单据ID不能为空', trigger: 'blur' }
        ],
      },
     
      page: {// 系统用户翻页对象
        total: 10,
        currentPage: 1,
        current: 1
      },
      
      isAddContract: false,
      isTransfer: false,
      isFinancing: false,
      isSettle: false,
      //isInfo: false,
      AddContractForm: {},
      TransferForm: {},
      FinancingForm: {},
      SettleForm: {},
      //infoForm: {},
      datalist: [
      ]
    };
  },
  
  
  methods: {
      //make Transfer   ccccccccccccccccccccccccccccccccc
    //点击Transfer的确认交易后1.1
    async makeTransfer2(params) {
        let self = this
        let result = {}

        console.info('param ',params)
        self.datalist.push(params)
    },
    async makeTransfer(params) {
      //直接全局变量给他是不行的
      //要设置一个self中介
      let self = this
      let result = {}

      console.info('param ',params)
      await axios.request({
          url: "Transfer",
          data: params,
          headers:{
            'Content-type': 'application/x-www-form-urlencoded',
          },
          method: "post"
      }).then(function(res) {  //得到res！？？？？
          console.info(res.data);  //得到控制台的数据
          result = res.data
          let retCode = result.output
          self.datalist.push(params)
        /*
        if(retCode[0] != "0") {
            }
            else {
                self.datalist.push(params)
                console.info('333',result.output)
                return 1
            }
            */
        let form = {}
        form.ReceiptType = "transfer"  //!!!!
        form.receiptID = self.datalist.length+1
        form.fromAccount = this.AddContractForm.fromAccount
        form.toAccount = this.AddContractForm.toAccount
        form.amount = this.AddContractForm.amount
        form.prover = 0

        form.financinged = 0
        form.settled = 0
        form.transferRecord = []
        form.leftValue = this.AddContractForm.amount
        self.datalist.push(form)

        //let flag = false
        let form1 = {}
        form1.ReceiptType = "fresh"  //!!!!
        form1.receiptID = self.datalist.length+1
        form1.fromAccount = self.datalist[this.AddContractForm.receiptID-1].fromAccount
        form1.toAccount = self.datalist[this.AddContractForm.receiptID-1].toAccount
        form1.amount = self.datalist[this.AddContractForm.receiptID-1].amount
        form1.prover = self.datalist[this.AddContractForm.receiptID-1].prover

        form1.financinged = 0
        form1.settled = 0
        form1.transferRecord = self.datalist[this.AddContractForm.receiptID-1].transferRecord.push(form.receiptID)
        form1.leftValue = self.datalist[this.AddContractForm.receiptID-1].amount-this.AddContractForm.amount
        self.datalist.push(form1)
                
        /*
        if(flag == true){
          self.datalist.push(form)
        }*/

        
      });
    },  

    //5.0
    async makeAddContract(params) {
      //直接全局变量给他是不行的
      //要设置一个self中介
      let self = this
      let result = {}
      //   let da = {
      //     contractName: param,
      //   }
      console.info('param ',params)
      await axios.request({
          url: "AddContract",
          data: params,
          headers:{
            'Content-type': 'application/x-www-form-urlencoded',

          },
          method: "post"
      }).then(function(res) {
          console.info(res.data);
          result = res.data
          let retCode = result.output
          //发起新合同失败  这部分独有
          
            if(retCode = 0) {
            }
            else {
                self.datalist.push(params)
                /*
                let form = {}
                form.ReceiptType = "new"  //!!!!
                form.receiptID = self.datalist.length+1
                form.fromAccount = this.AddContractForm.fromAccount
                form.toAccount = this.AddContractForm.toAccount
                form.amount = this.AddContractForm.amount
                form.prover = this.AddContractForm.prover

                form.financinged = 0
                form.settled = 0
                form.transferRecord = []
                form.leftValue = this.AddContractForm.amount
                data:form
                self.datalist.push(form)
                */
                console.info('333',result.output)
                return 1
            }
            
          /*
          let form = {}
          form.ReceiptType = "new"  //!!!!
          form.receiptID = self.datalist.length+1
          form.fromAccount = this.AddContractForm.fromAccount
          form.toAccount = this.AddContractForm.toAccount
          form.amount = this.AddContractForm.amount
          form.prover = this.AddContractForm.prover

          form.financinged = 0
          form.settled = 0
          form.transferRecord = []
          form.leftValue = this.AddContractForm.amount
          self.datalist.push(form)
          */
          //let flag = false
          /*
          for(let i = 0; i < self.datalist.length; i = i +1){
              self.datalist[i].ReceiptType == form.ReceiptType
                  flag = true
                  self.datalist[i].receiptID = form.receiptID
                  self.datalist[i].fromAccount = form.fromAccount
                  self.datalist[i].toAccount = form.toAccount
                  self.datalist[i].amount = form.amount
                  self.datalist[i].prover = form.prover

                  self.datalist[i].financinged = form.financinged
                  self.datalist[i].settled = form.settled
                  self.datalist[i].transferRecord = form.transferRecord
                  self.datalist[i].leftValue = form.leftValue
              }
          }
          if(flag == false){
              self.datalist.push(form)
          }*/
          
          // this.list.push({name: 'Asset'})
        //   self.datalist.push({name: param,contractAddress: result.contractAddress})
      });
    },

    async makeFinancing(params) {
      //直接全局变量给他是不行的
      //要设置一个self中介
      let self = this
      let result = {}
      //   let da = {
      //     contractName: param,
      //   }
      console.info('param ',params)
      await axios.request({
          url: "Financing",
          data: params,
          headers:{
            'Content-type': 'application/x-www-form-urlencoded',
          },
          method: "post"
      }).then(function(res) {
          console.info(res.data);
          result = res.data
          let retCode = result.output
          //发起新合同失败  这部分独有
          
            if(retCode[0] != 0) {
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

    async makeSettle(params) {
      //直接全局变量给他是不行的
      //要设置一个self中介
      let self = this
      let result = {}
      //   let da = {
      //     contractName: param,
      //   }
      console.info('param ',params)
      await axios.request({
          url: "Settle",
          data: params,
          headers:{
            'Content-type': 'application/x-www-form-urlencoded',
          },
          method: "post"
      }).then(function(res) {
          console.info(res.data);
          result = res.data
          let retCode = result.output
          //发起新合同失败  这部分独有
          /*
            if(retCode[0] != "0") {
            }
            else {
                self.datalist.push(params)
                console.info('333',result.output)
                return 1
            }
            */
          let form1 = {}
          form1.ReceiptType = "financing" 
          form1.receiptID = self.datalist.length+1
          form1.fromAccount = self.datalist[this.AddContractForm.receiptID-1].fromAccount
          form1.toAccount = self.datalist[this.AddContractForm.receiptID-1].toAccount
          form1.amount = self.datalist[this.AddContractForm.receiptID-1].amount
          form1.prover = self.datalist[this.AddContractForm.receiptID-1].prover

          form1.financinged = self.datalist[this.AddContractForm.receiptID-1].financinged
          form1.settled = 1
          form1.transferRecord = self.datalist[this.AddContractForm.receiptID-1].transferRecord
          form1.leftValue = 0
          self.datalist.push(form1)
          // this.list.push({name: 'Asset'})
        //   self.datalist.push({name: param,contractAddress: result.contractAddress})
      });
    },

    //2.0 导致isAddContract为1
    openAddContract(){
      this.isAddContract = true
    },
    //4.0
    doAddContract(){
        let self = this
        this.$refs.AddContractForm.validate(async (valid) =>{ //检验表单
        if(valid){
          //console.info('AddContract form',this.AddContractForm.account, this.AddContractForm.property, this.AddContractForm.credit)
          let content = {}
          content.ReceiptType = "new"  //!!!!
          content.receiptID = self.datalist.length+1

          content.fromAccount = this.AddContractForm.fromAccount
          content.toAccount = this.AddContractForm.toAccount
          content.prover = this.AddContractForm.prover
          content.amount = this.AddContractForm.amount

         
          content.financinged = 0
          content.settled = 0
          /*
          content.transferRecord = {}
          let t
          t.content.transferRecord.length=0
          content.transferRecord.push(t)
          */
          content.leftValue = this.AddContractForm.amount

          //content.contract = DEFAULTCONTRCT
          //content.addr = DEFAULTCONTRACTADDRESS
          content.func = 'AddContract'

          //5.0
          this.makeAddContract(content)
          
          
          this.$Message.success('发起新合同成功')
          this.cancelAddContract()
        }
        else {
          this.$Message.error('请正确填写表单')
        }
      })
      // this.isAddContract = false
    },
    cancelAddContract () {
      // 重置功能添加表单对象
      this.$refs.AddContractForm.resetFields()
      this.AddContractForm = {}
      this.isAddContract = false
    },

    openFinancing(){
      this.isFinancing = true
    },
    doFinancing(){
        let self = this
        this.$refs.FinancingForm.validate(async (valid) =>{ //检验表单
        if(valid){
          let content = {}
          content.ReceiptType = "financing" 
          content.receiptID = this.FinancingForm.receiptID
          //content.receiptID = this.FinancingForm.receiptID
          content.fromAccount = self.datalist[this.FinancingForm.receiptID-1].fromAccount
          content.toAccount = self.datalist[this.FinancingForm.receiptID-1].toAccount
          content.amount = self.datalist[this.FinancingForm.receiptID-1].amount
          content.prover = self.datalist[this.FinancingForm.receiptID-1].prover

          content.financinged = 1
          content.settled = self.datalist[this.FinancingForm.receiptID-1].settled

          //content.contract = DEFAULTCONTRCT
          //content.addr = DEFAULTCONTRACTADDRESS
          content.func = 'Financing'

          //content.receiptID = this.FinancingForm.receiptID
          //content.transferRecord = self.datalist[this.FinancingForm.receiptID-1].transferRecord
          content.leftValue = 0


          this.makeFinancing(content)
          
          
          this.$Message.success('单据融资成功')
          this.cancelFinancing()
        }
        else {
          this.$Message.error('请正确填写表单')
        }
      })
      // this.isFinancing = false
    },
    cancelFinancing() {
      // 重置功能添加表单对象
      this.$refs.FinancingForm.resetFields()
      this.FinancingForm = {}
      this.isFinancing = false
    },

    openSettle(){
      this.isSettle = true
    },
    doSettle(){
        let self = this
        this.$refs.SettleForm.validate(async (valid) =>{ //检验表单
        if(valid){
          let content = {}
          content.receiptID = this.SettleForm.receiptID

          //content.contract = DEFAULTCONTRCT
          //content.addr = DEFAULTCONTRACTADDRESS
          content.func = 'Settle'

          this.makeSettle(content)
          
          
          this.$Message.success('结算账款成功')
          this.cancelSettle()
        }
        else {
          this.$Message.error('请正确填写表单')
        }
      })
    },
    cancelSettle() {
      // 重置功能添加表单对象
      this.$refs.SettleForm.resetFields()
      this.SettleForm = {}
      this.isSettle = false
    },

    //点击Transfer的确认交易后1.0
    cancelTransfer() {
      this.$refs.TransferForm.resetFields()
      this.TransferForm = {}
      this.isTransfer = false
    },
    //打开单据转让
    openTransfer() {
        this.isTransfer = true
    },
    doTransfer() {
        let self = this
        this.$refs.TransferForm.validate(async (valid) =>{ //检验表单
        if(valid){
            let content = {}
            content.ReceiptType = "transfer"  //!!!!
            content.receiptID = self.datalist.length+1

            content.fromAccount = this.TransferForm.fromAccount
            content.toAccount = this.TransferForm.toAccount
            content.amount = this.TransferForm.amount

            content.prover = 0
            content.financinged = 0
            content.settled = 0
            //form.transferRecord = []
            content.leftValue = this.TransferForm.amount
            
            //content.contract = DEFAULTCONTRCT
            //content.addr = DEFAULTCONTRACTADDRESS
            content.func = 'Transfer'

            this.makeTransfer(content)  //点击Transfer的确认交易后1.1
            //   this.deploy(this.AddContractForm.name)
            this.$Message.success('单据转让成功')
            this.cancelTransfer()
        }
        else {
          this.$Message.error('请正确填写表单')
        }
      })
    }
    
  },
  
  /*
  created () {
    // this.deploy('Asset')
    this.isRegister = false
  },
  */
  
};
</script>

<style lang="css">
</style>
