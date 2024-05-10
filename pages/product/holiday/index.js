import regeneratorRuntime from '../../../lib/runtime.js'
import { api } from '../../../lib/api.js'
const pageObject = {
    mixins: [require('../../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '节假日管理',
        holiday: '请选择',
        status: 0,
        shopId: '',
        goods: [],
        pid: ''
    },
    onLoad (param) {
        if (param.pid) {
            this.setData({
                pid: param.pid
            })
        }
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
            if (res.Data != null && res.Data.length > 0) {
                let item = null
                res.Data.forEach((li) => {
                    if (li.pid == this.data.pid) {
                        item = li
                    }
                })
                if (item != null) {
                    this.setData({
                        holiday: item.holiday,
                        status: item.status
                    })
                    this.loadGoods(item.goodsIdList)
                } else {
                    this.loadGoods()
                }
            } else {
                this.loadGoods()
            }
        } else {
            this.loadGoods()
        }
        wx.hideLoading()
    },
    async loadGoods (ids) {
        var res = await api({ header: {}, url: '/front/merchant/bake/banner/associatedList?shopId=' + this.data.shopId, method: 'get' })
        if (res.ResultCode == 0) {
            let list = []
            if (res.Data != null && res.Data.Items != null && res.Data.Items.length > 0) {
                res.Data.Items.forEach((item) => {
                    if (item.images.indexOf('http') < 0) {
                        let tp = item.images.split(',')
                        item.images = this.data.gv.img + tp[0]
                    }
                    if (ids != null && ids.length > 0) {
                        var it = ids.find(d => d == item.pid)
                        if (it) {
                            item.IsChoose = true
                        } else {
                            item.IsChoose = false
                        }
                    } else {
                        item.IsChoose = false
                    }
                    list.push(item)
                })
            } else {
                wx.showToast({ title: '请先添加产品', icon: 'none' })
            }
            this.setData({
                goods: list
            })
        }
    },
    chooseImte (e) {
        const { index } = e.currentTarget.dataset
        let list = this.data.goods
        list[index].IsChoose = !list[index].IsChoose
        this.setData({
            goods: list
        })
    },
    handleDate (e) {
        this.setData({
            holiday: e.detail.value
        })
    },
    handleChange (e) {
        this.setData({
            status: this.data.status == 1 ? 0 : 1
        })
    },
    async submit () {
        if (this.data.holiday == '请选择') {
            wx.showToast({ title: '请选择节假日期', icon: 'none' })
            return
        }
        let goodsIdList = []
        this.data.goods.forEach((item) => {
            if (item.IsChoose) {
                goodsIdList.push(item.pid)
            }
        })
        if (goodsIdList == null || goodsIdList.length < 1) {
            wx.showToast({ title: '请选择可购买商品', icon: 'none' })
            return
        }
        let model = {
            holiday: this.data.holiday,
            status: this.data.status,
            goodsIdList: goodsIdList,
            shopId: this.data.shopId
        }
        if (this.data.pid) {
            model.pid = this.data.pid
        }
        const res = await api({ header: true, url: '/front/merchant/server/sellEndManageSave', method: 'post', data: [model] })
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
