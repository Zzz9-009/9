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

// 功能：从诗歌数据中汇总作者列表，统计每位作者收录的篇数
function wzx_buildAuthors(wzx_list) {
  const wzx_map = new Map();
  wzx_list.forEach(function (wzx_poem) {
    const wzx_key = wzx_poem.author || "佚名";
    if (!wzx_map.has(wzx_key)) {
      wzx_map.set(wzx_key, {
        author: wzx_key,
        dynasty: wzx_poem.dynasty || "",
        count: 0
      });
    }
    wzx_map.get(wzx_key).count += 1;
  });
  return Array.from(wzx_map.values());
}

const wzx_authors = wzx_buildAuthors(wzx_poems);

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

// 功能：提供作者数据接口，返回作者、朝代与收录篇数
wzx_app.get("/api/authors", function (wzx_req, wzx_res) {
  wzx_res.json(wzx_authors);
});

// 功能：启动服务并输出接口地址，供前端 fetch 使用
wzx_app.listen(wzx_port, function () {
  console.log("数据服务器已启动: http://localhost:" + wzx_port + "/api/poems");
  console.log("作者接口: http://localhost:" + wzx_port + "/api/authors");
  console.log("共读取 " + wzx_poems.length + " 首诗歌 / " + wzx_authors.length + " 位作者，修改 db.json 后请重启服务");
});
