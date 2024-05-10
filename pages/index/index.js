import regeneratorRuntime from '../../lib/runtime.js'
import { api } from '../../lib/api.js'
const pageObject = {
    mixins: [require('../../mixin/themeChange.js')],
    data: {
        authCode: 'home',
        model: null,
        days: null,
        role: [],
        isorder: false,
        iscount: false,
        isbirthday: false,
        isvip: false,
        isproduct: false,
        isuser: false,
        isbhs: false,
        isshare: false,
        sharePath: '',
        isCode: false
    },
    onLoad () {

    },
    onShow () {
        let token = wx.getStorageSync(this.data.gv.token)
        let userId = wx.getStorageSync(this.data.gv.userid)
        let shopId = wx.getStorageSync(this.data.gv.shopid)
        if (this.isnull(token)) {
            this.setData({
                token: token,
                userId: userId,
                shopId: shopId
            })
            this.loadInit()
        } else {
            if (this.isnull(this.data.authCode)) {
                wx.navigateTo({ url: '/pages/login/index?code=' + this.data.authCode })
            }
        }
    },
    async loadInit () {
        wx.showLoading({ title: '加载中', mask: true })
        var res = await api({ url: '/front/merchant/bake/banner/shopInfo?shopId=' + this.data.shopId, method: 'get' })
        if (res.ResultCode == 0) {
            this.setData({
                model: res.Data
            })
        } else if (res.ResultCode == 401) {
            wx.navigateTo({ url: '/pages/login/index?code=' + this.data.authCode })
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
        var res1 = await api({ url: '/front/merchant/server/getTheRemainingDaysOfTheStore?shopId=' + this.data.shopId, method: 'get' })
        if (res1.ResultCode == 0) {
            this.setData({
                days: res1.Data.day
            })
        }
        var role = await api({ url: '/front/merchant/user/manage/getUserAuth', mthod: 'get' })
        if (role.ResultCode == 0) {
            let userId = wx.getStorageSync(this.data.gv.userid)
            if (this.data.model.userId != userId) {
                this.setData({
                    isorder: false,
                    iscount: false,
                    isbirthday: false,
                    isvip: false,
                    isproduct: false,
                    isuser: false,
                    isbhs: false,
                    isshare: false
                })
                if (role.Data != null) {
                    role.Data.forEach((item) => {
                        switch (item.id) {
                            case 1:
                                this.setData({ isorder: true })
                                break
                            case 2:
                                this.setData({ iscount: true })
                                break
                            case 3:
                                this.setData({ isbirthday: true })
                                break
                            case 4:
                                this.setData({ isvip: true })
                                break
                            case 5:
                                this.setData({ isproduct: true })
                                break
                            case 6:
                                this.setData({ isbhs: true })
                                break
                            case 7:
                                this.setData({ isshare: true })
                                break
                        }
                    })
                }
            } else {
                this.setData({
                    isorder: true,
                    iscount: true,
                    isbirthday: true,
                    isvip: true,
                    isproduct: true,
                    isuser: true,
                    isbhs: true,
                    isshare: true
                })
            }
        }
        wx.hideLoading()
    },
    async exit () {
        wx.showLoading({ title: '清除登录信息', mask: true })
        wx.removeStorageSync(this.data.gv.token)
        wx.removeStorageSync(this.data.gv.shopid)
        wx.removeStorageSync(this.data.gv.userid)
        await api({ url: '/front/merchant/login/signOut' })
        wx.showToast({ title: '退出成功' })
        setTimeout(() => {
            wx.navigateTo({ url: '/pages/login/index' })
        }, 1500)
    },
    close () {
        this.setData({
            isCode: false
        })
    },
    async share () {
        wx.showLoading({ title: '生成中', mask: true })
        ///const path = await api({ url: '/wx/getShareImg?pid=' + this.data.gv.userid })
        this.setData({
            //sharePath: path,
            isCode: true
        })
        wx.hideLoading()
    }
}
Page(pageObject)
