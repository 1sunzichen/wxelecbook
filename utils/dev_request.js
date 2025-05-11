// const BASE_URL = 'http://192.168.1.223:3389';
// const BASE_URL = 'http://192.168.5.87:3389';
const BASE_URL = 'http://www.luliangdev.cn';
const ZHUISHU_URL = 'http://statics.zhuishushenqi.com';
const app = getApp();

/**
 * 网络请求封装
 * @param url url路径名 例：/books
 * @param method 请求方式 POST/GET/DELETE等
 * @param data 请求参数 string类型
 * @param success  成功回调
 * @param fail 失败回调
 */
// 新增 Mock 配置
const MOCK_CONFIG = {
  GET: {
    '/books': {
      code: 10000,
      data: [
        {
          id: 1,
          title: "凡人修仙传",
          author: "忘语",
          majorCate: "玄幻",
          longIntro: "一个普通山村小子，偶然下进入到当地江湖小门派，成了一名记名弟子。他以这样身份，如何在门派中立足，如何以平庸的资质进入到修仙者的行列，从而笑傲三界之中！",
          latelyFollower: 356000,
          retentionRatio: 82.5,
          cover:  "/image/dev.jpg"
        },
        {
          id: 2,
          title: "全职高手",
          author: "蝴蝶蓝",
          majorCate: "游戏",
          longIntro: "网游荣耀中被誉为教科书级别的顶尖高手，因为种种原因遭到俱乐部的驱逐，离开职业圈的他寄身于一家网吧成了一个小小的网管，但是，拥有十年游戏经验的他，在荣耀新开的第十区重新投入了游戏...",
          latelyFollower: 289000, 
          retentionRatio: 91.2,
          cover: "/cover/2.jpg"
        }
      ],
      msg: "GET Mock 数据"
    },
    '/classify': {
      code: 10000,
      data: {
        male:[
            { 
                name: "玄幻", 
                icon: "https://cdn-icons-png.flaticon.com/128/785/785116.png",
                bookCount: 3560
            },
            {
                name: "都市",
                icon: "https://cdn-icons-png.flaticon.com/128/785/785094.png",
                bookCount: 2890
            }
        ],
        female:[
            {
                name: "古代言情",
                icon: "https://cdn-icons-png.flaticon.com/128/785/785104.png",
                bookCount: 1520
            },
            {
                name: "仙侠奇缘", 
                icon: "https://cdn-icons-png.flaticon.com/128/785/785088.png",
                bookCount: 2310
            }
        ],
        press:[
            {
                name: "文学经典",
                icon: "https://cdn-icons-png.flaticon.com/128/785/785112.png", 
                bookCount: 870
            },
            {
                name: "历史名著",
                icon: "https://cdn-icons-png.flaticon.com/128/785/785100.png",
                bookCount: 650
            }
        ]
      },
      msg: "GET Mock 数据"
    },
  },
  POST: {
    '/books': {
      code: 10000,
      data: {id: 2},
      msg: "POST Mock 数据"
    }
  },
  DELETE: {
    '/books/1': {
      code: 10000,
      msg: "DELETE Mock 数据"
    }
  }
};

function request(url, method, data, success, fail) {
    // 改进后的 Mock 开关
    const useMock = true;
    
    if (useMock) {
        // 改进后的参数处理
        const resolvedParams = handleParams(data, success, fail);
        const { validSuccess, validFail, validData } = resolvedParams;
    
        if (typeof validSuccess !== 'function') {
            console.error('Invalid success callback');
            return;
        }
    
        const mockHandler = (url, method) => {
            const methodMocks = MOCK_CONFIG[method] || {};
            const mockData = methodMocks[url] || {
                code: 10000,
                data: {},
                msg: `${method} Mock 数据`
            };
            
            setTimeout(() => validSuccess({
                ...mockData,
                _isMock: true
            }), 500);
        };

        // 根据请求方法执行不同 Mock 处理
        switch(method) {
            case 'GET':
                mockHandler(url, 'GET');
                break;
            case 'POST':
                mockHandler(url, 'POST');
                break;
            case 'DELETE': 
                mockHandler(url, 'DELETE');
                break;
            default:
                mockHandler(url, 'OTHER');
        }
        return;
    }
    if (!fail && !success && typeof data === 'function') {
        // fail = null;
        success = data;
        data = "";
    } else if (!fail) {
        if (typeof data === 'function') {
            fail = success
            success = data
            data = ""
        } else if (typeof data === 'object') {
            // fail = null
        } else {
            console.log("传递参数类型不正确");
        }

    } else {
        console.log("传递参数个数不正确");
    }
    let wxtask = wx.request({
        url: BASE_URL + '/api' + url,
        header: {
            'access-token': app.globalData.user_info.token,
            'app-type': 'wx-app'
        },
        method: method,
        data: data,
        success: function (res) {
            switch (res.data.code) {
                case 10000:
                case 10001:
                case 10002:
                case 10004:
                    success(res.data)
                    break
                case 10005:
                case 40000:
                case 40001:
                case 40003:
                case 40004:
                case 40005:
                case 50000:
                case 50003:
                    wx.showToast({
                        title: res.data.msg,
                        icon: 'none',
                        duration: 1000
                    })
                    if (fail) {
                        fail(res.data.msg)
                    }
                    break
                case 60001:
                case 60002:
                    wx.showToast({
                        title: res.data.msg,
                        icon: 'none',
                        duration: 1000
                    })
                    //token无效跳转登录页面
                    wx.navigateTo({
                        url: "../login/login"
                    })

                    break
            }
        },
        fail: function (res) {
            console.log(res);
            wx.showToast({
                title: res,
                icon: 'none',
                duration: 1000
            })
            if (fail) {
                fail(res)
            }
        }
    })


    return wxtask;
}


/**
 * 请求封装-Get
 * @param url 请求地址
 * @param data 请求参数
 * @param success 成功回调
 * @param fail  失败回调
 * @constructor
 *
 * 返回值为微信请求实例   用于取消请求
 */
function Get(url, data, success, fail) {
    return request(url, "GET", data, success, fail)
}


/**
 * 请求封装-Post
 * @param url 请求地址
 * @param data 请求参数
 * @param success 成功回调
 * @param fail  失败回调
 * @constructor
 *
 * 返回值为微信请求实例   用于取消请求
 */
function Post(url, data, success, fail) {
    return request(url, 'POST', data, success, fail)
}


/**
 * 请求封装-Delete
 * @param url 请求地址
 * @param data 请求参数
 * @param success 成功回调
 * @param fail  失败回调
 * @constructor
 *
 * 返回值为微信请求实例   用于取消请求
 */
function Delete(url, data, success, fail) {
    return request(url, 'DELETE', data, success, fail)
}

exports.Get = Get;
exports.Post = Post;
exports.Delete = Delete;
exports.BASE_URL = BASE_URL;
exports.ZHUISHU_URL = ZHUISHU_URL;


// 新增参数处理函数
function handleParams(data, success, fail) {
    let validData = data;
    let validSuccess = success;
    let validFail = fail;

    if (typeof data === 'function') {
        validSuccess = data;
        validData = {};
        if (typeof success === 'function') {
            validFail = success;
        }
    }

    return {
        validData,
        validSuccess,
        validFail
    };
}