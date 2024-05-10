import regeneratorRuntime from '../../../lib/runtime.js'
import { api } from '../../../lib/api.js'
const pageObject = {
    mixins: [require('../../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '售完管理',
        type: 1,
    },
    onLoad (param) {
        this.setData({
            type: param.type,
            title: param.type == 1 ? '尺寸售完管理' : '夹心售完管理'
        })
    },
    onShow () {
        this.loadInit()
    },
    async loadInit () {
        wx.showLoading({ title: '加载中', mask: true })
        let shopId = wx.getStorageSync(this.data.gv.shopid)
        var res = await api({ url: '/front/merchant/server/sellEndManageList?type=' + this.data.type + '&shopId=' + shopId })
        if (res.ResultCode == 0) {
            this.setData({
                list: res.Data
            })
        }
        wx.hideLoading()
    },
    async handleChange (e) {
        const { index } = e.currentTarget.dataset
        let shopId = wx.getStorageSync(this.data.gv.shopid)
        let item = this.data.list[index]
        let status = 0
        if (item.status == 1) {
            status = 0
        } else {
            status = 1
        }
        var res = await api({ header: true, url: '/front/merchant/server/sellEndManageSave', method: 'post', data: [{ name: item.name, status: status, shopId: shopId }] })
        if (res.ResultCode == 0) {
            let list = this.data.list
            list[index].status = status
            this.setData({
                list: list
            })
            wx.showToast({ title: '操作成功' })
        }
    },
    async handleChange1 (e) {
        const { index } = e.currentTarget.dataset
        let shopId = wx.getStorageSync(this.data.gv.shopid)
        let item = this.data.list[index]
        let status = 0
        if (item.status == 1) {
            status = 0
        } else {
            status = 1
        }
        var res = await api({ header: true, url: '/front/merchant/server/sellEndManageSave', method: 'post', data: [{ sandwichId: item.sandwichId, status: status, shopId: shopId }] })
        if (res.ResultCode == 0) {
            let list = this.data.list
            list[index].status = status
            this.setData({
                list: list
            })
            wx.showToast({ title: '操作成功' })
        }
    }
}
Page(pageObject)
