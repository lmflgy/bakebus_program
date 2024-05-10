/**
 * promise 形式 getSystemInfo
 */
export const getSystemInfo = () => {
    return new Promise((resolve, reject) => {
        wx.getSystemInfo({
            success: (res) => {
                resolve(res)
            },
            fail: (err) => {
                reject(err)
            }
        })
    })
}
/**
 * promise 形式 getSetting
 */
export const getSetting = () => {
    return new Promise((resolve, reject) => {
        wx.getSetting({
            success: (res) => {
                resolve(res)
            },
            fail: (err) => {
                reject(err)
            }
        })
    })
}
/**
 * promise 形式 chooseAddress
 */
export const chooseAddress = () => {
    return new Promise((resolve, reject) => {
        wx.chooseAddress({
            success: (res) => {
                resolve(res)
            },
            fail: (err) => {
                reject(err)
            }
        })
    })
}
/**
 * promise 形式 openSetting
 */
export const openSetting = () => {
    return new Promise((resolve, reject) => {
        wx.openSetting({
            success: (res) => {
                resolve(res)
            },
            fail: (err) => {
                reject(err)
            }
        })
    })
}

/**
 * promise 形式 login
 */
export const wxlogin = () => {
    return new Promise((resolve, reject) => {
        wx.login({
            timeout: 10000,
            success: (res) => {
                resolve(res)
            },
            fail: (err) => {
                reject(err)
            }
        })
    })
}

/**
 * promise 形式 getUserInfo
 */
export const getUserInfo = () => {
    return new Promise((resolve, reject) => {
        wx.getUserInfo({
            lang: 'zh_CN',
            timeout: 10000,
            success: (res) => {
                resolve(res)
            },
            fail: (err) => {
                reject()
            }
        })
    })
}

/**
 * promise 形式 getUserProfile
 */
export const getUserProfile = () => {
    return new Promise((resolve, reject) => {
        wx.getUserProfile({
            lang: 'zh_CN',
            desc: '用于完善资料',
            timeout: 10000,
            success: (res) => {
                resolve(res)
            },
            fail: (err) => {
                if (err.errMsg === 'getUserProfile:fail auth deny') {
                    wx.showToast({
                        title: '您拒绝了授权',
                        icon: 'error'
                    })
                }
                reject()
            }
        })
    })
}