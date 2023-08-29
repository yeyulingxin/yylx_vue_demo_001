<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header class="el-header">
      <div class="header-left">
        <img src="../assets/title.png" alt="">
        <span>夜雨铃心的自学系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 头部区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside class="el-aside" :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- active-text-color 激活文本颜色 ;
        unique-opened 只展开一个子菜单;
        collapse  侧边栏折叠展开；
        -->
        <el-menu class="el-menu"
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409EFF"
            unique-opened
            :collapse="isCollapse"
            :collapse-transition="false"
            router
            :default-active="activePath">
          <!-- 一级菜单 -->
          <el-submenu :index="item.categoryId + ''" v-for="item in menuList" :key="item.categoryId">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="menuIconObj[item.categoryId]"></i>
              <span>{{ item.categoryName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.categoryPath" v-for="subItem in item.childCategoryList" :key="subItem.categoryId"
                          @click="saveNavStatus('/' + subItem.categoryPath)">
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <span>{{ subItem.categoryName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体区域 -->
      <el-main class="el-main">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {

  data() {
    return {
      //左侧菜单树
      menuList: [],
      menuIconObj: {
        '1': 'iconfont icon-yonghuguanli',
        '2': 'iconfont icon-quanxianguanli',
        '3': 'iconfont icon-shangpinguanli'
      },
      isCollapse: false,
      activePath: "",
    }
  },
  created() {
    //获取菜单
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      //清空token
      window.sessionStorage.clear()
      //重定向到登录页
      this.$router.push("/login")
    },
    async getMenuList() {
      const result = await this.$http.post('home/menu')
      if (result.data.code !== 200) {
        return this.$message.error(result.data.msg)
      }
      this.menuList = result.data.categoryList
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    //保存链接的激活状态
    saveNavStatus(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between; //左右贴边对齐
  padding-left: 10px;
  align-items: center;// 退出变成居中而不是上下全部
  color: #fff;
  font-size: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  span {
    margin-left: 15px;
  }
}

.header-left img {
  width: 59px;
  height: 54px;
}

.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none; //去除边框线
  }
}

.iconfont {
  margin-right: 8px;
}

.toggle-button {
  background-color: #4A5064;
  font-size: 10px;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0.2em; //字间距
  cursor: pointer; //鼠标放上去变成
}

.el-main {
  background-color: #EAEDF1;
}
</style>
