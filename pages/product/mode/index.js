import regeneratorRuntime from '../../../lib/runtime.js'
import {
  api
} from '../../../lib/api.js'
const pageObject = {
  mixins: [require('../../../mixin/themeChange.js')],
  data: {
    authCode: 'other',
    title: '分类管理',
    list: [],
    tempLen: 1,
    temp: []
  },
  onLoad() {

  },
  onShow() {
    this.loadInit()
  },
  async loadInit() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var res = await api({
      url: '/front/merchant/bake/categoriesMgr/getParentCategoriesByShopId',
      method: 'post',
      data: {
        shopId: this.data.shopId
      }
    })
    if (res.ResultCode == 0) {
      this.setData({
        list: res.Data.Items,
        temp: [{
          images: "",
          name: "",
          shopId: this.data.shopId,
          sort: null
        }]
      })
    }
    wx.hideLoading()
  },
  del(e) {
    const {
      index,
      pid
    } = e.currentTarget.dataset
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
  async delApi(index, pid) {
    wx.showLoading({
      title: '',
      mask: true
    })
    var res = await api({
      url: '/front/merchant/bake/categoriesMgr/BatchDelete',
      method: 'post',
      data: {
        ids: pid
      }
    })
    if (res.ResultCode == 0) {
      wx.showToast({
        title: res.ResultInfo
      })
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
      wx.showToast({
        title: res.ResultInfo,
        icon: 'none'
      })
    }
  },
  handleInput(e) {
    const {
      index
    } = e.currentTarget.dataset
    let list = this.data.list
    list[index].name = e.detail.value
    this.setData({
      list: list
    })
  },
  handleSort(e) {
    const {
      index
    } = e.currentTarget.dataset
    let list = this.data.list
    list[index].sort = e.detail.value
    this.setData({
      list: list
    })
  },
  handleInputs(e) {
    const {
      index,
      childindex
    } = e.currentTarget.dataset
    let list = this.data.list
    list[index].child[childindex].name = e.detail.value
    this.setData({
      list: list
    })
  },
  handleSorts(e) {
    const {
      index,
      childindex
    } = e.currentTarget.dataset
    let list = this.data.list
    list[index].child[childindex].sort = e.detail.value
    this.setData({
      list: list
    })
  },
  async confirmUpdate(e) {
    const {
      index,
      name
    } = e.currentTarget.dataset
    wx.showLoading({
      title: '',
      mask: true
    })
    let model = this.data.list[index]
    if (name == 'name') {
      if (!this.isnull(model.name)) {
        wx.showToast({
          title: '请输入分类名称',
          icon: 'none'
        })
        return
      }
      if (!this.isnull(model.images)) {
        wx.showToast({
          title: '请上传图片',
          icon: 'none'
        })
        return
      }
    }
    var res = await api({
      url: '/front/merchant/bake/categoriesMgr/update',
      method: 'post',
      data: {
        shopId: model.shopId,
        name: model.name,
        sort: model.sort,
        pid: model.pid
      }
    })
    if (res.ResultCode == 0) {
      wx.showToast({
        title: res.ResultInfo
      })
    } else {
      wx.showToast({
        title: res.ResultInfo,
        icon: 'none'
      })
    }
  },
  handleDecrease() {
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
  handleNumberse(e) {
    this.setData({
      tempLen: e.detail.value
    })
  },
  //点击添加对应的二级
  add(e) {
    let row = e.currentTarget.dataset
    let obj = {
      name: '',
      sort: null,
      shopId: this.data.shopId,
      images: '',
      parentId: row.pid
    }
    if (!this.data.list[row.index].child) this.data.list[row.index].child = []
    let arr = this.data.list[row.index].child;
    arr.push(obj)
    this.setData({
      [`list[${row.index}].child`]: arr
    })
  },
  //点击二级删除
  async delTwo(e) {
    let row = e.currentTarget.dataset
    let arr = this.data.list[row.index].child;
    if (!row.pid) {
      arr.splice(row.indexTwo, 1)
      this.setData({
        [`list[${row.index}].child`]: arr
      })
    } else {
      var res = await api({
        url: '/front/merchant/bake/categoriesMgr/BatchDelete',
        method: 'post',
        data: {
          ids: row.pid
        }
      })
      if (res.ResultCode != 0) return false
      arr.splice(row.indexTwo, 1)
      this.setData({
        [`list[${row.index}].child`]: arr
      })
    }

  },
  //点击一级分类
  async handleOne(e) {
    let row = e.currentTarget.dataset
    //获取当前的二级分类

    let arrChild = []
    if ((!this.data.list[row.index].child || this.data.list[row.index].child.length)) {
      var res = await api({
        url: '/front/merchant/bake/categoriesMgr/getCategoriesByParentId',
        method: 'post',
        data: {
          id: row.pid
        }
      })
      arrChild = res.Data.Items

      this.setData({

        [`list[${row.index}].child`]: arrChild
      })
    }
    if (this.data.list[row.index].boo) {
      this.setData({
        [`list[${row.index}].boo`]: false
      })
    } else {
      this.setData({
        [`list[${row.index}].boo`]: true
      })
    }

  },
  //上传图片
  upload(e) {
    let that = this
    const {
      index,
      type,
      childindex
    } = e.currentTarget.dataset
    wx.chooseImage({
      count: type == 1 ? 9 : 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        let list = that.data.list
        

        if (type == 1) {
          list[index].images = ''
        that.setData({
          list: list
        })
        } 




        res.tempFilePaths.forEach((src) => {
          wx.showLoading({
            title: '上传中...',
            mask: true
          })
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
                  //type=1一级分类、type=2二级分类


                  if (type == 1) {
                    let img = list[index].images
                    if (!img) list[index].images = res1.url
                    if (img) {
                      list[index].images = list[index].images + ',' + res1.url
                    }
                  } else {
                    let img = list[index].child[childindex].images
                    list[index].child[childindex].images = res1.url
                    // if(!img) list[index].child[childindex].images = res1.url
                    // if(img){
                    //   list[index].child[childindex].images = list[index].child[childindex].images+','+res1.url
                    // }
                  }

                  setTimeout(() => {
                    that.setData({
                      list: list
                    })
                  }, 500)
                }
                wx.hideLoading()
              }
            }
          })
        })


      }
    })
  },
  //模板的新增
  uploads(e) {
    let that = this
    const {
      index,
      type,
      childindex
    } = e.currentTarget.dataset
    wx.chooseImage({
      count: type == 1 ? 9 : 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        let list = that.data.temp
        list[index].images = ''
        that.setData({
          temp: list
        })
        res.tempFilePaths.forEach((src) => {
          wx.showLoading({
            title: '上传中...',
            mask: true
          })
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
                  //type=1一级分类、type=2二级分类


                  if (type == 1) {
                    let img = list[index].images
                    if (!img) list[index].images = res1.url
                    if (img) {
                      list[index].images = list[index].images + ',' + res1.url
                    }
                  } else {
                    let img = list[index].child[childindex].images
                    list[index].child[childindex].images = res1.url
                    // if(!img) list[index].child[childindex].images = res1.url
                    // if(img){
                    //   list[index].child[childindex].images = list[index].child[childindex].images+','+res1.url
                    // }
                  }

                  setTimeout(() => {
                    that.setData({
                      temp: list
                    })
                  }, 500)
                }
                wx.hideLoading()
              }
            }
          })
        })


      }
    })
  },
  confirmNumberse() {
    let list = []
    if (this.data.temp.length < this.data.tempLen) {
      for (let i = this.data.temp.length; i < this.data.tempLen; i++) {
        let model = {
          name: '',
          sort: null,
          images: '',
          shopId: this.data.shopId
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
  handleIncrease() {
    this.setData({
      tempLen: parseInt(this.data.tempLen) + 1
    })
    this.confirmNumberse()
  },
  handleInputTemp(e) {
    const {
      index
    } = e.currentTarget.dataset
    let list = this.data.temp
    list[index].name = e.detail.value
    this.setData({
      temp: list
    })
  },
  handleInputSort(e) {
    const {
      index
    } = e.currentTarget.dataset
    let list = this.data.temp
    list[index].sort = e.detail.value
    this.setData({
      temp: list
    })
  },
  delTemp(e) {
    if (parseInt(this.data.tempLen) > 0) {
      const {
        index
      } = e.currentTarget.dataset
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
  submit() {
    //一级分类处理
    if (this.data.temp.length > 0) {

      wx.showLoading({
        title: '保存中...',
        mask: true
      })
      for (let i = 0; i < this.data.temp.length; i++) {
        let item = this.data.temp[i]
        if (this.data.temp.length == 1) {
          if (!this.isnull(item.name) && !item.images) {

          } else {

            if (!this.isnull(item.name)) {
              wx.showToast({
                title: '请输入分类名称',
                icon: 'none'
              })
              return
            } else {
              if (!item.images) {
                wx.showToast({
                  title: '请上传' + item.name + '分类下的第' + (i + 1) + '行的图片',
                  icon: 'none'
                })

                this.setData({
                  list: this.data.list
                })
                return
              }
            }
          }
        }

      }
    }
    // if(this.data.temp.length==1&&((this.data.temp[0].images)||(this.data.temp[0].name))){
    //   this.setData({
    //     list: [...this.data.temp, ...this.data.list]
    //   })
    // }
    if (this.data.list != null && this.data.list.length > 0) {
      wx.showLoading({
        title: '保存中...',
        mask: true
      })
      let arr = []
      for (let i = 0; i < this.data.list.length; i++) {
        let item = this.data.list[i]
        if (!this.isnull(item.name)) {
          wx.showToast({
            title: '请输入分类名称',
            icon: 'none'
          })
          return
        } else {
          if (!this.isnull(item.images)) {
            wx.showToast({
              title: '请上传' + item.name + '分类下的第' + (i + 1) + '行的图片',
              icon: 'none'
            })
            this.setData({
              list: this.data.list
            })
            return
          }
          let imgArr = ''

          arr.push({
            name: item.name,
            sort: item.sort,
            images: item.images,
            pid: item.pid,
            shopId: this.data.shopId
          })
          if (item.child && item.child.length > 0) {
            for (let j = 0; j < item.child.length; j++) {
              let items = item.child[j]
              if (!this.isnull(items.name)) {
                wx.showToast({
                  title: '请输入' + item.name + '分类下的第' + (j + 1) + '行的名称',
                  icon: 'none'
                })
                return
              }
              if (!this.isnull(items.images)) {
                wx.showToast({
                  title: '请上传' + item.name + '分类下的第' + (j + 1) + '行的图片',
                  icon: 'none'
                })
                return
              }

              arr.push({
                name: items.name,
                sort: items.sort,
                images: items.images,
                parentId: item.pid,
                pid: items.pid,
                shopId: this.data.shopId
              })


            }
          }

        }
      }
      if (this.data.temp.length == 1) {
        if (this.isnull((this.data.temp[0].name)) && this.data.temp[0].images) {
          arr = [...this.data.temp, ...arr]
        }
      }


      if (this.addApi(arr)) {
        wx.showToast({
          title: '保存成功',
          mask: true
        })
      } else {
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        })
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
  async addApi(data) {
    var res = await api({
      url: '/front/merchant/bake/categoriesMgr/addAndUpdate',
      method: 'post',
      header: {
        'Content-Type': 'application/json'
      },
      data: data
    })
    if (res.ResultCode == 0) {
      return true
    }
    return false
  }
}
Page(pageObject)