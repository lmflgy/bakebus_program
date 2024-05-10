import regeneratorRuntime from '../../lib/runtime.js'
import { api } from '../../lib/api.js'
const pageObject = {
    mixins: [require('../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '添加提醒',
        pid: '',
        maxDate: null,
        name: '',
        phone: '',
        birthday: null,
        message: '',
        relationship: '',
        type: 0,
        range: [],
        remindermethod: 1,
        current: 0,
        mode: [{ key: '公历', value: 1 }, { key: '农历', value: 2 }],
        birthdayOld: ''
    },
    onLoad (param) {
        this.loadInit()
        let pid = param.pid
        if (this.isnull(pid)) {
            this.setData({
                pid: pid,
                title: '编辑用户'
            })
            wx.setNavigationBarTitle({ title: '编辑用户' })
        } else {
            this.setData({
                title: '添加用户'
            })
            wx.setNavigationBarTitle({ title: '添加用户' })
        }
    },
    onShow () {
        this.loadDetail()
    },
    async loadDetail () {
        if (this.data.pid) {
            var res = await api({ url: '/front/merchant/bake/birthdayReminder/AddUserInfo?pid=' + this.data.pid, method: 'get' })
            if (res.ResultCode == 0) {
                this.setData({
                    name: res.Data.name,
                    phone: res.Data.phone
                })
            }
        }
    },
    async loadInit () {
        wx.showLoading({ title: '加载中', mask: true })
        var res = await api({ url: '/front/merchant/bake/birthdayReminder/reminderTime', method: 'get' })
        if (res.ResultCode == 0) {
            this.setData({
                range: res.Data
            })
        }
        let date = new Date()
        this.setData({
            maxDate: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
        })
        wx.hideLoading()
    },
    bindModeChange (e) {
        this.setData({
            current: e.detail.value,
            remindermethod: this.data.mode[e.detail.value].value
        })
    },
    bindDateChange (e) {
        this.setData({
            birthday: e.detail.value
        })
        if (this.data.remindermethod == 2) {
            api({ header: {}, url: '/front/merchant/bake/birthdayReminder/gregorianCalendarToLunarCalendar', method: 'post', data: { solar: this.data.birthday } }).then((res) => {
                if (res.ResultCode == 0) {
                    this.setData({
                        birthdayOld: res.Data.lunarCalendar
                    })
                }
            })
        }
    },
    bindTypeChange (e) {
        this.setData({
            type: e.detail.value
        })
    },
    handleInput (e) {
        const { key } = e.currentTarget.dataset
        if (key == 'name') {
            this.setData({
                name: e.detail.value
            })
        } else if (key == 'phone') {
            this.setData({
                phone: e.detail.value
            })
        } else {
            this.setData({
                message: e.detail.value
            })
        }
    },
    handleName (e) {
        this.setData({
            name: e.detail.value
        })
    },
    handleRelationship (e) {
        this.setData({
            relationship: e.detail.value
        })
    },
    handlePhone (e) {
        this.setData({
            phone: e.detail.value
        })
    },
    handleMsg (e) {
        this.setData({
            message: e.detail.value
        })
    },
    submitUser(){
        wx.showLoading({ title: '提交中', mask: true })
        if (!this.isnull(this.data.name)) {
            wx.showToast({ title: '请输入姓名及微信号', icon: 'none' })
            return
        }
        if (!this.isnull(this.data.phone) || this.data.phone.length != 11) {
            wx.showToast({ title: '手机号不正确', icon: 'none' })
            return
        }
        let model = {
            name: this.data.name,
            phone: this.data.phone
        }
        if (this.data.pid) {
            model.pid = this.data.pid
            this.editUserApi(model)
        } else {
            this.addUserApi(model)
        }
    },
    async addUserApi (model) {
        var res = await api({ header: {}, url: '/front/merchant/bake/birthdayReminder/AddUser', method: 'post', data: model })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            setTimeout(() => {
                wx.navigateBack({ delta: 1 })
            }, 1500)
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    },
    async editUserApi (model) {
        var res = await api({ header: {}, url: '/front/merchant/bake/birthdayReminder/modifyBirthdayReminderUser', method: 'post', data: model })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            setTimeout(() => {
                wx.navigateBack({ delta: 1 })
            }, 1500)
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    },
    submit () {
        wx.showLoading({ title: '提交中', mask: true })
        if (!this.isnull(this.data.name)) {
            wx.showToast({ title: '请输入姓名及微信号', icon: 'none' })
            return
        }
        if (!this.isnull(this.data.phone) || this.data.phone.length != 11) {
            wx.showToast({ title: '手机号不正确', icon: 'none' })
            return
        }
        if (!this.data.birthday) {
            wx.showToast({ title: '请选择生日', icon: 'none' })
            return
        }
        if (!this.isnull(this.data.relationship)) {
            wx.showToast({ title: '请输入关系', icon: 'none' })
            return
        }
        let model = {
            name: this.data.name,
            phone: this.data.phone,
            birthday: this.data.birthday,
            relationship: this.data.relationship,
            message: this.data.message,
            type: this.data.range[this.data.type].value,
            remindermethod: this.data.remindermethod,
            lunarcalendar: this.data.birthdayOld,
            shopId: this.data.shopId
        }
        if (this.data.pid) {
            model.pid = this.data.pid
            this.editApi(model)
        } else {
            this.addApi(model)
        }
    },
    async addApi (model) {
        var res = await api({ header: {}, url: '/front/merchant/bake/birthdayReminder/Add', method: 'post', data: model })
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
        var res = await api({ header: {}, url: '/front/merchant/bake/birthdayReminder/updatebirthdayReminder', method: 'post', data: model })
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
            content: '确定删除提醒吗？',
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
        var res = await api({ header: {}, url: '/front/merchant/bake/birthdayReminder/deleteBirthdayReminderUser', method: 'post', data: [this.data.pid] })
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
