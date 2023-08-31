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
        <el-button type="primary" size="mini" :disabled="isBtnDisabled">添加参数</el-button>
      </el-tab-pane>
      <el-tab-pane label="静态属性" name="pnly">
        <el-button type="primary" size="mini" :disabled="isBtnDisabled">添加属性</el-button>
      </el-tab-pane>
      </el-tabs>
    </el-card>
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
    async categorySelectedChange() {
      //根据所选三级分类id和当前tab，进行处理
      const reuslt = await this.$http.post('/goods/getAttributes', {'type': this.activeName, 'categoryId': this.cateId})
      if (result.data.code !== 200) {
        return this.$message.error(result.data.msg)
      }
    },
    //tab页签点击事件处理函数
    handleTabClick() {

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
    }
  }
}
</script>

<style scoped lang="less">
.cat_opt {
  margin: 15px 0;
}
</style>
