// 需要使用async的页面引入 import regeneratorRuntime from '../../lib/runtime/runtime';
const APIURL = 'https://admin.hzqz.cc'
// const APIURL = 'https://bake.ranxy.cn'
export const api = (params) => {
    let header = { ...params.header }
    if (!params.header) {
        header["Content-Type"] = "application/x-www-form-urlencoded;charset=utf-8;"
    }
    let token = wx.getStorageSync("token")
    if (token != null && token != "" && typeof token !== "undefined") {
        header["Authorization"] = wx.getStorageSync("token")
    }
    return new Promise((resolve, reject) => {
        var reqTask = wx.request({
            ...params,
            header: header,
            url: APIURL + params.url,
            success: (res) => {
                if (res.statusCode === 200) {
                    resolve(res.data)
                } else {
                    reject(res.data)
                }
            },
            fail: (err) => {
                reject(err)
            }
        })
    })
}
