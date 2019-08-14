const vscode = require('vscode');
const util = require('./util');

/**
 * 自动提示实现，这里模拟一个很简单的操作
 * 当输入 this.dependencies.xxx时自动把package.json中的依赖带出来
 * 当然这个例子没啥实际意义，仅仅是为了演示如何实现功能
 * @param {*} document 
 * @param {*} position 
 * @param {*} token 
 * @param {*} context 
 */
function provideCompletionItems(document, position, token, context) {
    
    if(!/.*?\.WCStory$/g.test(document.fileName))return
    const line = document.lineAt(position);
    const lineText = line.text.substring(0, position.character);
    var completionItems = [];
    if(/^@gotoTitle:$/g.test(lineText)){
        for(let i = 0; i < document.lineCount; i++){
            var l = document.lineAt(i);
            var title = /^@title:\s*([_a-z0-9A-z]+)[\t| ]*(.*)/g.exec(l.text);
            if(title == null)continue;
            var completionItem = new vscode.CompletionItem(title[1]);
            completionItem.kind = vscode.CompletionItemKind.Value;
            completionItem.detail = "title(" + "line: " + String(i) + "): " + title[2];
            completionItem.filterText = title[1];
            completionItem.insertText = " " + title[1];
            completionItems.push(completionItem);
        }
        return completionItems;
    }else if(/^@gotoLabel:$/g.test(lineText)){
        var flag = false;
        for(let i = 0; i < document.lineCount; i++){
            var l = document.lineAt(i);
            if(i == position.line)flag = true;
            if(/^@title:\s*([_a-z0-9A-z]+)[\t| ]*(.*)/g.test(l.text)){
                if(flag)break;
                completionItems = [];
                continue;
            }
            var label = /@label:\s*([_a-z0-9A-z]+)[\t| ]*(.*)/g.exec(l.text);
            if(label == null)continue;
            var completionItem = new vscode.CompletionItem(label[1]);
            completionItem.kind = vscode.CompletionItemKind.Value;
            completionItem.detail = "label(" + "line: " + String(i) + "): " + label[2];
            completionItem.filterText = label[1];
            completionItem.insertText = " " + label[1];
            completionItems.push(completionItem);
            
        }
        return completionItems;
    }

}



/**
 * 自动提示实现，这里模拟一个很简单的操作
 * 当输入 this.dependencies.xxx时自动把package.json中的依赖带出来
 * 当然这个例子没啥实际意义，仅仅是为了演示如何实现功能
 * @param {*} document 
 * @param {*} position 
 * @param {*} token 
 */
function provideDocumentHighlights(document, position, token) {
    
    if(!/.*?\.WCStory$/g.test(document.fileName))return
    const line = document.lineAt(position);
    var hightLightItems = [];
    var V = /^@gotoTitle:\s*([_a-z0-9A-z]+)/g.exec(line.text)
    if(V != null){
        for(let i = 0; i < document.lineCount; i++){
            var l = document.lineAt(i);
            var title = /^@title:\s*([_a-z0-9A-z]+)/g.exec(l.text);
            if(title == null)continue;
            if(title[1] == V[1]) {
                hightLightItems.push(new vscode.DocumentHighlight(document.lineAt(i).range,
                                        vscode.DocumentHighlightKind.Read));
                hightLightItems.push(new vscode.DocumentHighlight(document.lineAt(position).range,
                                        vscode.DocumentHighlightKind.Read));
                break;
            }
        }
        return hightLightItems;
    }
    V = /^@gotoLabel:\s*([_a-z0-9A-z]+)/g.exec(line.text)
    if(V != null){
        var flag = false;
        for(let i = 0; i < document.lineCount; i++){
            var l = document.lineAt(i);
            if(i == position.line)flag = true;
            if(/^@title:\s*([_a-z0-9A-z]+)[\t| ]*(.*)/g.test(l.text)){
                if(flag)break;
                hightLightItems = [];
                continue;
            }
            var label = /@label:\s*([_a-z0-9A-z]+)[\t| ]*(.*)/g.exec(l.text);
            if(label == null)continue;
            if(label[1] == V[1]){
                hightLightItems.push(new vscode.DocumentHighlight(document.lineAt(i).range, 
                                        vscode.DocumentHighlightKind.Read));
                hightLightItems.push(new vscode.DocumentHighlight(document.lineAt(position).range,
                                        vscode.DocumentHighlightKind.Read));
            }
        }
        return hightLightItems;
    }

}

/**
 * 自动提示实现，这里模拟一个很简单的操作
 * 当输入 this.dependencies.xxx时自动把package.json中的依赖带出来
 * 当然这个例子没啥实际意义，仅仅是为了演示如何实现功能
 * @param {*} document 
 * @param {*} context
 * @param {*} token 
 */
function provideFoldingRanges(document, context, token){
    if(!/.*?\.WCStory$/g.test(document.fileName))return;
    var titleRanges = [];

    var scriptRanges = [];
    var curScriptDone = true;

    var optionRanges = [];
    var curOptionDone = [];

    var ifRanges = [];
    var curIfDone = [];

    for(let i = 0; i < document.lineCount; i++){
        var l = document.lineAt(i).text;
        if(/^@title:\s*([_a-z0-9A-z]+)/g.test(l)){
            if(titleRanges.length != 0){
                titleRanges[titleRanges.length - 1].end = i - 1;
            }
            while(curOptionDone.length > 0){
                optionRanges[curOptionDone.pop()].end = i - 1;
            }
            while(curIfDone.length > 0){
                ifRanges[curIfDone.pop()].end = i - 1;
            }
            titleRanges.push(new vscode.FoldingRange(i, i, vscode.FoldingRangeKind.Region));
        }else if(/^@optionBegin:/g.test(l)){
            optionRanges.push(new vscode.FoldingRange(i, i, vscode.FoldingRangeKind.Region));
            var line = optionRanges.length - 1;
            curOptionDone.push(line);
        }else if(/^@optionOther:/g.test(l)){
            if(curOptionDone.length != 0){
                line = curOptionDone.pop();
                optionRanges[line].end = i - 1;
                optionRanges.push(new vscode.FoldingRange(i, i, vscode.FoldingRangeKind.Region));
                line = optionRanges.length - 1;
                curOptionDone.push(line);
            }
        }else if(/^@optionEnd/g.test(l)){
            if(curOptionDone.length != 0){
                line = curOptionDone.pop();
                optionRanges[line].end = i - 1;
            }
        }else if(/^@if:/g.test(l)){
            ifRanges.push(new vscode.FoldingRange(i, i, vscode.FoldingRangeKind.Region));
            line = ifRanges.length - 1;
            curIfDone.push(line);
        }else if(/^@elif:/g.test(l) || /^@else:/g.test(l)){
            if(curIfDone.length != 0){
                line = curIfDone.pop();
                ifRanges[line].end = i - 1;
                ifRanges.push(new vscode.FoldingRange(i, i, vscode.FoldingRangeKind.Region));
                line = ifRanges.length - 1;
                curIfDone.push(line);
            }
        }else if(/^@ifEnd/g.test(l)){
            if(curIfDone.length != 0){
                line = curIfDone.pop();
                ifRanges[line].end = i - 1;
            }
        }
        if(/^@script:/g.test(l)){
            if(!curScriptDone){
                scriptRanges[scriptRanges.length - 1].end = i - 1;
            }
            scriptRanges.push(new vscode.FoldingRange(i, i, vscode.FoldingRangeKind.Region));
            curScriptDone = false;
        }else if(l == "" || l[0] == '@'){
            if(!curScriptDone){
                scriptRanges[scriptRanges.length - 1].end = i - 1;
                curScriptDone = true;
            }
        }
    }
    if(titleRanges.length != 0){
        titleRanges[titleRanges.length - 1].end = document.lineCount - 1;
    }
    if(!curScriptDone){
        scriptRanges[scriptRanges.length - 1].end = document.lineCount - 1;
    }
    while(curOptionDone.length > 0){
        optionRanges[curOptionDone.pop()].end = document.lineCount - 1;
    }
    while(curIfDone.length > 0){
        ifRanges[curIfDone.pop()].end = document.lineCount - 1;
    }
    titleRanges = titleRanges.concat(scriptRanges);
    titleRanges = titleRanges.concat(optionRanges);
    titleRanges = titleRanges.concat(ifRanges);
    return titleRanges;
}


/**
 * 光标选中当前自动补全item时触发动作，一般情况下无需处理
 * @param {*} item 
 * @param {*} token 
 */
function resolveCompletionItem(item, token) {
    return null;
}

function provideColorPresentations(color, context, token){
    return null;
}

function provideDocumentColors(document, token){
    var colors = []
    var status = 0;
    for(let i = 0; i < document.lineCount; i++){
        var text = document.lineAt(i).text;
        if(/^@title:/.test(text)){
            var p1 = new vscode.Position(i, 0);
            var p2 = new vscode.Position(i, 6);
            colors.push(new vscode.ColorInformation(new vscode.Range(p1, p2), new vscode.Color(0, 0, 155, 255)));
        }else if(/^@label:/.test(text)){
            var p1 = new vscode.Position(i, 0);
            var p2 = new vscode.Position(i, 6);
            colors.push(new vscode.ColorInformation(new vscode.Range(p1, p2), new vscode.Color(0, 0, 255, 255)));
        }
        
    }
    return colors;
}

module.exports = function(context) {
    // 注册代码建议提示，只有当按下“.”时才触发
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('typescript', {
        provideCompletionItems,
        resolveCompletionItem
    }, ':'));
    context.subscriptions.push(vscode.languages.registerDocumentHighlightProvider('typescript', {provideDocumentHighlights}));
    context.subscriptions.push(vscode.languages.registerFoldingRangeProvider('typescript', {provideFoldingRanges}));
    //context.subscriptions.push(vscode.languages.registerColorProvider('typescript', {provideColorPresentations, provideDocumentColors}))
};