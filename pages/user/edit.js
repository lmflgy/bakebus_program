import regeneratorRuntime from '../../lib/runtime.js'
import { api } from '../../lib/api.js'
const pageObject = {
    mixins: [require('../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '',
        pid: '',
        maxDate: null,
        name: '',
        phone: '',
        birthday: null,
        message: '',
        relationship: '',
        type: 0,
        range: [],
        remindermethod: 1,
        current: 0,
        mode: [{ key: '普通用户', value: 0 }, { key: '客服', value: 1 }, { key: '裱花师', value: 2 }, { key: '店长', value: 3 }]
    },
    onLoad (param) {
        let pid = param.pid
        if (this.isnull(pid)) {
            this.setData({
                pid: pid,
                title: '编辑用户'
            })
            wx.setNavigationBarTitle({ title: '编辑用户' })
        } else {
            this.setData({
                title: '添加用户'
            })
            wx.setNavigationBarTitle({ title: '添加用户' })
        }
    },
    onShow () {

    },
    bindModeChange (e) {
        this.setData({
            current: e.detail.value,
            remindermethod: this.data.mode[e.detail.value].value
        })
    },
    handleInput (e) {
        const { key } = e.currentTarget.dataset
        this.setData({
            [key]: e.detail.value
        })
    },
    handleMsg (e) {
        this.setData({
            message: e.detail.value
        })
    },
    submitUser () {
        wx.showLoading({ title: '提交中', mask: true })
        if (!this.isnull(this.data.userid)) {
            wx.showToast({ title: '账号不正确', icon: 'none' })
            return
        }
        if (!this.isnull(this.data.phone) || this.data.phone.length != 11) {
            wx.showToast({ title: '手机不正确', icon: 'none' })
            return
        }
        if (!this.isnull(this.data.username)) {
            wx.showToast({ title: '请输入姓名', icon: 'none' })
            return
        }
        if (!this.isnull(this.data.password) || this.data.password.length < 6) {
            wx.showToast({ title: '密码不正确', icon: 'none' })
            return
        }
        let model = {
            password: this.data.password,
            type: this.data.current,
            userid: this.data.userid,
            phone: this.data.phone,
            username: this.data.username
        }
        this.addUserApi(model)
    },
    async addUserApi (model) {
        var res = await api({ header: {}, url: '/front/merchant/user/manage/addUser', method: 'post', data: model })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            setTimeout(() => {
                wx.navigateBack({ delta: 1 })
            }, 1500)
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    }
}
Page(pageObject)
