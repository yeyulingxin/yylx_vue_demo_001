<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 登录表单区域 -->
      <div>
        <el-form label-width="0px" class="login_form" :model="loginForm" :rules="loginRule" ref="loginFormRef"> <!-- ref 表单对象 -->
          <el-form-item prop="username"> <!-- 表单验证项 prop， 作用于item上 -->
            <el-input prefix-icon="iconfont icon-zhanghao" v-model="loginForm.username"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input prefix-icon="iconfont icon-mima" v-model="loginForm.password"
            type="password"></el-input>
          </el-form-item>
          <el-form-item class="btns">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="resetLoginForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //表单绑定数据
      loginForm: {
        username:"",
        password:"",
      },
      //验证规则
      loginRule: {
        username: [
          {required: true, message: "请输入用户名", trigger: "blur"},
          {min: 3, max:10, message: "用户名在3到10个字符之间", trigger: "blur"},
        ],
        password: [
          {required: true, message: "请输入登录密码", trigger: "blur"},
          {min: 6, max:15, message: "密码在6到15个字符之间", trigger: "blur"},
        ]
      }
    }
  },
  methods: {
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        console.log(valid)
        if (!valid) {
          return
        }
        const result = await this.$http.post('login/login', this.loginForm)
        if (result.data.code !== 200) {
          this.$message.error("登录失败！")
        }
        this.$message.success("登录成功！")
        // token存储
        window.sessionStorage.setItem("token", result.data.token)
        //编程式导航跳转
        await this.$router.push("/home")
      })
    },
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields();
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: cornflowerblue;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;// 圆角边框
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%); //盒子放入正中央

  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #add; //阴影
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      height: 100%;
      width: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box; //???
}

.btns {
  display: flex; // 弹性模型
  justify-content: right; //右对齐
}
</style>
