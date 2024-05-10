import regeneratorRuntime from '../../lib/runtime.js'
import { api } from '../../lib/api.js'
const pageObject = {
    mixins: [require('../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '生日提醒列表',
        pageindex: 1,
        pagesize: 10,
        total: 0,
        list: [],
        pid: '',
        uid: ''
    },
    onLoad (param) {
        this.setData({
            pid: param.pid,
            uid: param.uid
        })
    },
    onShow () {
        this.onPullDownRefresh()
    },
    async loadInit () {
        wx.showLoading({ title: '加载中', mask: true })
        var res = await api({ header: true, url: '/front/merchant/bake/birthdayReminder/BirthdayRemindersById', data: { page: this.data.pageindex, limit: this.data.pagesize, pid: this.data.pid }, method: 'post' })
        if (res.ResultCode == 0) {
            this.setData({
                total: res.Data.TotalRecordCount,
                list: [...this.data.list, ...res.Data.Items]
            })
        }
        wx.stopPullDownRefresh()
        wx.hideLoading()
    },
    onPullDownRefresh () {
        this.setData({
            pageindex: 1,
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
    edit () {
        wx.navigateTo({ url: 'update?uid=' + this.data.pid })
    },
    golist (e) {
        const { pid, uid } = e.currentTarget.dataset
        wx.navigateTo({ url: 'birthday?pid=' + pid + '&uid=' + uid })
    }
}
Page(pageObject)
