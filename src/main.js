// 导入vue包
import Vue from 'vue'
// 导入 app 根组件
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import '@/assets/css/global.css'
//导入图标
import '@/assets/font/iconfont.css'
import TreeTable from 'vue-table-with-tree-grid'

import axios from 'axios'

//配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8088/yylx9/'
//请求拦截器
axios.interceptors.request.use(config => {
  console.log(config)
  //在所有请求中的header中传递token值到Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config;
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

// 创建 Vue实例对象
new Vue({
  // el: '#app', //和$mount是同样的作用
  router,
  //将 render函数指定的组件，渲染到html页面中
  render: h => h(App)
}).$mount('#app') //渲染到index.html的指定位置
