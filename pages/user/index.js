import regeneratorRuntime from '../../lib/runtime.js'
import { api } from '../../lib/api.js'
const pageObject = {
    mixins: [require('../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '用户管理',
        pageindex: 1,
        pagesize: 10,
        total: 0,
        list: []
    },
    onLoad () {

    },
    onShow () {
        this.loadInit()
    },
    async loadInit () {
        wx.showLoading({ title: '加载中', mask: true })
        var res = await api({ header: {}, url: '/front/merchant/user/manage/getUserForServer', method: 'get' })
        if (res.ResultCode == 0) {
            this.setData({
                list: res.Data
            })
        }
        wx.hideLoading()
    },
    handleInputName (e) {
        this.setData({
            name: e.detail.value
        })
    },
    handleInputPhone (e) {
        this.setData({
            phone: e.detail.value
        })
    },
    handleSearch () {
        this.setData({
            pageindex: 1,
            total: 0,
            list: []
        })
        this.loadInit()
    },
    edit () {
        wx.navigateTo({ url: 'edit' })
    },
    goRole (e) {
        const { pid, index } = e.currentTarget.dataset
        let role = this.data.list[index].authList
        wx.navigateTo({ url: 'role?pid=' + pid + '&role=' + JSON.stringify(role) })
    },
    reset (e) {
        const { pid } = e.currentTarget.dataset
        let that = this
        wx.showModal({
            title: '提示',
            content: '确定重置用户的登录密码吗？',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#666666',
            confirmText: '确定',
            confirmColor: '#000000',
            success: (result) => {
                if (result.confirm) {
                    that.resetApi(pid)
                }
            }
        })
    },
    async resetApi (pid) {
        var res = await api({ header: {}, url: '/front/merchant/user/manage/updatePass', method: 'put', data: [pid] })
        if (res.ResultCode == 0) {
            wx.showToast({ title: '重置成功' })
        }
    },
    del (e) {
        const { pid, index } = e.currentTarget.dataset
        let that = this
        wx.showModal({
            title: '提示',
            content: '确定删除账户吗？',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#666666',
            confirmText: '确定',
            confirmColor: '#000000',
            success: (result) => {
                if (result.confirm) {
                    that.delApi(pid, index)
                }
            }
        })
    },
    async delApi (pid, index) {
        wx.showLoading({ title: '', mask: true })
        var res = await api({ header: {}, url: '/front/merchant/user/manage/delete', method: 'delete', data: [pid] })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            let that = this
            setTimeout(() => {
                let list = []
                that.data.list.forEach((item, i) => {
                    if (i != index) {
                        list.push(item)
                    }
                })
                that.setData({
                    list: list
                })
            }, 1500)
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    }
}
Page(pageObject)
