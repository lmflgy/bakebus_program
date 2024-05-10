import regeneratorRuntime from '../../lib/runtime.js'
import { api } from '../../lib/api.js'
const pageObject = {
    mixins: [require('../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        nav: [],
        initHeight: '',
        height: '',
        isUp: false,
        list: [],
        role: [
            { id: 1, title: '订单管理', children: [], sel: false },
            { id: 2, title: '数据统计', children: null, sel: false },
            { id: 3, title: '生日提醒', children: null, sel: false },
            { id: 4, title: 'VIP会员', children: null, sel: false },
            { id: 5, title: '产品管理', children: null, sel: false },
            { id: 6, title: '裱花师订单统计', children: null, sel: false },
            { id: 7, title: '生产分享二维码', children: null, sel: false }
        ],
        pid: '',
        oldRole: []
    },
    onLoad (param) {
        this.setData({
            pid: param.pid
        })
        let _role = param.role
        if (_role) {
            this.setData({
                oldRole: JSON.parse(_role)
            })
        }
    },
    onShow () {
        this.loadInit()
    },
    async loadInit () {
        wx.showLoading({ title: '加载中', mask: true })
        var res = await api({ url: '/front/merchant/bake/orderMgr/orderStatusList', method: 'get' })
        if (res.ResultCode == 0) {
            let role = this.data.role

            let child = []
            res.Data.forEach((item) => {
                let model = {
                    id: item.value,
                    title: item.key,
                    sel: false
                }
                child.push(model)
            })
            role[0].children = child

            // 查询绑定默认值
            if (this.data.oldRole != null && this.data.oldRole.length > 0) {
                role.forEach((item) => {
                    this.data.oldRole.forEach((ol) => {
                        if (ol.id == item.id) {
                            item.sel = true
                            if (ol.children != null && ol.children.length > 0) {
                                item.children.forEach((cl) => {
                                    ol.children.forEach((_cl) => {
                                        if (cl.id == _cl) {
                                            cl.sel = true
                                        }
                                    })
                                })
                            }
                        }
                    })
                })
            }

            this.setData({
                nav: res.Data,
                list: role,
                initHeight: 'height:' + (res.Data.length * 100) + 'rpx',
                height: 'height:' + (res.Data.length * 100) + 'rpx'
            })
        }
        var role = await api({ url: '/front/merchant/user/manage/getUserAuth', method: 'get' })
        console.log(role)
        wx.hideLoading()
    },
    chooseItem (e) {
        const { index } = e.currentTarget.dataset
        let list = this.data.list
        list[index].sel = !list[index].sel
        if (list[index].children != null && list[index].children.length > 0) {
            list[index].children.forEach((child) => {
                child.sel = list[index].sel
            })
        }
        this.setData({
            list: list
        })
    },
    chooseChild (e) {
        const { index, cid } = e.currentTarget.dataset
        let list = this.data.list
        list[index].sel = true
        list[index].children[cid].sel = !list[index].children[cid].sel
        this.setData({
            list: list
        })
    },
    handleUp () {
        let height = this.data.initHeight
        if (!this.data.isUp) {
            height = 'height:0'
        }
        this.setData({
            isUp: !this.data.isUp,
            height: height
        })
    },
    async submitRole () {
        let authList = []
        this.data.list.forEach((item) => {
            if (item.sel) {
                let model = {
                    id: item.id,
                    children: []
                }
                if (item.children != null && item.children.length > 0) {
                    item.children.forEach((child) => {
                        if (child.sel) {
                            model.children.push(child.id)
                        }
                    })
                }
                authList.push(model)
            }
        })
        if (authList == null || authList.length < 1) {
            wx.showToast({
                title: '请选择权限',
                icon: 'none'
            })
            return
        }
        wx.showLoading({
            title: '保存中',
            mask: true
        })
        const res = await api({ header: {}, url: '/front/merchant/user/manage/setUserAuth', method: 'post', data: { pid: this.data.pid, authList: authList } })
        if (res.ResultCode == 0) {
            wx.showToast({ title: '保存成功' })
            setTimeout(() => {
                wx.navigateBack({ delta: 1 })
            }, 1500)
        } else {
            wx.showToast({
                title: res.ResultInfo,
                icon: 'none'
            })
        }
    }
}
Page(pageObject)
