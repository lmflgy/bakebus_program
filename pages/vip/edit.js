import regeneratorRuntime from '../../lib/runtime.js'
import { api } from '../../lib/api.js'
const pageObject = {
    mixins: [require('../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '新增会员',
        vipId: '',
        name: '',
        phone: '',
        startTime: null,
        endTime: null,
        list: []
    },
    onLoad (param) {
        let vipId = param.vipId
        if (this.isnull(vipId)) {
            this.setData({
                vipId: vipId,
                title: '编辑会员'
            })
            wx.setNavigationBarTitle({ title: '编辑会员' })
            this.loadInit()
        } else {
            this.setData({
                title: '新增会员'
            })
            wx.setNavigationBarTitle({ title: '新增会员' })
            this.loadServer()
        }
    },
    onShow () {

    },
    async loadInit () {
        wx.showLoading({ title: '加载中', mask: true })
        var res = await api({ url: '/front/merchant/vip/vipInfoNew?pid=' + this.data.vipId, method: 'get' })
        if (res.ResultCode == 0) {
            this.setData({
                name: res.Data.vipName,
                phone: res.Data.phone,
                startTime: res.Data.startTime,
                endTime: res.Data.endTime,
                list: res.Data.serverVoList
            })
        }
        wx.hideLoading()
    },
    async loadServer () {
        var res = await api({ url: '/front/merchant/vip/serviceList', method: 'get' })
        if (res.ResultCode == 0) {
            this.setData({
                list: res.Data
            })
        }
    },
    handleInput (e) {
        const { index } = e.currentTarget.dataset
        let list = this.data.list
        list[index].num = e.detail.value
        this.setData({
            list: list
        })
    },
    handleName (e) {
        this.setData({
            name: e.detail.value
        })
    },
    handlePhone (e) {
        this.setData({
            phone: e.detail.value
        })
    },
    bindSDateChange (e) {
        this.setData({
            startTime: e.detail.value
        })
    },
    bindEDateChange (e) {
        this.setData({
            endTime: e.detail.value
        })
    },
    submit () {
        wx.showLoading({ title: '提交中', mask: true })
        if (!this.isnull(this.data.name)) {
            wx.showToast({ title: '请输入会员名称', icon: 'none' })
            return
        }
        if (!this.isnull(this.data.phone) || this.data.phone.length != 11) {
            wx.showToast({ title: '手机号不正确', icon: 'none' })
            return
        }
        if (!this.data.startTime) {
            wx.showToast({ title: '请选择开始时间', icon: 'none' })
            return
        }
        if (!this.data.endTime) {
            wx.showToast({ title: '请选择到期时间', icon: 'none' })
            return
        }
        let model = {
            name: this.data.name,
            phone: this.data.phone,
            startTime: this.data.startTime,
            endTime: this.data.endTime,
            shopId: this.data.shopId
        }
        if (this.data.vipId) {
            model.pid = this.data.vipId
            this.editApi(model)
        } else {
            let list = []
            this.data.list.forEach((item) => {
                let dto = {
                    num: parseInt(item.num),
                    pid: item.pid
                }
                list.push(dto)
            })
            model.addServiceLists = list
            this.addApi(model)
        }
    },
    async addApi (model) {
        var res = await api({ header: {}, url: '/front/merchant/vip/addVip', method: 'post', data: model })
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
        var res = await api({ header: {}, url: '/front/merchant/vip/updateVip', method: 'post', data: model })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            this.data.list.forEach((item) => {
                if (item.num > 0) {
                    this.editServerApi(item.num, item.pid)
                }
            })
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
            content: '确定删除会员吗？',
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
        var res = await api({ header: {}, url: '/front/merchant/vip/deleteVip', method: 'post', data: [this.data.vipId] })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            setTimeout(() => {
                wx.navigateBack({ delta: 1 })
            }, 1500)
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    },
    async editServerApi (num, pid) {
        await api({ header: {}, url: '/front/merchant/vip/modifyNum', method: 'post', data: { num: num, pid: pid } })
    }
}
Page(pageObject)
