<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">权限管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片列表 -->
    <el-card>
      <el-table :data="rightList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === 0">一级权限</el-tag>
            <el-tag v-else-if="scope.row.level === 1" type="success">二级权限</el-tag>
            <el-tag v-else type="warning">三级权限</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>

</template>

<script>
export default {
  data() {
    return {
      rightList: []
    }
  },
  created() {
    this.getRightList()
  },

  methods: {
    async getRightList() {
      const result = await this.$http.post('auth/getAuthList')
      if (result.data.code !== 200) {
        return this.$message.error(result.data.msg)
      }
      this.rightList = result.data.authList;
    }
  }
}
</script>

<style lang="less" scoped>

</style>
