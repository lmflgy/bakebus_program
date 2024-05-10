import regeneratorRuntime from '../../../lib/runtime.js'
import { api } from '../../../lib/api.js'
const pageObject = {
    mixins: [require('../../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '产品管理',
        goodsName: '',
        goodsStatus: 1,
        pageindex: 1,
        pagesize: 10,
        total: 0,
        list: []
    },
    onLoad () {

    },
    onShow () {
        this.onPullDownRefresh()
    },
    handleInput (e) {
        this.setData({
            goodsName: e.detail.value
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
    change (e) {
        let { status } = e.currentTarget.dataset
        this.setData({
            goodsStatus: status,
            pageindex: 1,
            total: 0,
            list: []
        })
        this.loadInit()
    },
    async loadInit () {
        wx.showLoading({ title: '加载中', mask: true })
        var res = await api({ header: {}, url: '/front/merchant/bake/goodsMgr/getGoodsBygoodsStatus', method: 'post', data: { shopId: this.data.shopId, key: this.data.goodsName, goodsStatus: this.data.goodsStatus, page: this.data.pageindex, limit: this.data.pagesize } })
        if (res.ResultCode == 0) {
            let list = []
            if (res.Data != null && res.Data.Items != null && res.Data.Items.length > 0) {
                res.Data.Items.forEach((item) => {
                    if (item.images.indexOf('http') < 0) {
                        item.images = this.data.gv.img + item.images
                    }
                    item.IsOper = false
                    list.push(item)
                })
            }
            this.setData({
                total: res.Data.TotalRecordCount,
                list: [...this.data.list, ...list]
            })
        }
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        wx.hideLoading()
    },
    onPullDownRefresh () {
        this.setData({
            goodsName: '',
            pageindex: 1,
            goodsStatus: 1,
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
    handleOper (e) {
        let { index } = e.currentTarget.dataset
        let list = []
        this.data.list.forEach((item, _index) => {
            item.IsOper = index == _index
            list.push(item)
        })
        this.setData({
            list: list,
            isOper: true
        })
    },
    closeOper () {
        let list = []
        this.data.list.forEach((item, _index) => {
            item.IsOper = false
            list.push(item)
        })
        this.setData({
            list: list,
            isOper: false
        })
    },
    async updown (e) {
        const { index, pid, status } = e.currentTarget.dataset
        var res = await api({ header: {}, url: '/front/merchant/bake/goodsMgr/OnAndOffShelves', method: 'post', data: { pid: pid, goodsStatus: status } })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            let list = []
            this.data.list.forEach((item) => {
                if (item.pid != pid) {
                    item.IsOper = false
                    list.push(item)
                }
            })
            let that = this
            setTimeout(() => {
                that.setData({
                    list: list,
                    isOper: false
                })
            }, 1500)
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    },
    edit (e) {
        const { pid, shopId} = e.currentTarget.dataset
        wx.navigateTo({ url: 'edit?pid=' + pid +'&shopId='+shopId})
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
        wx.showLoading()
        var res = await api({ url: '/front/merchant/bake/goodsMgr/BatchDelete', method: 'post', data: { ids: pid } })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            let list = []
            this.data.list.forEach((item) => {
                if (item.pid != pid) {
                    item.IsOper = false
                    list.push(item)
                }
            })
            let that = this
            setTimeout(() => {
                that.setData({
                    list: list,
                    isOper: false
                })
            }, 1500)
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    },
    handleFocus () {
        this.closeOper()
    },
    goAdd () {
        this.closeOper()
        wx.navigateTo({ url: 'edit?pid=' })
    }
}
Page(pageObject)
