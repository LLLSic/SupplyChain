<template>
  <div>
    <Card>
        <h1>合约部署信息</h1>
        <Row style = "margin: 10px 0">
            <Col span="20">
                <Row>
                    <Button type="primary" style="width: 100px; font-size: 13px; margin-right: 10px" @click="openAdd">部署合约</Button>
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
      <Modal v-model="isAdd" title="部署合约">
          <Form :model="addForm" ref="addForm" :label-width="110" :rules="addRules">
              <FormItem label="合约名称" prop="name" >
                  <Input  clearable v-model="addForm.name" placeholder = "请输入合约名称"/>
              </FormItem>
          </Form>
          <div slot="footer">
            <Button type="text" @click="cancelAdd">取消</Button>
          <Button type="primary" @click="doAdd">确认</Button>
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
          title: '合约名称',
          align: 'center',
          key: 'name',
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
          title: '合约地址',
          align: 'center',
          key: 'contractAddress',
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
        name: [
          { required: true, message: '合约名称不能为空', trigger: 'blur' }
        ],
      },
      page: {// 系统用户翻页对象
        total: 10,
        currentPage: 1,
        current: 1
      },
      isAdd: false,
      addForm: {},
      datalist: [
        
      ]
    };
  },
  methods: {
    async deploy(param) {
      //直接全局变量给他是不行的
      //要设置一个self中介
      let self = this
      let result = {}
      let da = {
        contractName: param,
      }
      console.info('list111',this.datalist)
      await axios.request({
          url: "deploy",
          data: da,
          headers:{
            'Content-type': 'application/x-www-form-urlencoded',
            // 'Access-Control-Allow-Origin': '*'
            // 'Content-type': 'application/json'
          },
          method: "post"
      }).then(function(res) {
          console.info(res.data);
          result = res.data
          // this.list.push({name: 'Asset'})
          let flag = false
          for(let i = 0; i < self.datalist.length; ++ i) {
            if(self.datalist[i].name == param) {
              flag = true
              self.datalist[i].contractAddress = result.contractAddress
            }
          }
          if(flag == false){
            self.datalist.push({name: param,contractAddress: result.contractAddress})
          }
      });
    },
    openAdd(){
      this.isAdd = true
    },
    doAdd(){
      this.$refs.addForm.validate(async (valid) =>{ //检验表单
        if(valid){
          console.info('add form',this.addForm.name)
          this.deploy(this.addForm.name)
          this.$Message.success('部署成功')
          this.cancelAdd()
        }
        else {
          this.$Message.error('请正确填写表单')
        }
      })
      // this.isAdd = false
    },
    cancelAdd () {
      // 重置功能添加表单对象
      this.$refs.addForm.resetFields()
      this.addForm = {}
      this.isAdd = false
    },
  },
  created () {
    this.deploy('Asset')
    this.isAdd = false
  }
};
</script>

<style lang="css">
</style>