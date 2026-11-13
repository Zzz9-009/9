/**
 * 作者：王振旭
 * 建立时间：2026-11-13
 * 使用大模型：DeepSeek-V4.1-Flash
 * 功能名称：诗歌数据服务器（Express，端口 3004）
 */
const express = require("express");
const fs = require("fs");
const path = require("path");

const wzx_port = 3004;
const wzx_app = express();

// 功能：读取 db 文件夹中的 db.json，返回其中的 poems 数组
function wzx_loadPoems() {
  const wzx_dbPath = path.join(__dirname, "db.json");
  const wzx_raw = fs.readFileSync(wzx_dbPath, "utf8");
  const wzx_data = JSON.parse(wzx_raw);
  return Array.isArray(wzx_data.poems) ? wzx_data.poems : [];
}

// 启动时读取一次，改动 db.json 后需要重启服务才会生效
const wzx_poems = wzx_loadPoems();

// 功能：为所有响应添加跨域头，允许前端以 file:// 或本地端口方式访问接口
wzx_app.use(function (wzx_req, wzx_res, wzx_next) {
  wzx_res.setHeader("Access-Control-Allow-Origin", "*");
  wzx_res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  wzx_next();
});

// 功能：把项目根目录作为静态目录，按 db.json 中的 pic 路径提供图片
wzx_app.use(express.static(path.join(__dirname, "..")));

// 功能：提供诗歌数据接口，返回 poems 数组
wzx_app.get("/api/poems", function (wzx_req, wzx_res) {
  wzx_res.json(wzx_poems);
});

// 功能：启动服务并输出接口地址，供前端 fetch 使用
wzx_app.listen(wzx_port, function () {
  console.log("数据服务器已启动: http://localhost:" + wzx_port + "/api/poems");
  console.log("共读取 " + wzx_poems.length + " 首诗歌，修改 db.json 后请重启服务");
});
