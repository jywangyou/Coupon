// 接口不可用时的兜底分类，字段与 /api/categories、/api/jd/categories 保持一致。
export const fallbackCategories = {
  taobao: [
    { id: 'all', label: '精选', icon: 'ri-sparkling-2-line' },
    { id: 'food', label: '食品', icon: 'ri-cake-3-line' },
    { id: 'daily', label: '天天特卖', icon: 'ri-flashlight-line' },
    { id: 'women', label: '女装', icon: 'ri-shirt-line' },
    { id: 'men', label: '男装', icon: 'ri-windy-line' },
    { id: 'beauty', label: '美妆个护', icon: 'ri-magic-line' },
    { id: 'home', label: '家居家装', icon: 'ri-home-5-line' },
    { id: 'mother', label: '母婴', icon: 'ri-bear-smile-line' },
    { id: 'digital', label: '数码家电', icon: 'ri-computer-line' },
    { id: 'shoes', label: '鞋包配饰', icon: 'ri-briefcase-3-line' },
    { id: 'underwear', label: '内衣', icon: 'ri-user-heart-line' },
    { id: 'sport', label: '运动户外', icon: 'ri-bike-line' },
    { id: 'pet', label: '宠物', icon: 'ri-baidu-line' }
  ],
  jd: [
    { id: 'all', label: '精选', icon: 'ri-sparkling-2-line' },
    { id: 'hot', label: '实时热销', icon: 'ri-fire-line' },
    { id: 'recommend', label: '为你推荐', icon: 'ri-heart-3-line' },
    { id: 'nine', label: '9.9包邮', icon: 'ri-price-tag-3-line' },
    { id: 'delivery', label: '京东配送', icon: 'ri-truck-line' },
    { id: 'self', label: '自营好物', icon: 'ri-shield-star-line' },
    { id: 'digital', label: '数码家电', icon: 'ri-computer-line' },
    { id: 'supermarket', label: '京东超市', icon: 'ri-shopping-basket-2-line' },
    { id: 'mother', label: '母婴玩具', icon: 'ri-bear-smile-line' },
    { id: 'home', label: '家具日用', icon: 'ri-home-5-line' },
    { id: 'beauty', label: '美妆穿搭', icon: 'ri-magic-line' },
    { id: 'book', label: '图书文具', icon: 'ri-book-open-line' },
    { id: 'today', label: '今日必推', icon: 'ri-thumb-up-line' },
    { id: 'seckill', label: '京东秒杀', icon: 'ri-flashlight-line' }
  ]
}
