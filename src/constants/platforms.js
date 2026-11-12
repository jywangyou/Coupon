import tbIcon from '../assets/tb_icon.png'
import jdIcon from '../assets/jd_icon.png'

// 平台级配置：页面文案、主题色、数据接口都从这里取，方便新增其他联盟平台。
export const platforms = {
  taobao: {
    id: 'taobao',
    name: '淘宝',
    title: '省心券',
    icon: tbIcon,
    accent: '#ff4d4f',
    accentDeep: '#d9363e',
    homePath: '/taobao',
    productsApi: '/api/products',
    categoriesApi: '/api/categories',
    searchPlaceholder: '搜索淘宝优惠商品，例如：面霜',
    searchNote: '搜索结果来自淘宝客实时商品库，优惠券和价格以淘宝页面为准。',
    hotKeywords: ['面霜', '手机', '零食', '收纳', '运动鞋', '护手霜'],
    soldLabel: '已售',
    copyLabel: '复制淘口令',
    buyLabel: '打开淘宝优惠券',
    copySuccess: '淘口令已复制，打开淘宝即可查看',
    detailNote: '先领券再下单，优惠以淘宝页面实时展示为准。你可以复制淘口令，也可以直接打开领券页面。',
    couponTitle: '专享优惠券',
    emptyHint: '看看其他分类',
    pageTitle: '省心券 · 淘宝优惠券精选'
  },
  jd: {
    id: 'jd',
    name: '京东',
    title: '省心券',
    icon: jdIcon,
    accent: '#e1251b',
    accentDeep: '#b81b13',
    homePath: '/jd',
    productsApi: '/api/jd/products',
    categoriesApi: '/api/jd/categories',
    searchPlaceholder: '搜索京东优惠商品，例如：洗衣液',
    searchNote: '搜索结果来自京东联盟实时物料库，优惠券和价格以京东页面为准。',
    hotKeywords: ['洗衣液', '纸巾', '耳机', '牛奶', '零食', '保温杯'],
    soldLabel: '30天售',
    copyLabel: '复制京口令',
    buyLabel: '打开京东商品页',
    copySuccess: '京口令已复制，打开京东即可查看',
    detailNote: '先领券再下单，优惠以京东页面实时展示为准。复制京口令后可打开京东 App 自动识别，也可以直接打开京东商品页。',
    couponTitle: '京东优惠券',
    emptyHint: '看看其他分类',
    pageTitle: '省心券 · 京东优惠精选'
  }
}

export const platformList = Object.values(platforms)
