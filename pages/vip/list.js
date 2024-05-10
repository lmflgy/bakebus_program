import regeneratorRuntime from '../../lib/runtime.js'
import { api } from '../../lib/api.js'
const pageObject = {
    mixins: [require('../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '服务列表',
        vipId: '',
        pageindex: 1,
        pagesize: 10,
        total: 0,
        list: []
    },
    onLoad (param) {
        this.setData({
            vipId: param.vipId
        })
    },
    onShow () {
        this.onPullDownRefresh()
    },
    async loadInit () {
        wx.showLoading({ title: '加载中', mask: true })
        var res = await api({ url: '/front/merchant/server/severlist', method: 'get' })
        if (res.ResultCode == 0) {
            this.setData({
                total: res.Data.TotalRecordCount,
                list: res.Data.Items
            })
        }
        wx.stopPullDownRefresh()
        wx.hideLoading()
    },
    onPullDownRefresh () {
        this.setData({
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
    edit () {
        wx.navigateTo({ url: 'in' })
    },
    goEdit (e) {
        const { pid } = e.currentTarget.dataset
        wx.navigateTo({ url: 'in?serverId=' + pid })
    }
}
Page(pageObject)
