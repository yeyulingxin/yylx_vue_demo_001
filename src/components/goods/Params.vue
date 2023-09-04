<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">商品管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-alert
          title="注意：只允许为第三级分类设置参数"
          type="warning" :closable="false" show-icon>
      </el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
              v-model="selectedKeys"
              :options="cateList"
              :props="cascaderProps"
              @change="categorySelectedChange"
              clearable></el-cascader>
        </el-col>
      </el-row>
      <!-- tab区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
      <el-tab-pane label="动态参数" name="many">
        <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
        <!-- 动态参数表格 -->
        <el-table border stripe :data="manyTableData">
          <el-table-column type="expand"></el-table-column>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="参数名称" prop="attrName"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="静态属性" name="only">
        <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
        <!-- 静态参数表格 -->
        <el-table border stripe :data="onlyTableData">
          <el-table-column type="expand"></el-table-column>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="属性名称" prop="attrName"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-dialog
        :title="'添加' + titleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed">
      <!-- 表单 -->
      <span slot="footer" class="dialog-footer">
        <el-form :model="addAttrForm" :rules="addAttrRules" ref="addAttrFormRefs" label-width="100px">
          <el-form-item :label="titleText" prop="attrName">
            <el-input v-model="addCategoryForm.cateName"></el-input>
          </el-form-item>
        </el-form>
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addDialogVisible = false">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cateId',
        label: 'cateName',
        children: 'children',
      },
      selectedKeys: [],
      //被激活的页签名称
      activeName: 'many',
      cateManyParamsList: [],
      manyTableData: [],
      onlyTableData: [],
      addDialogVisible: false,
      addAttrRules: {
        attrName:[
          {required: true, message: "请输入名称", trigger: "blur"}
        ]
      }
    }
  },
  created() {
    //获取所有的商品列表
    this.getCategoryList()
  },
  methods: {
    async getCategoryList() {
      const result = await this.$http.post('/goods/getCategoryList')
      if (result.data.code !== 200) {
        return this.$message.error(result.data.msg)
      }
      this.cateList = result.data.parentCategoryList
    },
    categorySelectedChange() {
      //根据所选三级分类id和当前tab，进行处理
      this.getParamsData()
    },
    //tab页签点击事件处理函数
    handleTabClick() {
      this.getParamsData()
    },
    // 获取参数列表
    async getParamsData() {
      const result = await this.$http.post('/goods/getAttributes', {'type': this.activeName, 'categoryId': this.cateId})
      if (result.data.code !== 200) {
        return this.$message.error(result.data.msg)
      }
      if (this.activeName === 'many') {
        this.manyTableData = result.data.paramsList
      } else {
        this.onlyTableData = result.data.paramsList
      }
    },
    addDialogClosed() {
      this.$refs.addAttrFormRefs.resetFields
    }
  },
  computed: {
    //如果按钮需要被禁用，返回true
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    //当前选择的三级分类的Id
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    //动态计算修改参数对话框文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style scoped lang="less">
.cat_opt {
  margin: 15px 0;
}
</style>
