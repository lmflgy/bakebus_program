import regeneratorRuntime from '../../../lib/runtime.js'
import { api } from '../../../lib/api.js'
const pageObject = {
    mixins: [require('../../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '夹心管理',
        list: [],
        tempLen: 1,
        temp: []
    },
    onLoad () {

    },
    onShow () {
        this.loadInit()
    },
    async loadInit () {
        wx.showLoading({ title: '加载中', mask: true })
        var res = await api({ url: '/front/merchant/bake/sandwichMgr/getSandwichsByShopId', method: 'post', data: { shopId: this.data.shopId } })
        if (res.ResultCode == 0) {
            this.setData({
                list: res.Data.Items,
                temp: [{ name: '', shopId: this.data.shopId }]
            })
        }
        wx.hideLoading()
    },
    del (e) {
        const { index, pid } = e.currentTarget.dataset
        let that = this
        wx.showModal({
            title: '提示',
            content: '确定删除吗？',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#666666',
            confirmText: '确定',
            confirmColor: '#333333',
            success: (result) => {
                if (result.confirm) {
                    that.delApi(index, pid)
                }
            }
        })
    },
    async delApi (index, pid) {
        wx.showLoading({ title: '', mask: true })
        var res = await api({ url: '/front/merchant/bake/sandwichMgr/BatchDelete', method: 'post', data: { ids: pid } })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
            let list = []
            this.data.list.forEach((item, _index) => {
                if (index != _index) {
                    list.push(item)
                }
            })
            this.setData({
                list: list
            })
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    },
    handleInput (e) {
        const { index } = e.currentTarget.dataset
        let list = this.data.list
        list[index].sandwichName = e.detail.value
        this.setData({
            list: list
        })
    },
    //标签名称
    handleInputs (e) {
      const { index } = e.currentTarget.dataset
      let list = this.data.list
      list[index].tag = e.detail.value
    
      this.setData({
          list: list
      })
  },
    async confirmUpdate (e) {
        const { index } = e.currentTarget.dataset
        wx.showLoading({ title: '', mask: true })
        let model = this.data.list[index]
        if (!this.isnull(model.sandwichName)) {
            wx.showToast({ title: '请输入夹心名称', icon: 'none' })
            return
        }
        var res = await api({ header: {}, url: '/front/merchant/bake/sandwichMgr/update', method: 'post', data: {tag: model.tag,shopId: model.shopId, sandwichName: model.sandwichName, pid: model.pid } })
        if (res.ResultCode == 0) {
            wx.showToast({ title: res.ResultInfo })
        } else {
            wx.showToast({ title: res.ResultInfo, icon: 'none' })
        }
    },
    handleDecrease () {
        if (parseInt(this.data.tempLen) > 0) {
            let list = []
            for (let i = 0; i < this.data.temp.length - 1; i++) {
                list.push(this.data.temp[i])
            }
            this.setData({
                tempLen: parseInt(this.data.tempLen) - 1,
                temp: list
            })
        }
    },
    handleNumberse (e) {
        this.setData({
            tempLen: e.detail.value
        })
    },
    confirmNumberse () {
        let list = []
        if (this.data.temp.length < this.data.tempLen) {
            for (let i = this.data.temp.length; i < this.data.tempLen; i++) {
                let model = {
                    name: '',
                    shopId: this.data.shopId,
                    tag:''
                }
                list.push(model)
            }
            this.setData({
                temp: [...this.data.temp, ...list]
            })
        } else {
            let list = []
            this.data.temp.forEach((item, index) => {
                if (index < this.data.tempLen) {
                    list.push(item)
                }
            })
            this.setData({
                temp: list
            })
        }
    },
    handleIncrease () {
        this.setData({
            tempLen: parseInt(this.data.tempLen) + 1
        })
        this.confirmNumberse()
    },
    handleInputTemp (e) {
        const { index } = e.currentTarget.dataset
        let list = this.data.temp
        list[index].name = e.detail.value
        this.setData({
            temp: list
        })
    },
    handleInputTemps (e) {
      const { index } = e.currentTarget.dataset
      let list = this.data.temp
      list[index].tag = e.detail.value
      this.setData({
          temp: list
      })
  },
    delTemp (e) {
        if (parseInt(this.data.tempLen) > 0) {
            const { index } = e.currentTarget.dataset
            let list = []
            this.data.temp.forEach((item, _index) => {
                if (index != _index) {
                    list.push(item)
                }
            })
            this.setData({
                temp: list,
                tempLen: parseInt(this.data.tempLen) - 1
            })
        }
    },
    submit () {
        if (this.data.temp != null && this.data.temp.length > 0) {
          debugger
            wx.showLoading({ title: '保存中...', mask: true })
            for (let i = 0; i < this.data.temp.length; i++) {
                let item = this.data.temp[i]
                if (!this.isnull(item.name)) {
                    wx.showToast({ title: '请输入夹心名称', icon: 'none' })
                    return
                }
            }
            let count = 0
            this.data.temp.forEach((item) => {
                if (this.addApi(item.name, item.tag, item.shopId)) {
                    count++
                }
            })
            if (count > 0) {
                if (this.data.temp.length == count) {
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
                    tempLen: 1,
                    temp: []
                })
                that.loadInit()
            }, 1500)
        }
    },
    async addApi (name,tag, shopId) {
        var res = await api({ header: {}, url: '/front/merchant/bake/sandwichMgr/Add', method: 'post', data: { sandwichName: name,tag:tag, shopId: shopId } })
        if (res.ResultCode == 0) {
            return true
        }
        return false
    }
}
Page(pageObject)
