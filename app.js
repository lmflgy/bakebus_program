require('/lib/mixins.js')

const appObject = {
    onLaunch (obj) {
        this.updateApp()
    },
    onShow (obj) {

    },
    onHide () {

    },
    onError (msg) {

    },
    onPageNotFound (obj) {
        wx.redirectTo({
            url: 'pages/index/index'
        })
    },
    updateApp () {
        const updateManager = wx.getUpdateManager()
        updateManager.onCheckForUpdate((res) => {
            if (res.hasUpdate) {
                updateManager.onUpdateReady(() => {
                    wx.showModal({
                        title: '更新提示',
                        content: '检查到新版本，是否下载新版本并重启小程序？',
                        success: (res) => {
                            if (res.confirm) {
                                updateManager.applyUpdate()
                            } else if (res.cancel) {
                                wx.showModal({
                                    title: '温馨提示',
                                    content: '必须要更新哦，旧版本将无法正常使用',
                                    showCancel: false,
                                    confirmText: '确定更新',
                                    success: (res) => {
                                        if (res.confirm) {
                                            updateManager.applyUpdate()
                                        }
                                    }
                                })
                            }
                        }
                    })
                })
            }
        })
    }
}
App(appObject)
