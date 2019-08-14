const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

/**
 * 鼠标悬停提示，当鼠标停在package.json的dependencies或者devDependencies时，
 * 自动显示对应包的名称、版本号和许可协议
 * @param {*} document 
 * @param {*} position 
 * @param {*} token 
 */
function provideHover(document, position, token) {
    /*const fileName    = document.fileName;
    const workDir     = path.dirname(fileName);
    const word        = document.getText(document.getWordRangeAtPosition(position));

    if (/\/package\.json$/.test(fileName)) {
        console.log('进入provideHover方法');
        const json = document.getText();
        if (new RegExp(`"(dependencies|devDependencies)":\\s*?\\{[\\s\\S]*?${word.replace(/\//g, '\\/')}[\\s\\S]*?\\}`, 'gm').test(json)) {
            let destPath = `${workDir}/node_modules/${word.replace(/"/g, '')}/package.json`;
            if (fs.existsSync(destPath)) {
                const content = require(destPath);
                console.log('hover已生效');
                // hover内容支持markdown语法
                return new vscode.Hover(`* **名称**：${content.name}\n* **版本**：${content.version}\n* **许可协议**：${content.license}`);
            }
        }
    }*/
    if(!/.*?\.WCStory$/g.test(document.fileName))return
    const line = document.lineAt(position);
    var H = null;
    var V = /^@gotoTitle:\s*([_a-z0-9A-z]+)/g.exec(line.text)
    if(V != null){
        for(let i = 0; i < document.lineCount; i++){
            var l = document.lineAt(i);
            var title = /^@title:\s*([_a-z0-9A-z]+)[ \t]*(.*)/g.exec(l.text);
            if(title == null)continue;
            if(title[1] == V[1]) {
                H = new vscode.Hover(`* **titleName**：${V[1]}\n* **titleMsg**：${title[2]}\n* **titleLine**：${i+1}`);
                break;
            }
        }
        return H
    }
    V = /^@gotoLabel:\s*([_a-z0-9A-z]+)/g.exec(line.text)
    if(V != null){
        var flag = false;
        for(let i = 0; i < document.lineCount; i++){
            var l = document.lineAt(i);
            if(i == position.line)flag = true;
            if(/^@title:\s*([_a-z0-9A-z]+)[\t| ]*(.*)/g.test(l.text)){
                if(flag)break;
                H = null;
                continue;
            }
            var label = /@label:\s*([_a-z0-9A-z]+)[\t| ]*(.*)/g.exec(l.text);
            if(label == null)continue;
            if(label[1] == V[1]){
                H = new vscode.Hover(`* **labelName**：${V[1]}\n* **labelMsg**：${label[2]}\n* **labelLine**：${i+1}`);
            }
        }
        return H;
    }
}

module.exports = function(context) {
    // 注册鼠标悬停提示
    context.subscriptions.push(vscode.languages.registerHoverProvider('typescript', {
        provideHover
    }));
};