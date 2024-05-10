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
        this.loadPage()
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
    async loadPage () {
        wx.showLoading({ title: "加载中", mask: true })
        let shopId = wx.getStorageSync(this.data.gv.shopid)
        var res = await api({ url: '/front/merchant/bake/datatotal/getDecoratorOrderData?startTime=' + this.data.days + '&endTime=' + this.data.daye, method: 'get' })
        if (res.ResultCode == 0) {
            let list = []
            if (res.Data != null && res.Data.length > 0) {
                res.Data.forEach((item, index) => {
                    item.height = 'height:0'
                    item.sel = false
                    if (index == 0) {
                        item.sel = true
                        item.height = 'height:' + (item.goodsDetailVoList.length * 190) + 'rpx'
                    }
                    list.push(item)
                })
            }
            this.setData({
                list: list
            })
        }
        wx.stopPullDownRefresh()
        wx.hideLoading()
    },
    goDetails (e) {
        const { orderid } = e.currentTarget.dataset
        console.log(orderid);
        wx.navigateTo({ url: '/pages/order/details?orderid=' + orderid })
    },
    handleAction (e) {
        const { index } = e.currentTarget.dataset
        let list = this.data.list
        list[index].sel = !list[index].sel
        if (list[index].sel) {
            list[index].height = 'height:' + (list[index].goodsDetailVoList.length * 190) + 'rpx'
        } else {
            list[index].height = 'height:0'
        }
        this.setData({
            list: list
        })
    }
}
Page(pageObject)
