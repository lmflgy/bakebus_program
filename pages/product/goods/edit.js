import regeneratorRuntime from '../../../lib/runtime.js'
import { api } from '../../../lib/api.js'
const pageObject = {
    mixins: [require('../../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '新增产品',
        pid: '',
        photoList: [],
        model: {
            pid: '',
            goodsName: '',
            content: '',
            images: '',
            categoryId: '',
            goodsStatus: 1,
            mealIdS: null,
            mealFlag: 0,
            isWuliu: 0,
            isMore: 0,
            oldPrice: null,
            mealPrice: null,
            sort: null,
            weight: null,
            productSpecifications: [
                {
                    groupName: '',
                    price: null,
                    productSales: null,
                    sandwichId: '',
                    sandItem: '',
                    remark: '',
                    Num: 1,
                    sandwichList: [
                        { sandwichId: '', sandItem: '', price: null, warnFlag: 0 }
                    ]
                }
            ]
        },
        mode: [],
        typeChoose: [],
        typeTips: '',
        currentModeIndex: null,
        isSand: false,
        Num: 1,
        sand: [],
        currentSandIndex: 0,
        currentSandIndexSid: 0,
        status: [
            { value: 1, key: '上架' },
            { value: 2, key: '下架' }
        ],
        currentStatusIndex: 0,
        type: [
            { value: 0, key: '非套餐' },
            { value: 1, key: '套餐' }
        ],
        currentTypeIndex: 0,
        isThali: false,
        relGoods: [],
        relGoodsName: '',
        relSelGoods: [],
        isSelect: false,
        isOne: true,
        isType: false
    },
    onLoad (params) {
        const pid = params.pid
        if (this.isnull(pid)) {
            this.setData({
                pid: params.pid,
                title: '编辑产品'
            })
            wx.setNavigationBarTitle({ title: '编辑产品' })
        } else {
            this.setData({
                pid: params.pid,
                title: '新增产品'
            })
            wx.setNavigationBarTitle({ title: '新增产品' })
        }
        this.loadInit(params.shopId)
    },
    onShow () {

    },
    handleWeight (e) {
        let model = this.data.model
        model.weight = e.detail.value
        this.setData({
            model: model
        })
    },
    handlePrice (e) {
        let model = this.data.model
        model.oldPrice = e.detail.value
        this.setData({
            model: model
        })
    },
    handleMealPrice (e) {
        let model = this.data.model
        model.mealPrice = e.detail.value
        this.setData({
            model: model
        })
    },
    chooseType (e) {
        const { index } = e.currentTarget.dataset
        let list = this.data.mode
        
        list[index].IsChoose = !list[index].IsChoose
        this.setData({
            mode: list
        })
    },
    handleTypeOpen () {
        this.setData({
            isType: true
        })
    },
    handleTypeClose () {
        this.setData({
            isType: false
        })
    },
    confirmType () {
        let tips = ''
        let pids = ''
        this.data.mode.forEach((item) => {
            if (item.IsChoose) {
                if (tips) {
                    tips += '、'
                }
                tips += item.name
                if (pids) {
                    pids += ','
                }
                pids += item.pid
            }
        })
        let model = this.data.model
        model.categoryId = pids

        this.setData({
            typeTips: tips,
            model: model,
            isType: false
        })
    },
    handleMore (e) {
        let model = this.data.model
        model.isMore = e.detail.value ? 1 : 0
        this.setData({
            model: model
        })
    },
    handleSwitch (e) {
        let model = this.data.model
        model.isWuliu = e.detail.value ? 1 : 0
        this.setData({
            model: model
        })
    },
    async loadMode () {
        var res = await api({ url: '/front/merchant/bake/categoriesMgr/getCategoriesByParentId', method: 'post', data: { shopId: this.data.shopId } })
        
        if (res.ResultCode == 0) {
            let list = []
            res.Data.Items.forEach((item) => {
                item.IsChoose = false
                list.push(item)
            })
            this.setData({
                mode: list
            })
            return true
        }
        return false
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
    async loadInit (shopId) {
        wx.showLoading({ title: '加载中', mask: true })
        var resMode = await api({ url: '/front/merchant/bake/categoriesMgr/getCategoriesByParentId', method: 'post', data: { shopId: this.data.shopId?this.data.shopId:shopId } })
        
        if (resMode.ResultCode == 0) {
            this.setData({
                mode: resMode.Data.Items
            })
        }
        var resSand = await api({ url: '/front/merchant/bake/sandwichMgr/getSandwichsByShopId', method: 'post', data: { shopId: this.data.shopId } })
        if (resSand.ResultCode == 0) {
            let list = []
            if (resSand.Data.Items != null && resSand.Data.Items.length > 0) {
                resSand.Data.Items.forEach((item) => {
                    item.IsChoose = false
                    list.push(item)
                })
            }
            this.setData({
                sand: list
            })
        }
        var res = await api({ url: '/front/merchant/bake/goodsMgr/productDetails?pid=' + this.data.pid, method: 'get' })
        if (res.ResultCode == 0) {
            if (res.Data) {
                this.setData({
                    model: res.Data,
                    currentTypeIndex: res.Data.mealFlag
                })
                // 组装数据
                let model = res.Data
                if (model.goodsStatus == 2) {
                    this.setData({
                        currentStatusIndex: 1
                    })
                }
                if (model.isMore == null || model.isMore == '' || typeof model.isMore == 'undefined') {
                    model.isMore = 0
                }
                if (model.isMore == 1) {
                    this.setData({
                        Num: 0
                    })
                }
                if (model.mealFlag == 1) {
                    this.loadRelGoods()
                }
                if (model.categoryId) {
                    let _tips = ''
                    let _cate = model.categoryId.split(',')
                    let _mode = []
                    this.data.mode.forEach((item) => {
                        _cate.forEach((ct) => {
                            if (ct == item.pid) {
                                if (_tips) {
                                    _tips += '、'
                                }
                                _tips += item.name
                                item.IsChoose = true
                            }
                        })
                        _mode.push(item)
                    })
                    this.setData({
                        typeTips: _tips,
                        mode: _mode
                    })
                }
                if (model.imgUrls != null && model.imgUrls.length > 0) {
                    this.setData({
                        photoList: model.imgUrls
                    })
                } else {
                    this.setData({
                        photoList: [model.images]
                    })
                }
                if (model.productSpecifications != null && model.productSpecifications.length > 0) {
                    model.productSpecifications.forEach((item) => {
                        item.Num = item.sandwichList.length
                        if (item.sandwichList != null && item.sandwichList.length > 0) {
                            item.sandwichList.forEach((li) => {
                                this.data.sand.forEach((sand) => {
                                    if (li.sandwichId.indexOf(sand.pid) > -1) {
                                        li.sandItem = sand.sandwichName
                                    }
                                })
                            })
                        }
                    })
                    this.setData({
                        Num: model.productSpecifications.length,
                        model: model
                    })
                }
                wx.hideLoading()
            } else {
                wx.hideLoading()
            }
        } else {
            wx.hideLoading()
        }
    },
    handleInput (e) {
        let model = this.data.model
        model.goodsName = e.detail.value
        this.setData({
            model: model
        })
    },
    handleSort (e) {
        let model = this.data.model
        model.sort = e.detail.value
        this.setData({
            model: model
        })
    },
    handleContent (e) {
        let model = this.data.model
        model.content = e.detail.value
        this.setData({
            model: model
        })
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
    showPrev (e) {
        const { index } = e.currentTarget.dataset
        let current = this.data.gv.img + this.data.photoList[index]
        let urls = []
        this.data.photoList.forEach((src) => {
            urls.push(this.data.gv.img + src)
        })
        wx.previewImage({
            current: current,
            urls: urls,
            success: (result) => { },
            fail: () => { },
            complete: () => { }
        })
    },
    handleMode (e) {
        let model = this.data.model
        const index = e.detail.value
        model.categoryId = this.data.mode[index].pid
        this.setData({
            currentModeIndex: index,
            model: model
        })
    },
    handleType (e) {
        let model = this.data.model
        const index = e.detail.value
        model.mealFlag = this.data.type[index].value
        this.setData({
            currentTypeIndex: index,
            model: model
        })
    },
    handleSpecsDecrease (e) {
        const { index } = e.currentTarget.dataset
        let model = this.data.model
        if (model.productSpecifications != null && model.productSpecifications.length > 0) {
            if (model.productSpecifications[index].sandwichList != null && model.productSpecifications[index].sandwichList.length > 0) {
                model.productSpecifications[index].sandwichList.splice(model.productSpecifications[index].sandwichList.length - 1, 1)
            }
            model.productSpecifications[index].Num = parseInt(model.productSpecifications[index].Num) - 1
            this.setData({
                model: model
            })
        }
    },
    handleSpecsNumberse (e) {
        const { index } = e.currentTarget.dataset
        let model = this.data.model
        if (model.productSpecifications != null && model.productSpecifications.length > 0) {
            model.productSpecifications[index].Num = e.detail.value
            this.setData({
                model: model
            })
        }
    },
    confirmSpecsNumberse (e) {
        const { index } = e.currentTarget.dataset
        let list = []
        let model = this.data.model
        if (model.productSpecifications[index].sandwichList.length < model.productSpecifications[index].Num) {
            for (let i = model.productSpecifications.length; i < model.productSpecifications[index].Num; i++) {
                let item = {
                    sandwichId: '',
                    sandItem: '',
                    price: null,
                    warnFlag: 0
                }
                list.push(item)
            }
            model.productSpecifications[index].sandwichList = [...model.productSpecifications[index].sandwichList, ...list]
        } else {
            let list = []
            model.productSpecifications[index].sandwichList.forEach((item, index) => {
                if (index < model.productSpecifications[index].Num) {
                    list.push(item)
                }
            })
            model.productSpecifications[index].sandwichList = list
        }
        this.setData({
            model: model
        })
    },
    handleSpecsIncrease (e) {
        const { index } = e.currentTarget.dataset
        let model = this.data.model
        let item = {
            sandwichId: '',
            sandItem: '',
            price: null,
            warnFlag: 0
        }
        model.productSpecifications[index].sandwichList.push(item)
        model.productSpecifications[index].Num = parseInt(model.productSpecifications[index].Num) + 1
        this.setData({
            model: model
        })
    },
    handleChildSpecsInput (e) {
        const { index, sid, key } = e.currentTarget.dataset
        let model = this.data.model
        model.productSpecifications[index].sandwichList[sid][key] = e.detail.value
        this.setData({
            model: model
        })
    },
    handleChildSpecsSand (e) {
        const { index, sid } = e.currentTarget.dataset
        let model = this.data.model
        model.productSpecifications[index].sandwichList[sid].warnFlag = e.detail.value ? 1 : 0
        this.setData({
            model: model
        })
    },
    handleDecrease () {
        let model = this.data.model
        if (model.productSpecifications != null && model.productSpecifications.length > 0) {
            let list = []
            for (let i = 0; i < model.productSpecifications.length - 1; i++) {
                list.push(model.productSpecifications[i])
            }
            model.productSpecifications = list
            this.setData({
                Num: parseInt(this.data.Num) - 1,
                model: model
            })
        }
    },
    handleNumberse (e) {
        this.setData({
            Num: e.detail.value
        })
    },
    confirmNumberse () {
        let list = []
        let model = this.data.model
        if (model.productSpecifications.length < this.data.Num) {
            for (let i = model.productSpecifications.length; i < this.data.Num; i++) {
                let item = {
                    groupName: '',
                    price: null,
                    productSales: null,
                    sandwichId: '',
                    sandItem: '',
                    remark: '',
                    Num: 1,
                    sandwichList: [
                        {
                            sandwichId: '',
                            sandItem: '',
                            price: null,
                            warnFlag: 0
                        }
                    ]
                }
                list.push(item)
            }
            model.productSpecifications = [...model.productSpecifications, ...list]
        } else {
            let list = []
            model.productSpecifications.forEach((item, index) => {
                if (index < this.data.Num) {
                    list.push(item)
                }
            })
            model.productSpecifications = list
        }
        this.setData({
            model: model
        })
    },
    handleIncrease () {
        let model = this.data.model
        let item = {
            groupName: '',
            price: null,
            productSales: null,
            sandwichId: '',
            sandItem: '',
            remark: '',
            Num: 1,
            sandwichList: [
                {
                    sandwichId: '',
                    sandItem: '',
                    price: null,
                    warnFlag: 0
                }
            ]
        }
        model.productSpecifications.push(item)
        this.setData({
            Num: parseInt(this.data.Num) + 1,
            model: model
        })
    },
    handleChildInput (e) {
        const { index, key } = e.currentTarget.dataset
        let model = this.data.model
        model.productSpecifications[index][key] = e.detail.value
        this.setData({
            model: model
        })
    },
    delSpecs (e) {
        const { index } = e.currentTarget.dataset
        let model = this.data.model
        let list = []
        model.productSpecifications.forEach((item, _index) => {
            if (index != _index) {
                list.push(item)
            }
        })
        model.productSpecifications = list
        this.setData({
            Num: parseInt(this.data.Num) - 1,
            model: model
        })
    },
    delSpecsItem (e) {
        const { index, sid } = e.currentTarget.dataset
        let model = this.data.model
        let child = []
        model.productSpecifications[index].sandwichList.forEach((item, _sid) => {
            if (_sid != sid) {
                child.push(item)
            }
        })
        model.productSpecifications[index].sandwichList = child
        let num = 0
        if (child != null && child.length > 0) {
            num = child.length
        }
        model.productSpecifications[index].Num = num
        this.setData({
            model: model
        })
    },
    handleSand () {
        let list = []
        this.data.sand.forEach((item) => {
            item.IsChoose = false
            list.push(item)
        })
        this.setData({
            isSand: !this.data.isSand,
            sand: list
        })
    },
    openSand (e) {
        const { index, sid } = e.currentTarget.dataset
        let model = this.data.model
        if (model.productSpecifications[index].sandwichList[sid].sandwichId) {
            let temp = model.productSpecifications[index].sandwichList[sid].sandwichId.split(',')
            if (temp.length > 0) {
                let _sand = []
                this.data.sand.forEach((item) => {
                    for (let i = 0; i < temp.length; i++) {
                        if (item.pid == temp[i]) {
                            item.IsChoose = true
                            break
                        }
                    }
                    _sand.push(item)
                })
                this.setData({
                    sand: _sand
                })
            }
        }
        this.setData({
            isSand: true,
            currentSandIndex: index,
            currentSandIndexSid: sid
        })
    },
    chooseItem (e) {
        const { index } = e.currentTarget.dataset
        let list = this.data.sand
        list[index].IsChoose = !list[index].IsChoose
        this.setData({
            sand: list
        })
    },
    confirmSand () {
        let sandIds = ''
        let sandItem = ''
        let _sand = []
        this.data.sand.forEach((item) => {
            if (item.IsChoose) {
                if (sandIds) {
                    sandIds += ','
                    sandItem += ','
                }
                sandIds += item.pid
                sandItem += item.sandwichName
            }
            item.IsChoose = false
            _sand.push(item)
        })
        let model = this.data.model
        model.productSpecifications[this.data.currentSandIndex].sandwichList[this.data.currentSandIndexSid].sandItem = sandItem
        model.productSpecifications[this.data.currentSandIndex].sandwichList[this.data.currentSandIndexSid].sandwichId = sandIds
        this.setData({
            isSand: false,
            model: model,
            sand: _sand
        })
    },
    handleThali () {
        this.setData({
            isThali: !this.data.isThali
        })
        if (this.data.isThali) {
            this.loadRelGoods()
        }
    },
    returnfasle () {
        return false
    },
    confirmThali () {
        this.setData({
            isThali: false
        })
    },
    handleRelInput (e) {
        this.setData({
            relGoodsName: e.detail.value
        })
    },
    handleRelFocus () {
        this.setData({
            isSelect: false
        })
    },
    handleRelWrap () {
        this.setData({
            isSelect: false
        })
    },
    handleRelChoose (e) {
        const { index } = e.currentTarget.dataset

        // 获取已选中数量
        let relSelGoods = []

        // 数据处理
        let list = this.data.relGoods
        list[index].IsChoose = !list[index].IsChoose

        if (list[index].IsChoose) {
            // 选中
            relSelGoods.push(list[index])
            relSelGoods = [...relSelGoods, ...this.data.relSelGoods]
        } else {
            // 取消
            if (this.data.relSelGoods != null && this.data.relSelGoods.length > 0) {
                this.data.relSelGoods.forEach((item) => {
                    if (item.pid != list[index].pid) {
                        relSelGoods.push(item)
                    }
                })
            }
        }

        this.setData({
            isSelect: false,
            relGoods: list,
            relSelGoods: relSelGoods
        })
    },
    handleRelCancle (e) {
        const { index } = e.currentTarget.dataset
        let relSelGoods = this.data.relSelGoods

        let list = []
        if (this.data.relGoods != null && this.data.relGoods.length > 0) {
            this.data.relGoods.forEach((item) => {
                if (item.pid == this.data.relSelGoods[index].pid) {
                    item.IsChoose = false
                }
                list.push(item)
            })
        }

        relSelGoods.splice(index, 1)

        this.setData({
            relGoods: list,
            relSelGoods: relSelGoods
        })

        if (relSelGoods == null || relSelGoods.length < 1) {
            this.setData({
                isSelect: false
            })
        }
    },
    handleSelect () {
        this.setData({
            isSelect: !this.data.isSelect
        })
    },
    async loadRelGoods () {
        wx.showLoading({ title: '加载中', mask: true })
        var res = await api({ header: {}, url: '/front/merchant/bake/goodsMgr/getGoodsIsMoreList?shopId=' + this.data.shopId })
        if (res.ResultCode == 0) {
            let list = []
            let sel = []
            if (res.Data != null && res.Data.length > 0) {
                res.Data.forEach((item) => {
                    if (item.images.indexOf('http') < 0) {
                        item.images = this.data.gv.img + item.images
                    }
                    item.IsChoose = false
                    if (this.data.isOne) {
                        if (this.data.model.mealIdS != null && this.data.model.mealIdS.length > 0) {
                            if (this.data.model.mealIdS.find(d => d == item.pid)) {
                                item.IsChoose = true
                                sel.push(item)
                            }
                        }
                    } else {
                        // 判断是否存在已选中
                        if (this.data.relSelGoods != null && this.data.relSelGoods.length > 0) {
                            let exits = this.data.relSelGoods.find(d => d.pid == item.pid)
                            if (exits) {
                                item.IsChoose = true
                            }
                        }
                    }
                    list.push(item)
                })
            }
            if (this.data.isOne) {
                this.setData({
                    isOne: false,
                    relSelGoods: sel
                })
            }
            this.setData({
                relGoods: list
            })
        }
        wx.hideLoading()
    },
    handleStatus (e) {
        let model = this.data.model
        let index = e.detail.value
        model.goodsStatus = this.data.status[index].value
        this.setData({
            model: model,
            currentStatusIndex: index
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
