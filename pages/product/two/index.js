import regeneratorRuntime from '../../../lib/runtime.js'
import { api } from '../../../lib/api.js'
const pageObject = {
    mixins: [require('../../../mixin/themeChange.js')],
    data: {
        pid:'',
        title: '新增二级分类',
        photoList:[],
        currentModeIndex:'',
        model:{}
    },
    onLoad (params) {
        
        this.loadInit()
    },
    onShow () {

    },

    async loadSand () {
        var res = await api({ url: '/front/merchant/bake/sandwichMgr/getSandwichsByShopId', method: 'post', data: { shopId: this.data.shopId } })
        if (res.ResultCode == 0) {
            let list = []
            if (res.Data.Items != null && res.Data.Items.length > 0) {
                res.Data.Items.forEach((item) => {
                    item.IsChoose = false
                    list.push(item)
                })
            }
            this.setData({
                sand: list
            })
            return true
        }
        return false
    },
    async loadInit () {
        wx.showLoading({ title: '加载中', mask: true })
        var resMode = await api({ url: '/front/merchant/bake/categoriesMgr/getCategoriesByShopId', method: 'post', data: { shopId: this.data.shopId } })
        if (resMode.ResultCode == 0) {
            this.setData({
                mode: resMode.Data.Items
            })
        }
        wx.hideLoading()
    },
   
    
    upload () {
        let that = this
        wx.chooseImage({
            count: 9,
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
                                    let list = that.data.photoList
                                    list.push(res1.fileName)
                                    that.setData({
                                        photoList: list
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
    delPhoto (e) { 
        const { index } = e.currentTarget.dataset
        let list = []
        this.data.photoList.forEach((item, i) => {
            if (index != i) {
                list.push(item)
            }
        })
        this.setData({
            photoList: list
        })
    },
    //选择了分类
    handleMode (e) {
      let model = this.data.model
      const index = e.detail.value
      model.categoryId = this.data.mode[index].pid
      this.setData({
          currentModeIndex: index,
          model: model
      })
  },

 
    async submit () {
        wx.showLoading({ title: '保存中', mask: true })
        let imgs = ''
        if (!this.isnull(this.data.model.goodsName)) {
            wx.showToast({ title: '请输入产品标题', icon: 'none' })
            return
        }
        if (!this.isnull(this.data.model.content)) {
            wx.showToast({ title: '请输入产品详情', icon: 'none' })
            return
        }
        if (this.data.photoList != null && this.data.photoList.length > 0) {
            imgs = this.data.photoList.toString()
        } else {
            wx.showToast({ title: '请上传产品图片', icon: 'none' })
            return
        }
        if (!this.isnull(this.data.model.categoryId)) {
            wx.showToast({ title: '请选择产品分类', icon: 'none' })
            return
        }
        if (this.data.model.mealFlag == 1) {
            if (this.data.relSelGoods == null || this.data.relSelGoods.length < 1) {
                wx.showToast({ title: '请选择套餐关联商品', icon: 'none' })
                return
            }
            let ids = []
            this.data.relSelGoods.forEach((it) => {
                ids.push(it.pid)
            })
            this.data.model.mealIdS = ids
        }
        if (this.data.model.isMore == 0) {
            if (this.data.model.productSpecifications == null || this.data.model.productSpecifications.length < 1) {
                wx.showToast({ title: '请至少上传一种规格', icon: 'none' })
                return
            }
            let err = 0
            for (let i = 0; i < this.data.model.productSpecifications.length; i++) {
                let item = this.data.model.productSpecifications[i]
                if (!this.isnull(item.groupName)) {
                    err++
                    wx.showToast({ title: '请输入规格名称', icon: 'none' })
                    return
                }
                if (this.data.model.productSpecifications[i].sandwichList == null || this.data.model.productSpecifications[i].sandwichList.length < 1) {
                    err++
                    wx.showToast({ title: item.groupName + '至少选择一个夹心', icon: 'none' })
                    return
                } else {
                    let _sand = []
                    for (let j = 0; j < this.data.model.productSpecifications[i].sandwichList.length; j++) {
                        let child = this.data.model.productSpecifications[i].sandwichList[j]
                        if (item.price) {
                            if (parseFloat(item.price) > parseFloat(child.price)) {
                                item.price = child.price
                            }
                        } else {
                            item.price = child.price
                        }
                        if (!this.isnull(child.sandwichId)) {
                            err++
                            wx.showToast({ title: item.groupName + '至少选择一个夹心', icon: 'none' })
                            return
                        }
                        if (!this.isnull(child.price)) {
                            err++
                            wx.showToast({ title: item.groupName + '输入价格', icon: 'none' })
                            return
                        }
                        if (_sand.indexOf(child.sandwichId) > -1) {
                            err++
                            wx.showToast({ title: child.sandItem + '重复了', icon: 'none' })
                            return
                        }
                        _sand.push(child.sandwichId)
                    }
                    // 判断是否有重复
                    //item.sandwichList = JSON.toString(_sand)
                }
                if (!this.isnull(item.remark)) {
                    err++
                    wx.showToast({ title: '请输入几人吃', icon: 'none' })
                    return
                }
                if (!this.isnull(item.productSales)) {
                    err++
                    wx.showToast({ title: '请输入销量', icon: 'none' })
                    return
                }
            }
            if (err > 0) {
                wx.showToast({ title: '规格不正确', icon: 'none' })
                return
            }
        } else {
            if (this.data.model.isWuliu == 1) {
                if (!this.isnull(this.data.model.weight)) {
                    wx.showToast({ title: '请输入产品重量', icon: 'none' })
                    return
                }
            }
            if (!this.isnull(this.data.model.oldPrice)) {
                wx.showToast({ title: '请输入产品价格', icon: 'none' })
                return
            }
            if (!this.isnull(this.data.model.mealPrice)) {
                wx.showToast({ title: '请输入产品套餐价格', icon: 'none' })
                return
            }
        }
        let model = this.data.model
        model.shopId = this.data.shopId
        model.images = imgs
        if (this.data.model.isMore == 1) {
            model.productSpecifications = null
        }
        let url = '/front/merchant/bake/goodsMgr/Add'
        if (this.isnull(this.data.pid)) {
            url = '/front/merchant/bake/goodsMgr/editGoods'
        }
        var res = await api({ header: {}, url: url, method: 'post', data: model })
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
