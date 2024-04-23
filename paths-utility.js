const path = require("path");
const {URI} = require("vscode-uri");

function makeServerPath(fileName) {
    return formatPath(__dirname + path.sep + "temp" + path.sep + fileName).replace(/.golang$/, ".go");
}

function makeClientPath(filePath) {
    return filePath.split(/[/\\]/).pop().replace(/.go$/, ".golang");
}

function formatPath(filePath) {
    return URI.file(filePath).toString();
}

exports.makeServerPath = makeServerPath;
exports.makeClientPath = makeClientPath;
exports.formatPath = formatPath;
