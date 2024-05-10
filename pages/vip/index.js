import regeneratorRuntime from '../../lib/runtime.js'
import { api } from '../../lib/api.js'
const pageObject = {
    mixins: [require('../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: 'VIP会员',
        nav: [
            { key: '全部会员', value: -1 },
            { key: '在线会员', value: 0 },
            { key: '临期会员', value: 1 },
            { key: '已过期会员', value: 2 }
        ],
        status: 0,
        pageindex: 1,
        pagesize: 10,
        total: 0,
        list: []
    },
    onLoad () {

    },
    onShow () {
        this.loadStatus()
        this.onPullDownRefresh()
    },
    async loadStatus () {
        var res = await api({ url: '/front/merchant/vip/vipStatusList', method: 'get' })
        this.setData({
            nav: res.Data
        })
    },
    async loadInit () {
        wx.showLoading({ title: '加载中', mask: true })
        var res = await api({ url: '/front/merchant/vip/vipList?shopId=' + this.data.shopId + '&status=' + this.data.status + '&page=' + this.data.pageindex + '&limit=' + this.data.pagesize, method: 'get' })
        if (res.ResultCode == 0) {
            this.setData({
                total: res.Data.TotalRecordCount,
                list: [...this.data.list, ...res.Data.Items]
            })
        }
        wx.stopPullDownRefresh()
        wx.hideLoading()
    },
    onPullDownRefresh () {
        this.setData({
            status: 0,
            pageindex: 1,
            total: 0,
            list: []
        })
        this.loadInit()
    },
    onReachBottom () {
        if (this.data.list.length < this.data.total) {
            let _pageIndex = parseInt(this.data.pageindex) + 1
            this.setData({
                pageindex: _pageIndex
            })
            this.loadInit()
        }
    },
    change (e) {
        let { status } = e.currentTarget.dataset
        this.setData({
            status: status,pageindex: 1,
            total: 0,
            list: []
        })
        this.loadInit()
    },
    edit () {
        wx.navigateTo({ url: 'edit' })
    }
}
Page(pageObject)
