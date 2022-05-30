// 获取wt路径
const wt = utools.getPath('home') + `\\AppData\\Local\\Microsoft\\WindowsApps\\wt.exe`;

function enterHandler({ code, type, payload }) {
    let url = ''
    if (code === 'openInWt') {
        utools.setSubInput(() => {}, '正在获取路径...', false);
        utools.readCurrentFolderPath().then(path => {
            url = path;
            setTimeout(() => {
                window.utools.hideMainWindow();
            }, 80);
            window.openWt(wt, url);
        }).catch(err => {
            // utools.showNotification('路径读取失败');
            // utools.outPlugin();
            // 调用插件打开多个标签的功能
            window.utools.redirect("在wt中打开多个目录", "");
            window.utools.showMainWindow();
        })
    }
}

// 导入 node-cmd 模块
var nodeCmd = require('node-cmd');
// 调用 node-cmd 模块用 wt 打开 指定的 url
window.openWt = function(wt, url) {
    url = JSON.stringify(url).replace(';', '\\;');
    nodeCmd.run(`${wt} -d ${url}`);
    window.utools.outPlugin();
}

window.openManyTab = function(wt, urls) {
    let endUrl = '';
    urls.forEach(url => {
        url = JSON.stringify(url).replace(';', '\\;');
        endUrl += ` ; -d ${url}`;
    })
    endUrl = endUrl.trim();
    endUrl = endUrl.slice(1);
    nodeCmd.run(`${wt} ${endUrl}`);
}
window.exports = {
    "openInWt": {
        mode: "none",
        args: {
            enter: action => enterHandler(action)
        }
    },
    "fromDir": {
        mode: "list",
        args: {
            enter: (action, callbackSetList) => {
                window.arr = [{
                    title: "打开",
                    description: '在终端中打开多个tab: 分号将路径加入列表, 直接输入分号则添加一个默认tab, 回车打开全部, 选择单项则打开对应目录'
                }]
                if (action.type === 'files') {
                    action.payload.forEach(item => {
                        arr.push({
                            description: item.path
                        })
                    })
                }
                if (action.type === 'regex') {
                    arr.push({
                        description: action.payload
                    })
                }
                callbackSetList(arr);
            },
            search: (ac, word, cb) => {
                if (word.endsWith(';')) {
                    // 考虑到直接输入 ; 可以打开多个默认tab, 此处宽松匹配不做限制
                    // if (!new RegExp(/^[a-zA-Z]:\\(?:\w+\\?)*/).test(word)) {
                    //     utools.setSubInputValue(word.slice(0, -1));
                    //     return;
                    // }
                    arr.push({
                        description: word.slice(0, -1)
                    });
                    cb(arr);
                    utools.setSubInputValue('');
                }
            },
            select: (action, item, callbackSetList) => {
                setTimeout(() => {
                    window.utools.hideMainWindow();
                }, 80);
                let pathArr = [];
                if (item.title == '打开') {
                    arr.forEach(item => {
                        if (!item.title) {
                            pathArr.push(item.description);
                        }
                    });
                    window.openManyTab(wt, pathArr);
                } else {
                    window.openWt(wt, item.description);
                }
                setTimeout(() => {
                    window.utools.outPlugin();
                }, 80)
            },
            placeholder: "输入路径, 分号确认, 回车打开全部, 选择打开指定目录"
        }
    }
}