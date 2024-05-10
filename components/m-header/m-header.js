// components/m-tabar/m-tabar.js
Component({
    options: {
        addGlobalClass: true
    },
    properties: {
        title: {
            type: String,
            value: ''
        },
        scrollTop: {
            type: Number,
            value: 0
        },
        isback: {
            type: Boolean,
            value: true
        },
        login: {
            type: Boolean,
            value: false
        },
        line: {
            type: Boolean,
            value: true
        },
        lt: {
            type: Boolean,
            value: false
        },
        ishome: {
            type: Boolean,
            value: false
        },
        bg: {
            type: String,
            value: '#fff'
        }
    },
    data: {
        statusBarHeight: 0, // 状态导航栏高度
        navHeight: 0, // 总体高度
        navigationBarHeight: 0, // 导航栏高度(标题栏高度)
        screenWidth: 0, // 视窗宽度
    },
    methods: {
        initBar () {
            let sysInfo = wx.getSystemInfoSync()
            // 状态栏高度
            let statusBarHeight = sysInfo.statusBarHeight
            // 获取微信胶囊的位置信息 width,height,top,right,left,bottom
            let custom = wx.getMenuButtonBoundingClientRect()
            // 导航栏高度(标题栏高度) = 胶囊高度 + (顶部距离 - 状态栏高度) * 2
            let navigationBarHeight = custom.height + (custom.top - statusBarHeight) * 2
            // 总体高度 = 状态栏高度 + 导航栏高度
            let navHeight = navigationBarHeight + statusBarHeight
            this.setData({
                statusBarHeight: statusBarHeight,
                navHeight: navHeight,
                navigationBarHeight: navigationBarHeight,
                screenWidth: sysInfo.screenWidth - navHeight
            })
        },
        goLogin () {
            wx.navigateBack({ delta: 1 })
        },
        back () {
            if (this.data.ishome) {
                wx.switchTab({ url: '/pages/index/index' })
            } else {
                let pages = getCurrentPages()
                if (pages.length > 1) {
                    wx.navigateBack({ delta: 1 })
                } else {
                    wx.switchTab({ url: '/pages/index/index' })
                }
            }
        }
    },
    lifetimes: {
        attached () {
            this.initBar()
        }
    }
})
