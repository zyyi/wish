let http = require("http");

let url = require("url");

let path = require("path");

let fs = require("fs");

let mime = require("mime");

// 加载mysql数据库模块
let db = require("./config/db");

let template = require("art-template");

template.defaults.root = "./views";

template.defaults.extname = ".html";

template.defaults.rules[1].test = /##([@#]?)[ \t]*(\/?)([\w\W]*?)[ \t]*##/;

let app = http.createServer();

app.listen(3000, (err) => {
	if (!err) {
		console.log("服务器已启动， 端口3000！");
	}
});


app.on("request", (req, res) => {

	let {pathname, query} = url.parse(req.url, true);

	res.render = function (tpl, data) {
		var html = template(tpl, data);
		res.writeHeader(200, {
			"Content-type": "text/html, charset=utf-8"
		});
		res.end(html);
	}

	switch (pathname) {
		case "/":
		case "/index":
			db.query("select * from lists", (err, rows) => {
				if (!err) {
					// rows 为查询结果，是个数组类型
					res.render("index", {lists: rows});
				}
			});
			break;
		case "/create":
			// 添加序号
			query.no = Math.floor(Math.random() * 100000);
			// 添加时间
			query.datetime = new Date();
			db.query("insert into lists set ?", query, (err, info) => {
				if (!err) {
					// 设置响应数据为json格式
					res.writeHeader("200", {
						"Content-type": "application/json"
					})
					// 响应结果
					res.end(JSON.stringify({
						code: 10000,
						msg: "添加成功！",
						result: query
					}));
				}
			});
			break;
		default: 
			// 获取静态资源真实路径
			let realPath = path.join("./public", pathname);
			// 读取资源
			fs.readFile(realPath, (err, data) => {
				if (!err) {
					res.writeHeader(200, {
						"Content-type": mime.getType(realPath)
					});
					res.end(data);
				}
			});
	}
})

















