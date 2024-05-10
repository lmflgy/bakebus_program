import regeneratorRuntime from '../../lib/runtime.js'
import { api } from '../../lib/api.js'
const pageObject = {
    mixins: [require('../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '裱花师订单统计',
        nav: [],
        pageindex: 1,
        pagesize: 10,
        total: 0,
        list: [],
        days: '',
        daye: '',
        maxDay: null
    },
    onLoad () {
        var date = new Date()
        let max = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
        this.setData({
            maxDay: max
        })
        this.loadInit()
    },
    onShow () {

    },
    bindDaySChange (e) {
        this.setData({
            days: e.detail.value
        })
        if (this.data.daye) {
            this.setData({
                pageindex: 1,
                total: 0,
                list: []
            })
            this.loadPage()
        }
    },
    bindDayEChange (e) {
        this.setData({
            daye: e.detail.value
        })
        if (this.data.days) {
            this.setData({
                pageindex: 1,
                total: 0,
                list: []
            })
            this.loadPage()
        }
    },
    async loadInit () {
        var res = await api({ url: '/front/merchant/bake/orderMgr/orderStatusList', method: 'get' })
        if (res.ResultCode == 0) {
            this.setData({
                nav: res.Data,
                orderStatus: res.Data[0].value
            })
        }
        var role = await api({ url: '/front/merchant/user/manage/getUserAuth', mthod: 'get' })
        if (role.ResultCode == 0) {
            if (role.Data) {
                let item = role.Data.find(d => d.id == 1)
                if (item && item.children != null && item.children.length > 0) {
                    let nav = []
                    this.data.nav.forEach((nv) => {
                        item.children.forEach((cl) => {
                            if (nv.value == cl) {
                                nav.push(nv)
                            }
                        })
                    })
                    if (nav != null && nav.length > 0) {
                        this.setData({
                            nav: nav,
                            orderStatus: nav[0].value,
                            isDel: false
                        })
                    }
                }
            }
        }
        this.onPullDownRefresh()
    },
    async loadPage () {
        wx.showLoading({ title: "加载中", mask: true })
        let shopId = wx.getStorageSync(this.data.gv.shopid)
        let data = {
            name: this.data.searchValue,
            startDate: this.data.days,
            endDate: this.data.daye,
            orderStatus: this.data.orderStatus,
            shopId: shopId,
            page: this.data.pageindex,
            limit: this.data.pagesize
        }
        if (this.data.tabid) {
            data.orderType = this.data.tab[this.data.tabid].value
        }
        if (this.data.orderStatus == -1 && this.data.osid) {
            data.orderStatus = this.data.nav[this.data.osid].value
        }
        var res = await api({ url: '/front/merchant/bake/orderMgr/getOrdersByOrderStatus', method: 'post', data: data })
        if (res.ResultCode == 0) {
            let list = []
            if (res.Data.Items != null && res.Data.Items.length > 0) {
                res.Data.Items.forEach((item) => {
                    let sum = 0
                    if (item.orderDetails != null && item.orderDetails.length > 0) {
                        item.orderDetails.forEach((goods) => {
                            sum += parseInt(goods.num)
                        })
                    }
                    item.totalNum = sum
                    list.push(item)
                })
            }
            this.setData({
                total: res.Data.TotalRecordCount,
                list: [...this.data.list, ...list]
            })
        }
        wx.stopPullDownRefresh()
        wx.hideLoading()
    }
}
Page(pageObject)
