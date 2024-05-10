import regeneratorRuntime from '../../lib/runtime.js'
import { api } from '../../lib/api.js'
const pageObject = {
    mixins: [require('../../mixin/themeChange.js')],
    data: {
        code: 0,
        Account: '',
        Password: '',
        auth: ''
    },
    onLoad (param) {
        //18373595020
        let code = param.code
        if (this.isnull(code)) {
            this.setData({
                code: code
            })
        }
        let auth = param.auth
        if (this.isnull(auth)) {
            this.setData({
                auth: auth
            })
        }
    },
    onShow () {

    },
    inputAccount (e) {
        this.setData({
            Account: e.detail.value
        })
    },
    inputPassword (e) {
        this.setData({
            Password: e.detail.value
        })
    },
    async login () {
        if (!this.isnull(this.data.Account)) {
            wx.showToast({ title: '请输入用户名', icon: 'none' })
            return
        }
        if (!this.isnull(this.data.Password)) {
            wx.showToast({ title: '请输入密码', icon: 'none' })
            return
        }
        wx.showLoading({ title: "登录中", mask: true })
        var res = await api({ url: '/front/merchant/login/login', method: 'post', data: { username: this.data.Account, password: this.data.Password } })
        if (res.ResultCode == 0) {
            wx.setStorageSync(this.data.gv.token, res.Data.token)
            wx.setStorageSync(this.data.gv.shopid, res.Data.shopid)
            wx.setStorageSync(this.data.gv.userid, res.Data.userid)
            this.setData({
                token: res.Data.token,
                shopId: res.Data.shopid,
                userId: res.Data.userid,
            })
            wx.showToast({ title: '登录成功' })
            let that = this
            setTimeout(() => {
                if (that.data.auth == 'home') {
                    wx.switchTab({ url: '/pages/index/index' })
                } else {
                    let pages = getCurrentPages()
                    if (pages.length > 1) {
                        wx.navigateBack({ delta: 1 })
                    } else {
                        wx.switchTab({ url: '/pages/index/index' })
                    }
                }
            }, 1500)
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    }
}
Page(pageObject)
