import regeneratorRuntime from '../../lib/runtime.js'
import { api } from '../../lib/api.js'
const pageObject = {
    mixins: [require('../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '新增服务',
        serverId: '',
        serverName: '',
        num: 0,
        Photo: ''
    },
    onLoad (param) {
        this.setData({
            title: '新增服务'
        })
        let serverId = param.serverId
        if (this.isnull(serverId)) {
            this.setData({
                serverId: serverId,
                title: '编辑服务'
            })
            wx.setNavigationBarTitle({ title: '编辑服务' })
            this.loadInit()
        } else {
            wx.setNavigationBarTitle({ title: '新增服务' })
        }
    },
    onShow () {

    },
    async loadInit () {
        wx.showLoading({ title: '加载中', mask: true })
        var res = await api({ url: '/front/merchant/server/severInfo?serverId=' + this.data.serverId })
        if (res.ResultCode == 0) {
            this.setData({
                serverName: res.Data.serverName,
                num: res.Data.num,
                Photo: res.Data.icon
            })
        }
        wx.hideLoading()
    },
    handleInput (e) {
        const { key } = e.currentTarget.dataset
        this.setData({
            [key]: e.detail.value
        })
    },
    handleName (e) {
        this.setData({
            serverName: e.detail.value
        })
    },
    handleNum (e) {
        this.setData({
            num: e.detail.value
        })
    },
    upload () {
        let that = this
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: function (res) {
                res.tempFilePaths.forEach((src) => {
                    wx.showLoading({ title: '上传中...', mask: true })
                    wx.uploadFile({
                        url: that.data.gv.base + '/common/uploadNew',
                        filePath: src,
                        name: 'file',
                        header: {
                            "Content-Type": "multipart/form-data",
                            "chartset": "utf-8"
                        },
                        success: (result) => {
                            if (result.statusCode == 200) {
                                let res1 = JSON.parse(result.data)
                                if (res1.ResultCode == 0) {
                                    that.setData({
                                        Photo: res1.fileName
                                    })
                                }
                                wx.hideLoading()
                            }
                        }
                    })
                })
            }
        })
    },
    submit () {
        wx.showLoading({ title: '提交中', mask: true })
        if (!this.isnull(this.data.serverName)) {
            wx.showToast({ title: '请输入服务名称', icon: 'none' })
            return
        }
        if (!this.data.Photo) {
            wx.showToast({ title: '请上传服务图片', icon: 'none' })
            return
        }
        let model = {
            serverName: this.data.serverName,
            icon: this.data.Photo
        }
        if (this.isnull(this.data.serverId)) {
            model.pid = this.data.serverId
            this.editApi(model)
        } else {
            this.addApi(model)
        }
    },
    async addApi (model) {
        var res = await api({ header: {}, url: '/front/merchant/server/addServer', method: 'post', data: model })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            setTimeout(() => {
                wx.navigateBack({ delta: 1 })
            }, 1500)
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    },
    async editApi (model) {
        var res = await api({ header: {}, url: '/front/merchant/server/editsever', method: 'post', data: model })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            setTimeout(() => {
                wx.navigateBack({ delta: 1 })
            }, 1500)
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    },
    del () {
        let that = this
        wx.showModal({
            title: '提示',
            content: '确定删除服务吗？',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#666666',
            confirmText: '确定',
            confirmColor: '#000000',
            success: (result) => {
                if (result.confirm) {
                    that.delApi()
                }
            }
        })
    },
    async delApi () {
        wx.showLoading({ title: '', mask: true })
        var res = await api({ header: {}, url: '/front/merchant/server/deletesever', method: 'post', data: [this.data.serverId] })
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
