import regeneratorRuntime from '../../lib/runtime.js'
import { api } from '../../lib/api.js'
const pageObject = {
    mixins: [require('../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '添加生日提醒',
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
        birthdayOld: '',
        uid: ''
    },
    onLoad (param) {
        this.setData({
            uid: param.uid
        })
        this.loadInit()
        let pid = param.pid
        if (this.isnull(pid)) {
            this.setData({
                pid: pid,
                title: '编辑生日提醒'
            })
            wx.setNavigationBarTitle({ title: '编辑生日提醒' })
        } else {
            this.setData({
                title: '添加生日提醒'
            })
            wx.setNavigationBarTitle({ title: '添加生日提醒' })
        }
    },
    onShow () {
        this.loadDetail()
    },
    async loadDetail () {
        if (this.data.pid) {
            var res = await api({ url: '/front/merchant/bake/birthdayReminder/birthdayReminderInfoNew?pid=' + this.data.pid, method: 'get' })
            if (res.ResultCode == 0) {
                let type = 0
                this.data.range.forEach((item, index) => {
                    if (item.value == res.Data.type) {
                        type = index
                    }
                })
                let current = 0
                if (parseInt(res.Data.remindermethod) == 2) {
                    current = 1
                }
                this.setData({
                    birthday: res.Data.birthday,
                    message: res.Data.message,
                    relationship: res.Data.relationship,
                    type: type,
                    birthdayOld: res.Data.lunarcalendar,
                    remindermethod: parseInt(res.Data.remindermethod),
                    current: current
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
        if (this.data.remindermethod == 2 && this.data.birthday) {
            this.handleRY()
        }
    },
    bindDateChange (e) {
        this.setData({
            birthday: e.detail.value
        })
        if (this.data.remindermethod == 2) {
            this.handleRY()
        }
    },
    async handleRY () {
        const res = await api({ header: {}, url: '/front/merchant/bake/birthdayReminder/gregorianCalendarToLunarCalendar', method: 'post', data: { solar: this.data.birthday } })
        if (res.ResultCode == 0) {
            this.setData({
                birthdayOld: res.Data.lunarCalendar
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
    submit () {
        wx.showLoading({ title: '提交中', mask: true })
        if (!this.data.birthday) {
            wx.showToast({ title: '请选择生日', icon: 'none' })
            return
        }
        if (!this.isnull(this.data.relationship)) {
            wx.showToast({ title: '请输入关系', icon: 'none' })
            return
        }
        let model = {
            bbuid: this.data.uid,
            birthday: this.data.birthday,
            relationship: this.data.relationship,
            message: this.data.message,
            type: this.data.range[this.data.type].value,
            remindermethod: this.data.remindermethod,
            lunarcalendar: this.data.birthdayOld
        }
        if (this.data.pid) {
            model.pid = this.data.pid
            this.editApi(model)
        } else {
            this.addApi(model)
        }
    },
    async addApi (model) {
        var res = await api({ header: {}, url: '/front/merchant/bake/birthdayReminder/addReminder', method: 'post', data: model })
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
        var res = await api({ header: {}, url: '/front/merchant/bake/birthdayReminder/modifybirthdayReminder', method: 'post', data: model })
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
        var res = await api({ header: {}, url: '/front/merchant/bake/birthdayReminder/deleteReminder', method: 'post', data: [this.data.pid] })
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
