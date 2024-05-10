import regeneratorRuntime from '../../../lib/runtime.js'
import { api } from '../../../lib/api.js'
const pageObject = {
    mixins: [require('../../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '轮播图管理',
        list: [],
        Path: [],
        isGoods: false,
        goods: [],
        model: null
    },
    onLoad () {

    },
    onShow () {
        this.loadInit()
    },
    async loadInit () {
        wx.showLoading({ title: '加载中', mask: true })
        var res = await api({ url: '/front/merchant/bake/banner/getSandwichsByShopId', method: 'post', data: { shopId: this.data.shopId } })
        if (res.ResultCode == 0) {
            this.setData({
                list: res.Data
            })
        }
        this.loadGoods()
        wx.hideLoading()
    },
    upload () {
        let count = 9 - this.data.Path.length - this.data.list.length
        console.log(count)
        let that = this
        wx.chooseImage({
            count: count, // 最多可以选择的图片张数，默认9
            sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
            sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
            success: function (res) {
                wx.showLoading({ title: '上传中', mask: true })
                let ok = 0
                res.tempFilePaths.forEach((src) => {
                    wx.uploadFile({
                        url: that.data.gv.base + '/common/upload',
                        filePath: src,
                        name: 'file',
                        header: {
                            "Content-Type": "multipart/form-data",
                            "chartset": "utf-8",
                            "Authorization": wx.getStorageSync("token")
                        },
                        success: (result) => {
                            if (result.statusCode == 200) {
                                let res1 = JSON.parse(result.data)
                                if (res1.ResultCode == 0) {
                                    let path = that.data.Path
                                    path.push(res1.fileName)
                                    that.setData({
                                        Path: path
                                    })
                                    ok++
                                }
                                if (ok >= res.tempFilePaths.length) {
                                    wx.hideLoading()
                                }
                            }
                        }
                    })
                })
            }
        })
    },
    del (e) {
        const { index } = e.currentTarget.dataset
        let that = this
        wx.showModal({
            title: '提示',
            content: '确定删除吗？',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#666666',
            confirmText: '确定',
            confirmColor: '#000000',
            success: (result) => {
                if (result.confirm) {
                    that.delApi(index)
                }
            }
        })
    },
    async delApi (index) {
        wx.showLoading({ title: '', mask: true })
        let ids = [this.data.list[index].pid]
        var res = await api({ header: {}, url: '/front/merchant/bake/banner/BatchDelete', method: 'post', data: ids })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            let list = []
            this.data.list.forEach((item, _index) => {
                if (index != _index) {
                    list.push(item)
                }
            })
            let that = this
            setTimeout(() => {
                that.setData({
                    list: list
                })
            }, 1500)
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    },
    delPath (e) {
        const { index } = e.currentTarget.dataset
        let list = []
        this.data.Path.forEach((src, _index) => {
            if (index != _index) {
                list.push(src)
            }
        })
        this.setData({
            Path: list
        })
    },
    submit () {
        if (this.data.Path != null && this.data.Path.length > 0) {
            wx.showLoading({ title: '保存中...', mask: true })
            let count = 0
            this.data.Path.forEach((item) => {
                if (this.addApi(item, this.data.shopId)) {
                    count++
                }
            })
            if (count > 0) {
                if (this.data.Path.length == count) {
                    wx.showToast({ title: '保存成功', mask: true })
                } else {
                    wx.showToast({ title: '部分保存成功', icon: 'none' })
                }
            } else {
                wx.showToast({ title: '保存失败', icon: 'none' })
            }
            let that = this
            setTimeout(() => {
                that.setData({
                    list: [],
                    Path: []
                })
                that.loadInit()
            }, 1500)
        }
    },
    async addApi (path, shopId) {
        var res = await api({ header: {}, url: '/front/merchant/bake/banner/Add', method: 'post', data: { images: path, shopId: shopId, status: "1" } })
        if (res.ResultCode == 0) {
            return true
        }
        return false
    },
    async loadGoods () {
        var res = await api({ header: {}, url: '/front/merchant/bake/banner/associatedList?shopId=' + this.data.shopId, method: 'get' })
        if (res.ResultCode == 0) {
            let list = []
            if (res.Data != null && res.Data.Items != null && res.Data.Items.length > 0) {
                res.Data.Items.forEach((item) => {
                    if (item.images.indexOf('http') < 0) {
                        item.images = this.data.gv.img + item.images
                    }
                    item.IsChoose = false
                    list.push(item)
                })
            } else {
                wx.showToast({ title: '请先添加产品', icon: 'none' })
            }
            this.setData({
                total: res.Data.TotalRecordCount,
                goods: list
            })
        }
    },
    goodsHandle (e) {
        if (!this.data.isGoods) {
            if (this.data.Path != null && this.data.Path.length > 0) {
                wx.showToast({ title: '请先点击保存在设置产品链接', icon: 'none' })
                return
            }
            // 读取banner
            const { index } = e.currentTarget.dataset
            if (index >= 0) {
                let _model = this.data.list[index]
                let list = []
                if (_model && this.data.goods != null && this.data.goods.length > 0) {
                    this.data.goods.forEach((item) => {
                        item.IsChoose = _model.goodsId == item.pid
                        list.push(item)
                    })
                }
                this.setData({
                    model: _model,
                    goods: list
                })
            }
        }
        this.setData({
            isGoods: !this.data.isGoods
        })
    },
    chooseImte (e) {
        const { index } = e.currentTarget.dataset
        let list = this.data.goods
        list.forEach((item, _index) => {
            item.IsChoose = index == _index
        })
        this.setData({
            goods: list
        })
    },
    async bannerUpdate () {
        let goodsId = ''
        this.data.goods.forEach((item) => {
            if (item.IsChoose) {
                goodsId = item.pid
            }
        })
        if (!goodsId) {
            wx.showToast({ title: '请选择产品', icon: 'none' })
            return
        }
        let model = this.data.model
        model.goodsId = goodsId
        const res = await api({ header: {}, url: '/front/merchant/bake/banner/update', method: 'post', data: model })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            let that = this
            setTimeout(() => {
                that.setData({
                    list: [],
                    isGoods: false,
                    goods: [],
                    model: null
                })
                that.loadInit()
            }, 1500)
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    }
}
Page(pageObject)
