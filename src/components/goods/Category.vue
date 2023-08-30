<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">商品管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCategoryDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table class="treeTable" :data="cateList" :columns="columns"
                  :selection-type="false" :expand-type="false"
                  show-index index-text="#" border :show-row-hover="false">
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.deleted === false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cateLevel === '1'">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cateLevel === '2'">二级</el-tag>
          <el-tag type="warning" size="mini" v-else-if="scope.row.cateLevel === '3'">三级</el-tag>
        </template>
        <template slot="opt" slot-scope="scopt">
          <el-button type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pageNum"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="queryInfo.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
        title="添加分类"
        :visible.sync="addCategoryDialogVisible"
        width="50%"
        @close="addCategoryDialogClosed">
      <!-- 表单 -->
      <el-form :model="addCategoryForm" :rules="addCategoryRules" ref="addCategoryFormRefs" label-width="100px">
        <el-form-item label="分类名称" prop="cateName">
          <el-input v-model="addCategoryForm.cateName"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
              v-model="selectedKeys"
              :options="parentCategoryList"
              :props="cascaderProps"
              @change="parentCategoryChange"
              clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCategoryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategory">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //分类列表
      cateList: [],
      //总数
      total: 0,
      //查询条件
      queryInfo: {
        type: 3,
        pageNum: 1,
        pageSize: 5,
      },
      //table 指定列
      columns: [
        {
          label: '分类名称',
          prop: 'cateName',
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isOk',
        },
        {
          label: '排序',
          type: 'template',
          template: 'order',
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt',
        }
      ],
      addCategoryDialogVisible: false,
      addCategoryForm: {
        cateName: '',
        parentCateId: '',
        cateLevel: '',
      },
      addCategoryRules: {
        cateName: [
          {required: true, message: '请输入分类名称', trigger: 'blur'}
        ]
      },
      parentCategoryList: [],
      //指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cateId',
        label: 'cateName',
        children: 'children',
        checkStrictly: true
      },
      //选中的父级分类的cateId数据
      selectedKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const result = await this.$http.post('/goods/getCategoryList', this.queryInfo)
      if (result.data.code !== 200) {
        return this.$message.error(result.data.msg)
      }
      this.cateList = result.data.cateList
      this.total = result.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize
      this.getCateList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage
      this.getCateList()
    },
    showAddCategoryDialog() {
      this.getParentCategoryList()
      this.addCategoryDialogVisible = true
    },
    async getParentCategoryList() {
      const result = await this.$http.post('/goods/getParentCategoryList')
      if (result.data.code !== 200) {
        return this.$message.error(result.data.msg)
      }
      this.parentCategoryList = result.data.parentCategoryList
    },
    //级联选择框变化触发这个函数
    parentCategoryChange() {
      if (this.selectedKeys.length > 0) {
        this.addCategoryForm.parentCateId = this.selectedKeys[this.selectedKeys.length - 1]
      } else {
        this.addCategoryForm.parentCateId = 0
      }
      this.addCategoryForm.cateLevel = this.selectedKeys.length + 1
    },
    addCategory() {
      console.log(this.addCategoryForm)
      this.$refs.addCategoryFormRefs.validate(async valid => {
        if (!valid)
          return
        const result = await this.$http.post('/goods/addCategory', this.addCategoryForm)
        if (result.data.code !== 200) {
          return this.$message.error(result.data.msg)
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCategoryDialogVisible = false
      })
    },
    addCategoryDialogClosed() {
      this.$refs.addCategoryFormRefs.resetFields()
      this.selectedKeys = []
      this.addCategoryForm.cateLevel = 0
      this.addCategoryForm.parentCateId = 0
    }
  }
}
</script>

<style scoped lang="less">
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
