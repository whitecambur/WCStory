/**
 * 跳转到定义示例，本示例支持`package.json`中`dependencies`、`devDependencies`跳转到对应依赖包。
 */
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const util = require('./util');

/**
 * 查找文件定义的provider，匹配到了就return一个location，否则不做处理
 * 最终效果是，当按住Ctrl键时，如果return了一个location，字符串就会变成一个可以点击的链接，否则无任何效果
 * @param {*} document 
 * @param {*} position 
 * @param {*} token 
 */
function provideDefinition(document, position, token) {
    if(!/.*?\.WCStory$/g.test(document.fileName))return
    const line = document.lineAt(position);
    var p = null;
    var V = /^@gotoTitle:\s*([_a-z0-9A-z]+)/g.exec(line.text)
    if(V != null){
        for(let i = 0; i < document.lineCount; i++){
            var l = document.lineAt(i);
            var title = /^@title:\s*([_a-z0-9A-z]+)/g.exec(l.text);
            if(title == null)continue;
            if(title[1] == V[1]) {
                p = new vscode.Location(document.uri, new vscode.Position(i, 0))
                break;
            }
        }
        return p;
    }
    V = /^@gotoLabel:\s*([_a-z0-9A-z]+)/g.exec(line.text)
    if(V != null){
        var flag = false;
        for(let i = 0; i < document.lineCount; i++){
            var l = document.lineAt(i);
            if(i == position.line)flag = true;
            if(/^@title:\s*([_a-z0-9A-z]+)[\t| ]*(.*)/g.test(l.text)){
                if(flag)break;
                p = null;
                continue;
            }
            var label = /@label:\s*([_a-z0-9A-z]+)[\t| ]*(.*)/g.exec(l.text);
            if(label == null)continue;
            if(label[1] == V[1]){
                p = new vscode.Location(document.uri, new vscode.Position(i, 0))
            }
        }
        return p;
    }
}

module.exports = function(context) {
    // 注册如何实现跳转到定义，第一个参数表示仅对json文件生效
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(['typescript'], {
        provideDefinition
    }));
};