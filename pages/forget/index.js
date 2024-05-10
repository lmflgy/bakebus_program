import regeneratorRuntime from '../../lib/runtime.js'
import { api } from '../../lib/api.js'
const pageObject = {
    mixins: [require('../../mixin/themeChange.js')],
    data: {
        currentIndex: 0,
        Account: '',
        Code: '',
        Password: '',
        Pwd: '',
        sendBtn: '获取验证码',
        mm: 60,
        countDown: 60,
        isSend: false
    },
    onLoad () {

    },
    onShow () {

    },
    inputAccount (e) {
        this.setData({
            Account: e.detail.value
        })
    },
    async getSMS () {
        if (!this.data.isSend) {
            if (this.isnull(this.data.Account) && this.data.Account.length == 11) {
                var res = await api({ url: '/front/merchant/login/sendMessage?phone=' + this.data.Account, method: 'get' })
                if (res.ResultCode == 0) {
                    wx.showToast({ title: '验证码已发送' })
                    let that = this
                    var timer = setInterval(() => {
                        let cd = that.data.countDown
                        if (cd <= 0) {
                            that.setData({
                                countDown: that.data.mm,
                                isSend: false,
                                sendBtn: '获取验证码'
                            })
                            clearInterval(timer)
                        } else {
                            cd--
                            that.setData({
                                countDown: cd,
                                isSend: true,
                                sendBtn: '再次发送(' + cd + 'S)'
                            })
                        }
                    }, 1000)
                }
            } else {
                wx.showToast({ title: '手机号不正确', icon: 'none' })
            }
        }
    },
    inputCode (e) {
        this.setData({
            Code: e.detail.value
        })
    },
    inputPassword (e) {
        this.setData({
            Password: e.detail.value
        })
    },
    inputPwd (e) {
        this.setData({
            Pwd: e.detail.value
        })
    },
    async submit () {
        wx.showLoading({ title: '修改中...', mask: true })

        if (!this.isnull(this.data.Account) || this.data.Account.length != 11) {
            wx.showToast({ title: '手机号不正确', icon: 'none' })
            return
        }
        if (!this.isnull(this.data.Code) || this.data.Code.length != 6) {
            wx.showToast({ title: '验证码不正确', icon: 'none' })
            return
        }
        if (!this.isnull(this.data.Password)) {
            wx.showToast({ title: '请输入新密码', icon: 'none' })
            return
        }
        if (this.data.Password.length < 6) {
            wx.showToast({ title: '新密码长度错误', icon: 'none' })
            return
        }
        if (!this.isnull(this.data.Pwd)) {
            wx.showToast({ title: '请输入确认密码', icon: 'none' })
            return
        }
        if (this.data.Pwd.length < 6) {
            wx.showToast({ title: '确认密码长度错误', icon: 'none' })
            return
        }
        if (this.data.Password != this.data.Pwd) {
            wx.showToast({ title: '两次输入不一致', icon: 'none' })
            return
        }
        var res = await api({ url: '/front/merchant/login/updatePassword', method: 'post', data: { phone: this.data.Account, newPassword: this.data.Password, verificationCode: this.data.Code } })
        if (res.ResultCode == 0) {
            wx.hideLoading()
            this.setData({
                currentIndex: 1
            })
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    }
}
Page(pageObject)
