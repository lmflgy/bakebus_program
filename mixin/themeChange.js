/**
接口文档：http://hp.9czn.cn

小程序参数：
appid：wx163e0daadafffc20
secret：ec794a95f5b90006e95bb0a279dea1c1

测试账号1：  18373595020   123456
 */

//const URL = 'http://localhost:21124'
// 正式接口 15757874554
const URL = 'https://admin.hzqz.cc'
const APIURL = 'https://admin.hzqz.cc'
const IMGURL = 'https://hpdg.oss-cn-hangzhou.aliyuncs.com'
// 测试接口 ces 123456
//const URL = 'https://bake.ranxy.cn'
//const APIURL = 'https://bake.ranxy.cn'
//const IMGURL = 'https://bake.ranxy.cn'
module.exports = {
    data: {
        themeKey: {
            theme: 'system_theme',
            value: 'system_theme_mode'
        },
        theme: {
            value: '',
        },
        authCode: '',
        token: '',
        userId: '',
        shopId: '',
        gv: {
            nodata: '~到底了~',
            userinfo: 'userinfo',
            token: 'token',
            shopid: 'shopid',
            userid: 'userid',
            sessionkey: 'sessionkey',
            myaddresskey: 'myaddresskey',
            mapKey: 'FDABZ-22EK2-OTDU4-CK6ON-I5U7V-TUBQD',
            pagesize: 10,
            appid: 1,
            img: IMGURL,
            base: APIURL
        }
    },
    onLoad () {
    },
    onShow () {
        //this.isAuth()
        let token = wx.getStorageSync(this.data.gv.token)
        let userId = wx.getStorageSync(this.data.gv.userid)
        let shopId = wx.getStorageSync(this.data.gv.shopid)
        if (this.isnull(token)) {
            this.setData({
                token: token,
                userId: userId,
                shopId: shopId
            })
        }
    },
    onUnload () {
        wx.offThemeChange()
    },
    isAuth () {
        let token = wx.getStorageSync(this.data.gv.token)
        let userId = wx.getStorageSync(this.data.gv.userid)
        let shopId = wx.getStorageSync(this.data.gv.shopid)
        if (this.isnull(token)) {
            this.setData({
                token: token,
                userId: userId,
                shopId: shopId
            })
        } else {
            if (this.isnull(this.data.authCode)) {
                wx.navigateTo({ url: '/pages/login/index?code=' + this.data.authCode })
            }
        }
    },
    isnull (value) {
        switch (typeof value) {
            case 'undefined':
                return false
            case 'string':
                return value.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, '').length > 0
            case 'boolean':
                if (value) return true
                break
            case 'number':
                if (0 == value || isNaN(value)) return false
                break
            case 'object':
                if (null == value || value.length == 0) return false
                for (var i in value) {
                    return true
                }
                return false
        }
        return true
    },
    prePhoto (url) {
        let src = []
        src.push(url)
        wx.previewImage({
            urls: src
        })
    },
    prePhotoList (list, url) {
        wx.previewImage({
            current: url,
            urls: list
        })
    },
    require ($url) {
        return this.require($url)
    },
    themeHandler () {
        let themeKey = this.data.themeKey
        let theme = {}
        theme.isSystem = wx.getStorageSync(this.data.themeKey.theme)
        if (theme.isSystem === '') {
            wx.setStorageSync(this.data.themeKey.theme, true)
        }
        if (theme.isSystem) {
            wx.getSystemInfo({
                success (res) {
                    theme.value = res.theme
                    wx.setStorageSync(themeKey.value, theme.value)
                }
            })
            // 如果是跟随系统那么就监听主题改变
            wx.onThemeChange((res) => {
                theme.value = res.theme
                wx.setStorageSync(this.data.themeKey.value, theme.value)
                this.setData({
                    theme: theme
                })
            })
        } else {
            // 如果不是跟随系统那么就取消监听事件
            wx.offThemeChange()
            theme.value = wx.getStorageSync(this.data.themeKey.value)
        }
        this.setData({
            theme
        })
    },
    noscroll () {
        return false
    }
}