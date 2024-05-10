import regeneratorRuntime from '../../lib/runtime.js'
import { api } from '../../lib/api.js'
const pageObject = {
    mixins: [require('../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '生日用户列表',
        pageindex: 1,
        pagesize: 10,
        total: 0,
        list: [],
        name: '',
        phone: ''
    },
    onLoad () {

    },
    onShow () {
        this.onPullDownRefresh()
    },
    async loadInit () {
        wx.showLoading({ title: '加载中', mask: true })
        var res = await api({ header: true, url: '/front/merchant/bake/birthdayReminder/UserList', data: { page: this.data.pageindex, limit: this.data.pagesize, name: this.data.name, phone: this.data.phone }, method: 'post' })
        if (res.ResultCode == 0) {
            this.setData({
                total: res.Data.TotalRecordCount,
                list: [...this.data.list, ...res.Data.Items]
            })
        }
        wx.stopPullDownRefresh()
        wx.hideLoading()
    },
    handleInputName(e){
        this.setData({
            name: e.detail.value
        })
    },
    handleInputPhone(e){
        this.setData({
            phone: e.detail.value
        })
    },
    handleSearch(){
        this.setData({
            pageindex: 1,
            total: 0,
            list: []
        })
        this.loadInit()
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
        wx.navigateTo({ url: 'edit' })
    },
    golist (e) {
        const { pid, uid } = e.currentTarget.dataset
        wx.navigateTo({ url: 'birthday?pid=' + pid + '&uid=' + uid })
    }
}
Page(pageObject)
