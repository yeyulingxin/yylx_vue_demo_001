import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login'
import Home from '@/components/Home'
import Welcome from "@/components/Welcome.vue";
import Users from "@/components/user/Users";
import Rights from "@/components/power/Rights";
import Roles from "@/components/power/Roles"
import Category from "@/components/goods/Category"
import Params from "@/components/goods/Params"

Vue.use(VueRouter)

const routes = [
  {path: '/', redirect: '/login'},//重定向
  {path: '/login', component: Login},
  {path: '/home', component: Home,
    redirect: '/welcome',
    children: [
      {path: '/welcome', component: Welcome},
      {path: '/userList', component: Users},
      {path: '/authList', component: Rights},
      {path: '/roleList', component: Roles},
      {path: '/goodsCategory', component: Category},
      {path: '/categoryParam', component: Params},
    ]}
]

const router = new VueRouter({
  routes
})

//挂载路由导航守卫

router.beforeEach((to, from, next) => {
  //to 将要访问的路径
  //from 代表从哪个路径跳转而来
  //next() 是一个函数，表示放行
  if (to.path === '/login') {
    return next();
  }
  const tokenStr = window.sessionStorage.getItem("token")
  if (!tokenStr) {
    return next('/login')
  }
  return next()
})

export default router
