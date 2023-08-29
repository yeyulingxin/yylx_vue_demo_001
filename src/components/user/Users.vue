<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">用户管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="queryUserInfoList">
            <el-button slot="append" icon="el-icon-search" @click="queryUserInfoList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <!-- 边框线, 隔行变色 -->
      <el-table
          :data="userList"
          style="width: 100%"
          border
          stripe>
        <!-- 索引列 -->
        <el-table-column type="index">

        </el-table-column>
        <el-table-column
            prop="userId"
            label="用户编码"
            width="180">
        </el-table-column>
        <el-table-column
            prop="userName"
            label="姓名"
            width="180">
        </el-table-column>
        <el-table-column
            label="状态"
            width="180">
          <!-- 作用域插槽 ？？？ -->
          <template slot-scope="scope">
            <!-- 开关组件 -->
            <el-switch
                v-model="scope.row.userStatus" @change="userStatusChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column
            label="操作"
            width="180">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditUserDialog(scope.row.userId)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUserByUserId(scope.row.userId)"></el-button>
            <!-- 分配角色按钮, 文字提示 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
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
    <!-- 添加用户的对话框 -->
    <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="30%"
        @close="clearDialogContent">
      <!-- 内容主体区域 -->
      <el-form :model="addUserForm" :rules="addUserFormRoles" ref="addUserFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" type="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
    </el-dialog>

    <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="30%"
        @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editUserForm" :rules="editUserFormRoles" ref="editUserFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
    </el-dialog>
    <el-dialog
        title="分配权限"
        :visible.sync="allotRightDialogVisible"
        width="30%"
        @close="allotRightDialogClosed">
      <div>
        <p>当前用户: {{userInfo.userName}}</p>
        <p>当前角色: {{userInfo.roleName}}</p>
        <p>分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
                v-for="item in roleList"
                :key="item.roleId"
                :label="item.roleName"
                :value="item.roleId">
            </el-option>
          </el-select>
        </p>
      </div>
      <el-button @click="allotRightDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      //验证邮箱的规则
      var checkEmail = (rule, value, callback) => {
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if (regEmail.test(value)) {
          return callback()
        }
        return callback(new Error('请输入合法的邮箱'))
      }
      //验证手机号的规则
      var checkMobile = (rule, value, callback) => {
        const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (regMobile.test(value)) {
          return callback()
        }
        return callback(new Error('请输入合法的手机号'))
      }

      return{
        queryInfo: {
          query: '',
          pageNum: 1,
          pageSize: 2,
        },
        userList: [],
        total: 0,
        // 控制添加用户对话框的显示隐藏
        addDialogVisible: false,
        editDialogVisible: false,
        //添加用户的表单数据
        addUserForm: {
          username: '',
          password: '',
          email: '',
          mobile: '',
        },
        editUserForm: {
          userId: '',
          username: '',
          email: '',
          mobile: '',
        },
        allotRightDialogVisible: false,
        //需要被分配角色的用户信息
        userInfo: [],
        //所有角色列表
        roleList: [],
        //选中的角色Id
        selectedRoleId: '',
        addUserFormRoles: {
          username: [
            {required: true, message: '请输入用户名', trigger:'blur'},
            {min: 3, max: 10, message: '用户名的长度在3~10个字符之前', trigger: 'blur'},
          ],
          password: [
            {required: true, message: '请输入密码', trigger:'blur'},
            {min: 6, max: 15, message: '密码的长度在6~15个字符之前', trigger: 'blur'},
          ],
          email: [
            {required: true, message: '请输入邮箱', trigger:'blur'},
            {validator: checkEmail, trigger:'blur'},
          ],
          mobile: [
            {required: true, message: '请输入手机号', trigger:'blur'},
            {validator: checkMobile, trigger:'blur'},
          ],
        },
        editUserFormRoles: {
          email: [
            {required: true, message: '请输入邮箱', trigger:'blur'},
            {validator: checkEmail, trigger:'blur'},
          ],
          mobile: [
            {required: true, message: '请输入手机号', trigger:'blur'},
            {validator: checkMobile, trigger:'blur'},
          ],
        }
      }
    },
    created() {
      this.getUserList()
    },
    methods: {
      async getUserList() {
        console.log(this.queryInfo)
        const result = await this.$http.post('user/getUserList', this.queryInfo)
        console.log(result)
        if (result.data.code !== 200) {
          return this.$message.error(result.data.msg)
        }
        this.userList = result.data.userList
        this.total = result.data.total
      },
      // 监听pageSize 改变
      handleSizeChange(newSize) {
        this.queryInfo.pageSize = newSize
        this.getUserList()
      },
      // 监听页码 改变
      handleCurrentChange(newPage) {
        this.queryInfo.pageNum = newPage
        this.getUserList()
      },
      //监听用户状态switch开关
      userStatusChanged(userInfo) {
        console.log(userInfo)
        const result = this.$http.post("user/updateUserStatus", {'newStatus': userInfo.userStatus})
        // 失败的话，重置状态
        if (result.data.code !== 200) {
          userInfo.userStatus = !userInfo.userStatus
          return this.$message.error(result.data.msg)
        }
      },
      queryUserInfoList() {
        this.queryInfo.pageNum = 1
        this.getUserList()
      },
      //重置表单区域
      clearDialogContent() {
        this.$refs.addUserFormRef.resetFields()
      },
      //添加用户
      addUser() {
        this.$refs.addUserFormRef.validate(async valid => {
          if (!valid) {
            return
          }
          //发起添加用户的请求
          const result = await this.$http.post('user/addUser', this.addUserForm)
          if (result.data.code !== 200) {
            return this.$message.error(result.data.msg)
          }
          this.$message.success("添加用户成功！")
          this.addDialogVisible = false
          this.queryUserInfoList()
        })
      },
      //修改用户对话框
      async showEditUserDialog(userId) {
        this.editDialogVisible = true
        const result = await this.$http.post('user/getUserInfo', {'userId': userId})
        if (result.data.code !== 200) {
          return this.$message.error(result.data.msg)
        }
        this.editUserForm.userId = result.data.userId
        this.editUserForm.username = result.data.username
        this.editUserForm.mobile = result.data.mobile
        this.editUserForm.email = result.data.email
      },

      editDialogClosed() {
        this.$refs.editUserFormRef.resetFields()
      },

      //修改用户请求
      editUserInfo() {
        this.$refs.editUserFormRef.validate(async valid => {
          if (!valid) {
            return
          }
          //发起添加用户的请求
          const result = await this.$http.post('user/editUser', this.editUserForm)
          if (result.data.code !== 200) {
            return this.$message.error(result.data.msg)
          }
          this.$message.success("修改用户成功！")
          this.editDialogVisible = false
          this.queryUserInfoList()
        })
      },

      //删除用户
      async deleteUserByUserId(userId) {
        //弹窗确认
        const result = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => {
          return err
        })
        //点击确认，返回confirm字符串
        //点击取消，返回cancel字符串
        if (result === 'confirm') {
          const result = await this.$http.post('user/deleteUser', {'userId': userId})
          if (result.data.code !== 200) {
            return this.$message.error(result.data.msg)
          }
          this.$message.success("删除用户成功！")
          this.queryUserInfoList()
        }
      },
      async setRole(userInfo) {
        this.userInfo = userInfo
        const result = await this.$http.post('/auth/getRoleList')
        if (result.data.code !== 200) {
          return this.$message.error(result.data.msg)
        }
        this.roleList = result.data.roleList
        this.allotRightDialogVisible = true
      },
      async saveRoleInfo() {
        if (!this.selectedRoleId) {
          return this.$message.error("请选择要分配的角色！")
        }
        const result = await this.$http.post('/user/setRole', {'userId' : this.userInfo.userId, 'roleId': this.selectedRoleId})
        if (result.data.code !== 200) {
          return this.$message.error(result.data.msg)
        }
        this.$message.error("更新角色成功")
        this.getUserList();
        this.allotRightDialogVisible = false;
      },
      allotRightDialogClosed() {
        this.selectedRoleId = ''
      }
    },
  }
</script>

<style lang="less" scoped>

</style>
