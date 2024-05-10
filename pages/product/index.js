import regeneratorRuntime from '../../lib/runtime.js'
import { api } from '../../lib/api.js'
const pageObject = {
    mixins: [require('../../mixin/themeChange.js')],
    data: {
        authCode: 'other',
        title: '产品管理'
    },
    onLoad () {

    },
    onShow () {

    }
}
Page(pageObject)
