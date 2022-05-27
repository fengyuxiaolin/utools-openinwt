// 获取wt路径
const wt = utools.getPath('home') + `\\AppData\\Local\\Microsoft\\WindowsApps\\wt.exe`;

function enterHandler({ code, type, payload }) {
    let url = ''
    if (code === 'openInWt') {
        utools.readCurrentFolderPath().then(path => {
            url = path;
            window.openWt(wt, url);
        }).catch(err => {
            utools.showNotification('路径读取失败');
            window.utools.outPlugin();
        })
    }
}

// 导入 node-cmd 模块
var nodeCmd = require('node-cmd');
// 调用 node-cmd 模块用 wt 打开 指定的 url
window.openWt = function(wt, url) {
    url = JSON.stringify(url);
    nodeCmd.run(`${wt} -d ${url}`);
}

window.openManyTab = function(wt, urls) {
    let endUrl = '';
    urls.forEach(url => {
        url = JSON.stringify(url);
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
            enter: (action) => {
                window.utools.hideMainWindow();
                enterHandler(action);
                window.utools.outPlugin();
            }
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
                    // 直接输入 ; 可以打开多个默认tab
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
                window.utools.hideMainWindow();
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
                }, 200)
            },
            placeholder: "输入路径, 分号确认, 回车打开全部, 选择打开指定目录"
        }
    }
}