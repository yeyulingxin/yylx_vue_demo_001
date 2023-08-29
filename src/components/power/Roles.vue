<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">权限管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片列表 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
    </el-card>
    <el-table :data="roleList" border stripe>
      <el-table-column type="expand">
        <template slot-scope="scope">
          <div class="table-expand">
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.authDTOList" :key="item1.authId">
              <!-- 第一列渲染一级权限 -->
              <el-col :span="5">
                <el-tag>
                  {{item1.authName}}
                  <i class="el-icon-caret-right"></i>
                </el-tag>
              </el-col>
              <!-- 第二列渲染二三级权限 -->
              <el-col :span="19">
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.authId">
                  <el-col :span="6">
                    <el-tag type="success">
                      {{item2.authName}}
                      <i class="el-icon-caret-right"></i>
                    </el-tag>
                  </el-col>
                  <el-col :span="18">
                    <el-tag v-for="(item3, i3) in item2.children" :key="item3.authId" type="warning" closable @close="removeRightById(scope.row, item3.authId)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-table-column>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="角色名称" prop="roleName"></el-table-column>
      <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
      <el-table-column label="操作" width="300px">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
          <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
        title="修改用户"
        :visible.sync="setRightDialogVisible"
        width="50%"
        @close="editRightDialogClosed">
        <el-tree :data="rightList"
                 :props="treeRightProps"
                 @node-click=""
                 show-checkbox
                 node-key="authId"
                 default-expand-all
                 :default-checked-keys="defaultKeys"
                ref="treeRef">
        </el-tree>
        <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //角色列表数据
      roleList: [],
      setRightDialogVisible: false,
      rightList : [],
      //树形控件属性对象
      treeRightProps: {
        label: 'authName',
        children: 'children'
      },
      defaultKeys:[],
      newRightKeys: '',
      //当前即将分配权限的角色Id
      roleId : '',
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    async getRoleList() {
      const result = await this.$http.post('/auth/getRoleList')
      if (result.data.code !== 200) {
        return this.$message.error(result.data.msg)
      }
      this.roleList = result.data.roleList;
      console.log(this.roleList)
    },
    async removeRightById(role, authId) {
      const confirmResult = await this.$confirm('是否删除权限', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult === 'confirm') {
        const result = await this.$http.create.post('/auth/deleteAuth', {'roleId': role.roleId, 'authId': authId})
        if (result.data.code !== 200) {
          return this.$message.error(result.data.msg)
        }
        // const newRole = await this.getRoleList()//会完整渲染页面，关闭expand
        role.authDTOList = result.data.newRole//这样做是为了防止expand关闭，需要后端配合
      }
    },
    async showSetRightDialog(role) {
      //获取所有权限数据
      this.roleId = role.roleId
      const result = await this.$http.post("/auth/getRightList")
      if (result.data.code !== 200) {
        return this.$message.error(result.data.msg)
      }
      this.rightList = result.data.rightList
      this.getRoleLeftKeys(role, this.defaultKeys)
      this.setRightDialogVisible = true
    },
    //获取角色下所有三级权限id
    getRoleLeftKeys(role, arr) {
      role.authDTOList.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    getLeafKeys(node, arr) {
      if(!node.children) {
        return arr.push(node.authId)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    //分配权限窗口关闭事件监听
    editRightDialogClosed() {
      this.defaultKeys = []

    },
    async allotRights() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const keysString = keys.join(',')
      const result = await this.$http.post("/auth/allotRights", {'roleId': this.roleId, 'keysString': keysString})
      if (result.data.code !== 200) {
        return this.$message.error(result.data.msg)
      }
      this.setRightDialogVisible = false;
    }
  }
}
</script>

<style scoped lang="less">
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.table-expand {
  padding-left: 50px;
  padding-right: 50px;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
