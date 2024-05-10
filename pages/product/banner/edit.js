import regeneratorRuntime from '../../../lib/runtime.js'
import { api } from '../../../lib/api.js'
const pageObject = {
    mixins: [require('../../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '新增轮播图',
        list: [],
        Path: '',
        isGoods: false,
        goods: [],
        model: null
    },
    onLoad () {

    },
    onShow () {
        this.loadGoods()
    },
    upload () {
        let that = this
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: function (res) {
                wx.showLoading({ title: '上传中', mask: true })
                wx.uploadFile({
                    url: that.data.gv.base + '/common/uploadNew',
                    filePath: res.tempFilePaths[0],
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
                                that.setData({
                                    Path: res1.fileName
                                })
                            }
                            wx.hideLoading()
                        }
                    }
                })
            }
        })
    },
    async submit () {
        wx.showLoading({ title: '保存中...', mask: true })
        if (!this.isnull(this.data.Path)) {
            wx.showToast({ title: '请上传轮播图', icon: 'none' })
            return
        }
        let chooseId = ''
        this.data.goods.forEach((item) => {
            if (item.IsChoose) {
                chooseId = item.pid
            }
        })
        if (!this.isnull(chooseId)) {
            wx.showToast({ title: '请选择产品', icon: 'none' })
            return
        }
        var res = await api({ header: {}, url: '/front/merchant/bake/banner/Add', method: 'post', data: { images: this.data.Path, goodsId: chooseId, shopId: this.data.shopId, status: "1" } })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            setTimeout(() => {
                wx.navigateBack({ delta: 1 })
            }, 1500)
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
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
