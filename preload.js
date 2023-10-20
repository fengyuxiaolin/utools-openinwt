// 未选中文件时进入插件，直接打开资源管理器当前路径
function enterHandler({ code, type, payload }) {
    utools.setSubInput(() => { }, '正在获取路径...', false);
    utools.readCurrentFolderPath()
        .then(path => window.openWt(path))
        .catch(err => {
            // utools.showNotification('路径读取失败');
            // utools.outPlugin();
            // 调用插件打开多个标签的功能, 以默认路径开启wt
            window.utools.redirect("在wt中打开多个目录", "");
        })
}

// 导入cross-spawn
const spawn = require('child_process').spawn;
// 通过spawn执行wt -d 打开指定url
window.openWt = url => {
    window.utools.hideMainWindow();

    url = JSON.stringify(url).replace(';', '\\;');
    spawn('wt', ['-d', url], { shell: 'cmd.exe' });

    window.utools.outPlugin();
}
// 打开多个tab
window.openManyTab = urls => {
    window.utools.hideMainWindow();

    let endUrl = '';
    urls.forEach(url => {
        url = JSON.stringify(url).replace(';', '\\;');
        endUrl += ` ; -d ${url}`; 
    })
    endUrl = endUrl.trim();
    endUrl = endUrl.slice(1);
    spawn('wt', [endUrl], { shell: 'cmd.exe' });

    window.utools.outPlugin();
}

window.exports = {
    "openInWt": {
        mode: "none",
        args: { enter: enterHandler }
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
                    // 考虑到直接输入 ; 可以打开多个默认tab, 此处宽松匹配不做限制（不知道咋写）
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
                if (item.title == '打开') {
                    // 打开全部路径
                    let pathArr = [];
                    arr.forEach(item => {
                        if (!item.title) {
                            pathArr.push(item.description);
                        }
                    });
                    window.openManyTab(pathArr);
                } else {
                    // 打开指定路径
                    window.openWt(item.description);
                }
            },
            placeholder: "输入路径, 分号确认, 回车打开全部, 选择打开指定目录"
        }
    }
}