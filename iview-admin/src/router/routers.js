import Main from '@/components/main'
import parentView from '@/components/parent-view'

/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  title: { String|Number|Function }
 *         显示在侧边栏、面包屑和标签栏的文字
 *         使用'{{ 多语言字段 }}'形式结合多语言使用，例子看多语言的路由配置;
 *         可以传入一个回调函数，参数是当前路由对象，例子看动态路由和带参路由
 *  hideInBread: (false) 设为true后此级路由将不会出现在面包屑中，示例看QQ群路由配置
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面在切换标签后不会缓存，如果需要缓存，无需设置这个字段，而且需要设置页面组件name属性和路由配置的name一致
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 *  beforeCloseName: (-) 设置该字段，则在关闭当前tab页时会去'@/router/before-close.js'里寻找该字段名对应的方法，作为关闭前的钩子函数
 * }
 */

export default [
  {
    path: '/login',
    name: 'login',
    meta: {
      title: 'Login - 登录',
      hideInMenu: true
    },
    component: () => import('@/view/login/login.vue')
  },
  {
    path: '/',
    name: '_home',
    redirect: '/home',
    component: Main,
    meta: {
      hideInMenu: true,
      notCache: true
    },
    children: [
      {
        path: '/home',
        name: 'home',
        meta: {
          hideInMenu: true,
          title: '首页',
          notCache: true,
          icon: 'md-home'
        },
        component: () => import('@/view/single-page/home')
      }
    ]
  },
  
  /*
  //发起合同
  {
    path: '/Receipt',
    name: 'Receipt',
    component: Main,
    meta: {
      hideInBread: true
    },
    children: [
      {
        path: '/Receipt',
        name: '发起合同',
        meta: {
          // icon: '_qq',
          title: '发起合同'
        },
        component: () => import('@/view/Receipt.vue')
      }
    ]
  },
  
  //单据转让
  {
    path: '/Transfer',
    name: 'Transfer',
    component: Main,
    meta: {
      hideInBread: true
    },
    children: [
      {
        path: '/Transfer',
        name: '单据转让',
        meta: {
          // icon: '_qq',
          title: '单据转让'
        },
        component: () => import('@/view/Transfer.vue')
      }
    ]
  },

  //单据融资
  {
    path: '/Financing',
    name: 'Financing',
    component: Main,
    meta: {
      hideInBread: true
    },
    children: [
      {
        path: '/Financing',
        name: '单据融资',
        meta: {
          // icon: '_qq',
          title: '单据融资'
        },
        component: () => import('@/view/Financing.vue')
      }
    ]
  },

  //结算账款
  {
    path: '/Settle',
    name: 'Settle',
    component: Main,
    meta: {
      hideInBread: true
    },
    children: [
      {
        path: '/Settle',
        name: '结算账款',
        meta: {
          // icon: '_qq',
          title: '结算账款'
        },
        component: () => import('@/view/Settle.vue')
      }
    ]
  },
  */

 {
  path: '/SupplyChain',
  name: 'SupplyChain',
  component: Main,
  meta: {
    hideInBread: true
  },
  children: [
    {
      path: '/SupplyChain',
      name: '企业供应链',
      meta: {
        // icon: '_qq',
        title: '企业供应链'
      },
      component: () => import('@/view/SupplyChain.vue')
    }
  ]
},

  {
    path: '/message',
    name: 'message',
    component: Main,
    meta: {
      hideInBread: true,
      hideInMenu: true
    },
    children: [
      {
        path: 'message_page',
        name: 'message_page',
        meta: {
          icon: 'md-notifications',
          title: '消息中心'
        },
        component: () => import('@/view/single-page/message/index.vue')
      }
    ]
  }
]