import regeneratorRuntime from '../../lib/runtime.js'
import { api } from '../../lib/api.js'
const pageObject = {
    mixins: [require('../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '订单详情',
        orderid: '',
        balance: 0,
        item: null,
        path: []
    },
    onLoad (param) {
        this.setData({
            orderid: param.orderid
        })
        if (param.balance) {
            this.setData({
                balance: param.balance
            })
        }
    },
    onShow () {
        this.loadInit()
    },
    async loadInit () {
        var res = await api({ url: '/front/merchant/bake/orderMgr/getOrderDetail?orderId=' + this.data.orderid, method: 'get' })
        if (res.ResultCode == 0) {
            let totalNum = 0
            if (res.Data.bakePickUpOrderDetailVos != null && res.Data.bakePickUpOrderDetailVos.length > 0) {
                res.Data.bakePickUpOrderDetailVos.forEach((item) => {
                    var tp = item.images.split(',')
                    item.images = tp[0]
                    totalNum += parseInt(item.num)
                })
            }
            let photo = []
            if (res.Data.imgUrl) {
                photo = JSON.parse(res.Data.imgUrl)
            }
            if(res.Data.address){
                res.Data.address = res.Data.address.replace('undefined','')
            }
            this.setData({
                item: res.Data,
                totalNum: totalNum,
                path: photo
            })
        }
    },
    copyWuliu(){
        wx.setClipboardData({ data: this.data.item.wuliuOrderNo })
    },
    copyOrderNo () {
        wx.setClipboardData({ data: this.data.item.orderNo })
    },
    copyAddress () {
        let s = this.data.item.name + ' ' + this.data.item.phone
        if (this.data.item.orderType != 1) {
            s += ' ' + this.data.item.address
        }
        wx.setClipboardData({
            data: s
        })
    },
    showPrev0 (e) {
        const { src } = e.currentTarget.dataset
        wx.previewImage({
            current: 0,
            urls: [src],
            success: (result) => {
            },
            fail: () => { },
            complete: () => { }
        })
    },
    showPrev (e) {
        const { index } = e.currentTarget.dataset
        wx.previewImage({
            current: this.data.path[index],
            urls: this.data.path,
            success: (result) => {
            },
            fail: () => { },
            complete: () => { }
        })
    }
}
Page(pageObject)
