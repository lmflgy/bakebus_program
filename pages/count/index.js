import regeneratorRuntime from '../../lib/runtime.js'
import { api } from '../../lib/api.js'
var wxCharts = require('../../utils/wxcharts.js')
var lineChart = null
const pageObject = {
    mixins: [require('../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '数据统计',
        day: '今日',
        days: [],
        month: null,
        months: [],
        year: null,
        years: [],
        dayTotals: 0,
        monthTotals: 0,
        yearTotals: 0,
        today: '',
        istoday: true,
        lineData: ['日账单', '月账单', '年账单'],
        line: 0,
        totals: 0,
        userList: [],
        userNum: 0,
        orderNum: 0,
        current: 0,
        model: null,
        isLook: false
    },
    onLoad () {
        this.loadInit()
    },
    onShow () {
        this.createCharts()
    },
    bindLineChange (e) {
        this.setData({
            line: e.detail.value
        })
        this.createCharts()
    },
    async createCharts () {
        // 判断是否客服
        var res = await api({ url: '/front/merchant/bake/banner/shopInfo?shopId=' + this.data.shopId, method: 'get' })
        if (res.ResultCode == 0) {
            this.setData({
                model: res.Data
            })
        }
        
        var res = wx.getSystemInfoSync()
        let _width = res.windowWidth
        // 获取数据
        var categories = []
        var data = []
        let time = ''
        let url = 'nearlySevenDays'
        if (this.data.line == 0) {
            url = 'nearlySevenDays'
            if (this.data.day == '今日') {
                time = this.data.today
            } else {
                time = this.data.day
            }
        } else if (this.data.line == 1) {
            url = 'allMonthsOfTheYear'
            time = this.data.month + '-01'
        } else {
            url = 'inRecentFiveYears'
            time = this.data.year + '-12-31'
        }

        // 折线图
        var res = await api({ url: '/front/merchant/bake/datatotal/' + url + '?shopId=' + this.data.shopId + '&dateTime=' + time, method: 'get' })
        if (res.ResultCode == 0) {
            res.Data.forEach((item) => {
                categories.push(item.date)
                data.push(item.turnover)
            })
        }
        var simulationData = {
            categories: categories,
            data: data
        }
        lineChart = new wxCharts({
            canvasId: 'lineCanvas',
            type: 'line',
            categories: simulationData.categories,
            animation: true,
            series: [
                {
                    name: this.data.lineData[this.data.line],
                    data: simulationData.data
                }
            ],
            xAxis: {
                disableGrid: true
            },
            yAxis: {
                title: '金额',
                min: 0
            },
            width: _width,
            height: 200,
            dataLabel: false,
            dataPointShape: true,
            extra: {
                lineStyle: 'curve'
            }
        })
    },
    async loadInit () {
        wx.showLoading({ title: '加载中', mask: true })
        var date = new Date()
        let month = date.getMonth() + 1
        let year = date.getFullYear()
        let day = date.getDate()
        this.setData({
            today: year + '-' + month + '-' + day
        })
        // 加载日
        this.loadDayBills(year, month, day)
        wx.hideLoading()
    },
    async loadDayBills (y, m, d) {
        wx.showLoading({ title: '加载中', mask: true })
        var res = await api({ url: '/front/merchant/bake/datatotal/getSingleDayBillsByDate?shopId=' + this.data.shopId + '&year=' + y + '&month=' + m + '&day=' + d, method: 'get' })
        if (res.ResultCode == 0) {
            this.setData({
                totals: res.Data.sumOfBusiness
            })
        }
        wx.hideLoading()
    },
    async loadMonthBills () {
        wx.showLoading({ title: '加载中', mask: true })
        var res = await api({ url: '/front/merchant/bake/datatotal/getMonthlyBillsOnAMonthlyBasis?shopId=' + this.data.shopId + '&year=' + this.data.years[this.data.year].replace('年', '') + '&month=' + (parseInt(this.data.month) + 1), method: 'get' })
        if (res.ResultCode == 0) {
            this.setData({
                monthTotals: res.Data.sumOfBusiness
            })
        }
        wx.hideLoading()
    },
    async loadYearBills () {
        wx.showLoading({ title: '加载中', mask: true })
        var res = await api({ url: '/front/merchant/bake/datatotal/getAnnualBillsByYear?shopId=' + this.data.shopId + '&year=' + this.data.years[this.data.year].replace('年', ''), method: 'get' })
        if (res.ResultCode == 0) {
            this.setData({
                yearTotals: res.Data.sumOfBusiness
            })
        }
        wx.hideLoading()
    },
    bindDayChange (e) {
        const nowDay = this.data.years[this.data.year].replace('年', '') + '-' + this.data.months[this.data.month].replace('月', '') + '-' + this.data.days[e.detail.value].replace('日', '')
        this.setData({
            day: e.detail.value,
            istoday: this.data.today == nowDay
        })
        this.loadDayBills()
    },
    bindMonthChange (e) {
        const nowDay = this.data.years[this.data.year].replace('年', '') + '-' + this.data.months[e.detail.value].replace('月', '') + '-' + this.data.days[this.data.day].replace('日', '')
        this.setData({
            month: e.detail.value,
            istoday: this.data.today == nowDay
        })
        this.loadDayBills()
        this.loadMonthBills()
    },
    bindYearChange (e) {
        const nowDay = this.data.years[e.detail.value].replace('年', '') + '-' + this.data.months[this.data.month].replace('月', '') + '-' + this.data.days[this.data.day].replace('日', '')
        this.setData({
            year: e.detail.value,
            istoday: this.data.today == nowDay
        })
        this.loadDayBills()
        this.loadMonthBills()
        this.loadYearBills()
    },
    async bindDay1Change (e) {
        this.setData({
            line: 0,
            day: e.detail.value
        })
        wx.showLoading({ title: '加载中', mask: true })
        let y = this.data.day.substring(0, 4)
        let m = this.data.day.substring(5, 7)
        let d = this.data.day.substring(8, 10)
        var res = await api({ url: '/front/merchant/bake/datatotal/getSingleDayBillsByDate?shopId=' + this.data.shopId + '&year=' + y + '&month=' + m + '&day=' + d, method: 'get' })
        if (res.ResultCode == 0) {
            this.setData({
                totals: res.Data.sumOfBusiness
            })
        }
        this.createCharts()
        wx.hideLoading()
    },
    async bindMonth1Change (e) {
        this.setData({
            line: 1,
            month: e.detail.value
        })
        wx.showLoading({ title: '加载中', mask: true })
        let y = this.data.month.substring(0, 4)
        let m = this.data.month.substring(5, 7)
        var res = await api({ url: '/front/merchant/bake/datatotal/getMonthlyBillsOnAMonthlyBasis?shopId=' + this.data.shopId + '&year=' + y + '&month=' + m, method: 'get' })
        if (res.ResultCode == 0) {
            this.setData({
                totals: res.Data.sumOfBusiness
            })
        }
        this.createCharts()
        wx.hideLoading()
    },
    async bindYear1Change (e) {
        this.setData({
            line: 2,
            year: e.detail.value
        })
        wx.showLoading({ title: '加载中', mask: true })
        var res = await api({ url: '/front/merchant/bake/datatotal/getAnnualBillsByYear?shopId=' + this.data.shopId + '&year=' + this.data.year, method: 'get' })
        if (res.ResultCode == 0) {
            this.setData({
                totals: res.Data.sumOfBusiness
            })
        }
        this.createCharts()
        wx.hideLoading()
    },
    async bindOrderChange () {
        this.setData({
            line: 3
        })
        wx.showLoading({ title: '加载中', mask: true })
        var res = await api({ url: '/front/merchant/bake/datatotal/getOrderData', method: 'get' })
        if (res.ResultCode == 0) {
            let list = []
            if (res.Data.userList != null && res.Data.userList.length > 0) {
                res.Data.userList.forEach((item, index) => {
                    item.height = 'height:0'
                    item.sel = false
                    if (index == 0) {
                        item.sel = true
                        item.height = 'height:' + (item.goodsDetailVoList.length * 190) + 'rpx'
                    }
                    list.push(item)
                })
            }
            this.setData({
                userNum: res.Data.userNum,
                orderNum: res.Data.orderNum,
                userList: list
            })
        }
        wx.hideLoading()
    },
    handleAction (e) {
        const { index } = e.currentTarget.dataset
        let list = this.data.userList
        list[index].sel = !list[index].sel
        if (list[index].sel) {
            list[index].height = 'height:' + (list[index].goodsDetailVoList.length * 190) + 'rpx'
        } else {
            list[index].height = 'height:0'
        }
        this.setData({
            userList: list
        })
    }
}
Page(pageObject)
