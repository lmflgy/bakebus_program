import regeneratorRuntime from '../../lib/runtime.js'
import { api } from '../../lib/api.js'
const pageObject = {
    mixins: [require('../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '订单管理',
        nav: [],
        orderStatus: 7,
        pageindex: 1,
        pagesize: 50,
        total: 0,
        list: [],
        searchValue: '',
        days: '',
        daye: '',
        maxDay: null,
        ishot: false,
        tab: [{ label: '自提', value: 1 }, { label: '配送', value: 2 }],
        tabid: null,
        isDel: true,
        osid: null,
        iswork: false,
        work: [],
        workid: '',
        borderid: '',
        bpid: '',
        roleid: 0
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
        this.hot()
        this.loadRole()
    },
    handleInput (e) {
        this.setData({
            searchValue: e.detail.value
        })
    },
    handleSearch () {
        this.setData({
            pageindex: 1,
            total: 0,
            list: []
        })
        this.loadPage()
    },
    bindDaySwitch (e) {
        this.setData({
            pageindex: 1,
            total: 0,
            list: [],
            tabid: e.detail.value
        })
        this.loadPage()
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
    async hot () {
        // 判断是否需要红点
        let shopId = wx.getStorageSync(this.data.gv.shopid)
        var res = await await api({ url: '/front/merchant/bake/orderMgr/getOrdersByOrderStatus', method: 'post', data: { name: '', startDate: '', endDate: '', orderStatus: 7, shopId: shopId, page: 1, limit: 10000 } })
        if (res.ResultCode == 0) {
            this.setData({
                ishot: false
            })
            if (res.Data.Items != null && res.Data.Items.length > 0) {
                this.setData({
                    ishot: true
                })
            }
        }
    },
    change (e) {
        let { status } = e.currentTarget.dataset
        this.setData({
            orderStatus: status,
            pageindex: 1,
            total: 0,
            list: []
        })
        this.loadPage()
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
                            var tp = goods.images.split(',')
                            goods.images = tp[0]
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
    },
    onPullDownRefresh () {
        this.setData({
            tabid: null,
            pageindex: 1,
            total: 0,
            list: []
        })
        this.loadPage()
    },
    onReachBottom () {
        if (this.data.list.length < this.data.total) {
            let _pageIndex = parseInt(this.data.pageindex) + 1
            this.setData({
                pageindex: _pageIndex
            })
            this.loadPage()
        }
    },
    cancelOrder (e) {
        const { orderid, index } = e.currentTarget.dataset
        let that = this
        wx.showModal({
            title: '提示',
            content: '确定取消订单吗？',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#666666',
            confirmText: '确定',
            confirmColor: '#000000',
            success: (result) => {
                if (result.confirm) {
                    that.cancelOrderApi(orderid, index)
                }
            }
        })
    },
    async cancelOrderApi (orderid, index) {
        wx.showLoading({ title: '', mask: true })
        var res = await api({ url: '/front/merchant/bake/orderMgr/cancelOrder', method: 'post', data: { orderId: orderid } })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            let list = []
            this.data.list.forEach((item, _index) => {
                if (index != _index) {
                    list.push(item)
                }
            })
            //list[index].orderStatus = 4
            this.setData({
                list: list
            })
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    },
    carOrder (e) {
        const { orderid, index } = e.currentTarget.dataset
        let that = this
        wx.showModal({
            title: '提示',
            content: '确定自叫车配吗？',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#666666',
            confirmText: '确定',
            confirmColor: '#000000',
            success: (result) => {
                if (result.confirm) {
                    that.carOrderApi(orderid, index)
                }
            }
        })
    },
    async carOrderApi (orderid, index) {
        wx.showLoading({ title: '', mask: true })
        var res = await api({ url: '/front/merchant/bake/orderMgr/chlickChePei', method: 'post', data: { orderId: orderid } })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            let list = []
            this.data.list.forEach((item, _index) => {
                if (index != _index) {
                    list.push(item)
                }
            })
            //list[index].orderStatus = 4
            this.setData({
                list: list
            })
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    },
    async makeOver (e) {
        const { orderid, index,ordertype } = e.currentTarget.dataset
        wx.showLoading({ title: '', mask: true })
        var res = await api({ url: '/front/merchant/bake/orderMgr/makeCompleted', method: 'post', data: { orderId: orderid,orderType:ordertype } })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            let list = []
            this.data.list.forEach((item, _index) => {
                if (index != _index) {
                    list.push(item)
                }
            })
            //list[index].orderStatus = 1
            this.setData({
                list: list
            })
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    },
    async takeOrder (e) {
        const { orderid, index } = e.currentTarget.dataset
        wx.showLoading({ title: '', mask: true })
        var res = await api({ url: '/front/merchant/bake/orderMgr/merchantOrders', method: 'post', data: { orderId: orderid } })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            let list = []
            this.data.list.forEach((item, _index) => {
                if (index != _index) {
                    list.push(item)
                }
            })
            //list[index].orderStatus = 1
            this.setData({
                list: list
            })
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    },
    async deleteOrder (e) {
        const { orderid, index } = e.currentTarget.dataset
        wx.showLoading({ title: '', mask: true })
        var res = await api({ url: '/front/merchant/bake/orderMgr/deleteOrder', method: 'post', data: { orderId: orderid } })
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
    refuseRefund (e) {
        const { orderid, index } = e.currentTarget.dataset
        let that = this
        wx.showModal({
            title: '提示',
            content: '确定拒绝退款吗？',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#666666',
            confirmText: '确定',
            confirmColor: '#000000',
            success: (result) => {
                if (result.confirm) {
                    that.refuseRefundApi(orderid, index)
                }
            }
        })
    },
    async refuseRefundApi (orderid, index) {
        wx.showLoading({ title: '', mask: true })
        var res = await api({ url: '/front/merchant/bake/orderMgr/refusedToRefund', method: 'post', data: { orderId: orderid } })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            let list = []
            this.data.list.forEach((item, _index) => {
                if (index != _index) {
                    list.push(item)
                }
            })
            //list[index].orderStatus = 1
            this.setData({
                list: list
            })
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    },
    agreeRefund (e) {
        const { orderid, index } = e.currentTarget.dataset
        let that = this
        wx.showModal({
            title: '提示',
            content: '确定同意退款吗？',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#666666',
            confirmText: '确定',
            confirmColor: '#000000',
            success: (result) => {
                if (result.confirm) {
                    that.agreeRefundApi(orderid, index)
                }
            }
        })
    },
    async agreeRefundApi (orderid, index) {
        wx.showLoading({ title: '', mask: true })
        var res = await api({ url: '/front/merchant/bake/orderMgr/agreeToRefund', method: 'post', data: { orderId: orderid } })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            let list = []
            this.data.list.forEach((item, _index) => {
                if (index != _index) {
                    list.push(item)
                }
            })
            //list[index].orderStatus = 6
            this.setData({
                list: list
            })
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    },
    send (e) {
        const { orderid, index } = e.currentTarget.dataset
        let that = this
        wx.showModal({
            title: '提示',
            content: '确定立即发货吗？发货后将通知快递小哥上门取货哦',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#666666',
            confirmText: '确定',
            confirmColor: '#000000',
            success: (result) => {
                if (result.confirm) {
                    that.sendApi(orderid, index)
                }
            }
        })
    },
    async sendApi (orderid, index) {
        wx.showLoading({ title: '', mask: true })
        var res = await api({ url: '/front/merchant/bake/orderMgr/immediateDelivery', method: 'post', data: { orderId: orderid } })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            let list = []
            this.data.list.forEach((item, _index) => {
                if (index != _index) {
                    list.push(item)
                }
            })
            //list[index].orderStatus = list[index].orderType == 1 ? 3 : 2
            this.setData({
                list: list
            })
            // 发货成功.创建闪送订单
            api({ url: '/front/merchant/bake/orderMgr/sendShanSongOrder?orderId=' + orderid, method: 'get' })
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    },
    bindOrderStatus (e) {
        this.setData({
            pageindex: 1,
            total: 0,
            list: [],
            osid: e.detail.value
        })
        this.loadPage()
    },
    ok (e) {
        const { orderid, index } = e.currentTarget.dataset
        let that = this
        wx.showModal({
            title: '提示',
            content: '确定已完成吗？',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#666666',
            confirmText: '确定',
            confirmColor: '#000000',
            success: (result) => {
                if (result.confirm) {
                    that.okApi(orderid, index)
                }
            }
        })
    },
    async okApi (orderid, index) {
        wx.showLoading({ title: '', mask: true })
        var res = await api({ url: '/front/merchant/bake/orderMgr/completed', method: 'post', data: { orderId: orderid } })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            let list = []
            this.data.list.forEach((item, _index) => {
                if (index != _index) {
                    list.push(item)
                }
            })
            //list[index].orderStatus = 3
            this.setData({
                list: list
            })
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    },
    goDetails (e) {
        const { orderid, balance } = e.currentTarget.dataset
        wx.navigateTo({ url: 'details?orderid=' + orderid + '&balance=' + balance })
    },
    async chooseWork (e) {
        const { orderid, index } = e.currentTarget.dataset
        wx.showLoading({ title: '', mask: true })
        var res = await api({ url: '/front/merchant/user/manage/getDecoratorList', method: 'get' })
        wx.hideLoading()
        if (res.ResultCode == 0) {
            this.setData({
                workid: '',
                work: res.Data,
                isWork: true,
                borderid: orderid,
                bpid: index
            })
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    },
    handleWork () {
        this.setData({
            isWork: false
        })
    },
    chooseItem (e) {
        const { pid } = e.currentTarget.dataset
        this.setData({
            workid: pid
        })
    },
    confirmWork () {
        let that = this
        wx.showModal({
            title: '提示',
            content: '确定分配当前选择的裱花师吗？',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#666666',
            confirmText: '确定',
            confirmColor: '#000000',
            success: (result) => {
                if (result.confirm) {
                    that.decoratorApi()
                }
            }
        })

    },
    async decoratorApi () {
        wx.showLoading({ title: '', mask: true })
        var res = await api({ url: '/front/merchant/bake/orderMgr/allocationDecorator?orderId=' + this.data.borderid + '&decoratorPId=' + this.data.workid, method: 'get' })
        wx.hideLoading()
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            let list = []
            this.data.list.forEach((item, _index) => {
                if (this.data.bpid != _index) {
                    list.push(item)
                }
            })
            this.setData({
                list: list,
                workid: '',
                work: [],
                isWork: false,
                borderid: '',
                bpid: 0
            })
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    },
    async loadRole () {
        var res = await api({ url: '/front/merchant/user/manage/getUserType', method: 'get' })
        if (res.ResultCode == 0) {
            this.setData({
                roleid: res.Data
            })
        }
    },
    wuliu (e) {
        const { orderid, index } = e.currentTarget.dataset
        let that = this
        wx.showModal({
            title: '提示',
            editable: true,
            placeholderText: '请输入快递单号',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#666666',
            confirmText: '确定',
            confirmColor: '#000000',
            success: (result) => {
                console.log(result)
                if (result.confirm) {
                    if (result.content) {
                        that.wuliuApi(orderid, result.content, index)
                    } else {
                        wx.showToast({ icon: 'none', title: '请输入快递单号' })
                        return
                    }
                }
            }
        })
    },
    async wuliuApi (orderid, no, index) {
        wx.showLoading({ title: '', mask: true })
        var res = await api({ url: '/front/user/bake/orderMgr/wuliuOrderNo?orderId=' + orderid + '&wuliuOrderNo=' + no, method: 'get' })
        wx.hideLoading()
        if (res.ResultCode == 0) {
            wx.showToast({ title: '快递配送成功' })
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
    }
}
Page(pageObject)
