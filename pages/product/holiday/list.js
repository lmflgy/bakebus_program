import regeneratorRuntime from '../../../lib/runtime.js'
import { api } from '../../../lib/api.js'
const pageObject = {
    mixins: [require('../../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '节假日管理',
        list: []
    },
    onLoad () {
        let shopId = wx.getStorageSync(this.data.gv.shopid)
        this.setData({
            shopId: shopId
        })
    },
    onShow () {
        this.loadInit()
    },
    async loadInit () {
        wx.showLoading({ title: '加载中', mask: true })
        var res = await api({ url: '/front/merchant/server/sellEndManageList?type=3&shopId=' + this.data.shopId })
        if (res.ResultCode == 0) {
            if (res.Data) {
                wx.setStorageSync('date', res.Data)
                this.setData({
                    list: res.Data
                })
            }
        }
        wx.hideLoading()
    },
    add () {
        wx.navigateTo({ url: 'index', })
    },
    update (e) {
        const { index, pid } = e.currentTarget.dataset
        wx.navigateTo({ url: 'index?pid=' + pid })
    },
    del (e) {
        const { index, pid } = e.currentTarget.dataset
        let that = this
        wx.showModal({
            title: '提示',
            content: '确定删除吗？',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#666666',
            confirmText: '确定',
            confirmColor: '#333333',
            success: (result) => {
                if (result.confirm) {
                    that.delApi(index, pid)
                }
            }
        })
    },
    async delApi (index, pid) {
        wx.showLoading({ title: '', mask: true })
        var res = await api({ url: '/front/merchant/server/sellEndManageDelete?pid=' + pid })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            let list = []
            this.data.list.forEach((item, _index) => {
                if (index != _index) {
                    list.push(item)
                }
            })
            this.setData({
                list: list
            })
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    },
}
Page(pageObject)
