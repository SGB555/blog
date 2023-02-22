---
layout: node.js
title: 从零开发web server博客项目
date: 2018-07-01 17:38:36
tags: node.js
---

## 一、准备工作

### 目录：

```
.node-blog
├── bin // 项目启动文件
├── node_modules
├── src
|   ├── conf // 数据库配置
|   └── controller // 接口api
|   └── db // 数据库链接
|   └── model // 输出格式
|   └──router // 路由
├── app.js
├── package.json
```

### 项目依赖

- node v10.15.2
- cross-env v6.0.3 用于设置环境变量
- nodemon 用于热重载 node

```json
"dev": " cross-env NODE_ENV=dev nodemon ./bin/www.js"
```

## 二、项目开发之接口开发

### 启动服务

如 npm script 所示 先在./bin/ 目录下新建 www.js 作为启动项目服务的入口。

http 为 node 原生模块，并将 createServer 的回调抽离出来至 app.js

```js
const http = require('http')
const serverHandle = require('../app')
const PORT = 8000
const server = http.createServer(serverHandle)
server.listen(PORT)
```

### 处理 get 请求

- app.js

```js
const querystring = require('querystring')
const serverHandle = (req, res) => {
  const url = req.url
  req.query = querystring.parse(url.split('?')[1])
  res.end(JSON.stringfly(req.query))
}
```

### 处理 post 请求

post 跟 get 处理的方式有所区别，是需要监听的方式去处理

```js
const querystring = require("querystring");
const serverHandle = (req, res) => {
  if (req.methods === "POST") {
      let postData = ''
      req.on('data' chunk=>{
          postData += chunk.toString()
      })
      req.on('end',()=>{
          res.end(JSON.stringfly(postData))
      })
  }
};
```

### 请求的综合处理

现在把 get 请求和 post 请求放在一起处理

```js
const querystring = require("querystring");
const serverHandle = (req, res) => {
  // 设置返回格式JSON
  res.setHeader("Content-type", "application/json");

  // 获取path
  const url = req.url;
  req.path = url.split("?")[0];

  // 解析query
  req.query = querystring.parse(url.split("?")[1]);

  // 获取请求方式
  const method = req.method;

  const resData = {
    url,
    method,
    path: req.path,
    query: req.query
  };

  if (method === "GET") {
    res.end(JSON.stringfly(resData));
  }

  if (method === "POST") {
       let postData = ''
      req.on('data' chunk=>{
          resData.postData += chunk.toString()
      })
      req.on('end',()=>{
          res.end(JSON.stringfly(resData))
      })
  }
};
```

### 接口设计

![MLHWSU.png](https://s2.ax1x.com/2019/11/24/MLHWSU.png)

### 开发路由

这里在./src/router 新建 user.js 和 blog.js 分别是博客和用户相关的路由处理

```js
// blog.js
const handleBlogRouter = (req, res) => {
  const method = req.method // GET POST
  const url = req.url
  const path = url.split('?')[0]
  // 获取博客列表
  if (method === 'GET' && req.path === '/api/blog/list') {
    return {
      msg: '这是获取博客列表的接口'
    }
  }
}

module.exports = handleBlogRouter
```

大概逻辑就是先判断 url 和 method 再做相关的操作，后面会有 controller 负责。 目前还没接入数据库所以返回假数据。其余的 API 都是类似的逻辑

开发完路由后 app.js 也要相应改造一下，用路由去处理不同的请求。

```js
// app.js
// ...
const serverHandle = (req, res) => {
    // 设置返回格式 JSON
    res.setHeader('Content-type', 'application/json')
    // 处理 blog 路由
    const blogData = handleBlogRouter(req, res) => {
        if (blogData) {
            res.end(JSON.stringify(blogData)
            return
        }
    }
    // 处理 user 路由
    const userData = handleUserRouter(req, res) => {
        if (userData) {
            res.end(JSON.stringify(userData)
            return
        }
    }
    // 404
    res.writeHead(404, {"Content-type": "text/plain"})
    res.write("404 Not Found\n")
    res.end()
}
```

## 三、项目开发之数据存储

### 创建数据库

在实现 API 之后就是连接数据库，返回真实数据到客户端啦。个人感觉在官网下载安装比 homebrew 安装来得方便。可以参考[MySQL 安装教程](https://zhuanlan.zhihu.com/p/37152572)。

图形化界面管理工具我用的是 Navicat。和公司后端同事一致，这样有不懂的地方可以问嘛。

### 创建表和设计表

![[MOZilD.png]](https://s2.ax1x.com/2019/11/24/MOZilD.png)

![](https://s2.ax1x.com/2019/11/24/MOVOOJ.png)

![](https://s2.ax1x.com/2019/11/24/MOVLy4.png))

其中两个表的 ID 是自增 key

### node.js 连接 MySQL

- 首先，先安装执行 **npm install mysql**
- 然后在./db 中创建 mysql.js

```js
// mysql.js
const mysql = require('mysql')
const { MYSQL_CONF } = require('../config/db')

console.log(MYSQL_CONF)

// 创建链接对象
const connection = mysql.createConnection(MYSQL_CONF)

connection.connect()

function exec(sql) {
  const promise = new Promise((reslove, reject) => {
    connection.query(sql, (err, res) => {
      if (err) {
        reject(err)
        return
      }
      reslove(res)
    })
  })
  return promise
}

module.exports = {
  exec
}
```

- exec(...)是封装来做发送 sql 语句并接收返回结果的逻辑，由于是异步操作所以用到 promise。对于的路由文件和 app.js 文件都需要更改一下

- 其中 MySQL 的配置由抽离至./config/db.js 中，便于处理开发和生产环境的配置。

```js
const env = process.env.NODE_ENV // 环境参数

// 配置
let MYSQL_CONF

if (env === 'dev') {
  // mysql
  MYSQL_CONF = {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'myblog'
  }
}

if (env === 'production') {
  // mysql
  MYSQL_CONF = {
    host: 'localhost',
    user: 'root',
    password: 'Mysql_2018',
    port: '3306',
    database: 'myblog'
  }
}

module.exports = {
  MYSQL_CONF,
  REDIS_CONF
}
```

## 项目开发之数据库增删改查

在所有的增删改查之前得先创建一个 controller 文件夹，里面分别有 user.js 和 blog.js 对应两个部分的 SQL 操作。
还需要创建./model/resModel.js 是负责返回信息的模型。

在各个代码块中部分重复代码省略，主要是 export 或 import。

### model

```js
class BaseModel {
  constructor(data, message) {
    if (typeof data === 'string') {
      this.message = data
      data = null
      message = null
    }
    if (data) {
      this.data = data
    }
    if (message) {
      this.message = message
    }
  }
}

class SuccessModel extends BaseModel {
  constructor(data, message) {
    super(data, message)
    this.errno = 0
  }
}

class ErrorModel extends BaseModel {
  constructor(data, message) {
    super(data, message)
    this.errno = -1
  }
}

module.exports = {
  SuccessModel,
  ErrorModel
}
```

### 增

```js
// src/router/blog.js
// ...部分代码省略
if (method === 'POST' && req.path === '/api/blog/new') {
  req.body.author = '测试作者' // 由于还未完成登录功能先用假数据代替
  return newBlog(req.body)
    .then(blogData => {
      return new SuccessModel(blogData, '新建成功')
    })
    .catch(err => {
      return new ErrorModel(err, '请求失败')
    })
}
// ...部分代码省略
```

```js
// src/controller/blog.js
const { exec } = require('../db/mysql')
const newBlog = (blogData = {}) => {
  try {
    let { title, content, author } = blogData
    let sql = `
                INSERT INTO blog(title, content, createtime, author)
                VALUES('${title}','${content}','${new Date().getTime()}','${author}')
            `
    // 这里有个小技巧 批量插入时SQL语句可以这样写
    // INSERT INTO blog(title,content,createtime,author) VALUES('批量插入标题1','批量插入内容1','1574684282822','批量插入作者1'),('批量插入标题2','批量插入内容2','1574684328385','批量插入作者2')
    return exec(sql)
  } catch (error) {
    return new Promise((resolve, reject) => {
      reject(error)
    })
  }
}
module.exports = {
  newBlog
}
```

### 删

```js
// src/router/blog.js
// ...部分代码省略
if (method === 'POST' && req.path === '/api/blog/del') {
  req.body.author = '测试作者' // 由于还未完成登录功能先用假数据代替,完成登录后需要验证才能删除
  return deleteBlog(req.body)
    .then(updateData => {
      if (updateData.affectedRows > 0) {
        return new SuccessModel(true, '请求成功')
      } else {
        return new ErrorModel(false, '请求失败')
      }
    })
    .catch(err => {
      return new ErrorModel(JSON.stringify(err), '请求失败')
    })
}
// ...部分代码省略
```

```js
// src/controller/blog.js
// ...部分代码省略
const deleteBlog = (blogData = {}) => {
  try {
    let { id, author } = blogData
    let sql = `UPDATE blog set state=0 WHERE id='${id}' and author='${author}'`
    // 在实际操作中通常是软删，即改变某一标识为状态的字段
    return exec(sql)
  } catch (error) {
    return new Promise((resolve, reject) => {
      reject(error)
    })
  }
}
// ...部分代码省略
```

### 改

```js
// src/router/blog.js
// ...部分代码省略
if (method === 'POST' && req.path === '/api/blog/update') {
  return updateBlog(req.body)
    .then(updateData => {
      if (updateData.affectedRows > 0) {
        return new SuccessModel(true, '请求成功')
      } else {
        return new ErrorModel(false, '请求失败')
      }
    })
    .catch(err => {
      return new ErrorModel(JSON.stringify(err), '请求失败')
    })
}
// ...部分代码省略
```

```js
// src/controller/blog.js
// ...部分代码省略
const updateBlog = (blogData = {}) => {
  try {
    let { title, content, id } = blogData
    let sql = `UPDATE blog set title='${title}', content='${content}' WHERE id='${id}'`
    return exec(sql)
  } catch (error) {
    return new Promise((resolve, reject) => {
      reject(error)
    })
  }
}
// ...部分代码省略
```

### 查

```js
// src/router/blog.js
// ...部分代码省略
if (method === 'GET' && req.path === '/api/blog/list') {
  let author = req.query.author || ''
  let keyword = req.query.keyword || ''
  const result = getList(author, keyword)
  return result
    .then(listData => {
      return new SuccessModel(listData, '请求成功')
    })
    .catch(err => {
      return new ErrorModel(err, '请求失败')
    })
}
// ...部分代码省略
```

```js
// src/controller/blog.js
// ...部分代码省略
const getList = (author, keyword) => {
  let sql = `SELECT * from blog where 1=1 and state=1 `
  // 此处的 1=1 是为兼容了where后面必须接有一个条件的语法，同时筛选state=1的，即未删除的
  if (author) {
    sql += `and author='${author}'`
  }
  if (keyword) {
    sql += `and title like '%${keyword}%'`
  }
  sql += `order by createtime desc`
  return exec(sql)
}
// ...部分代码省略
```

### curd

```mysql
-- SHOW TABLES

-- 增 -- INSERT INTO user(userName,password,realName) VALUES('pok','123','博'),('shum','123','沈')

-- 查 -- SELECT * FROM user

-- 条件查询 -- SELECT id,userName FROM user -- SELECT * FROM user WHERE userName='pok' AND id=5 -- SELECT * FROM user WHERE userName='pok' OR id=3 -- 不等于条件 -- SELECT * FROM user WHERE state <> 0

-- 模糊查询 -- SELECT * FROM user WHERE userName LIKE '%p%'

-- 倒序排序（正序去掉desc） -- SELECT * FROM user WHERE password LIKE '%1%' ORDER BY id DESC

-- 更新 -- UPDATE user set realName='李四2' WHERE userName='lisi'

-- 硬删 -- DELETE FROM user WHERE userName='lisi'

-- 软删 -- UPDATE user set state=0 WHERE userName='lisi'
```

## 项目开发之登录功能

登陆验证采取的是 cookie 加 redis 方案，所以先做好 redis 的环境准备。

### 安装 redis

```sh
brew install redis // 安装redis
npm install redis // 项目引入redis依赖

redis server // 启动redis 服务
redis-cil // 启动redis 操作界面
```

redis 的存储格式是键值对 和 json 类似。

```
redis-cli
127.0.0.1:6379> set myName name
OK
127.0.0.1:6379> get myName
"name"
127.0.0.1:6379> del myName
(integer) 1
127.0.0.1:6379>
```

![redis连接成功如图](https://s2.ax1x.com/2019/12/01/QeaeiR.png)

### nodejs 连接 redis

首先在 src/config/db.js 中添加 redis 的配置

```js
// src/config/db.js
const env = process.env.NODE_ENV // 环境参数

// 配置
let MYSQL_CONF
let REDIS_CONF

if (env === 'dev') {
  // mysql
  MYSQL_CONF = {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'myblog'
  }

  // redis
  REDIS_CONF = {
    port: 6379,
    host: '127.0.0.1'
  }
}

if (env === 'production') {
  // mysql
  MYSQL_CONF = {
    host: 'localhost',
    user: 'root',
    password: 'Mysql_2018',
    port: '3306',
    database: 'myblog'
  }

  // redis
  REDIS_CONF = {
    port: 6379,
    host: '127.0.0.1'
  }
}

module.exports = {
  MYSQL_CONF,
  REDIS_CONF
}
```

然后封装 redis 存和取的函数，所以在 src/db 中新建 redis.js 文件

[node_redis 文档](https://github.com/NodeRedis/node_redis)

```js
const redis = require('redis')
const { REDIS_CONF } = require('../config/db')

const redisClient = redis.createClient(REDIS_CONF.port, REDIS_CONF.host)
// 错误处理
redisClient.on('error', err => {
  console.error(err)
})

function set(key, val) {
  if (typeof val === 'object') {
    val = JSON.stringify(val)
  }
  redisClient.set(key, val, redis.print)
}

function get(key) {
  const promise = new Promise((resolve, rejcet) => {
    redisClient.get(key, (err, val) => {
      if (err) {
        rejcet(err)
        return
      }
      try {
        resolve(JSON.parse(val))
      } catch (error) {
        resolve(val)
      }
    })
  })
  return promise
}

module.exports = {
  set,
  get
}
```

然后就去改造 app.js 的 serverHandle，主要是加入 cookie 和 session 的解析

```js
// ... 部分代码省略

const serverHandle = (req, res) => {
  // 设置返回格式JSON
  res.setHeader('Content-type', 'application/json')

  // 获取path
  const url = req.url
  req.path = url.split('?')[0]

  // 解析query
  req.query = querystring.parse(url.split('?')[1])

  // 解析 cookie
  req.cookie = {}
  const cookieStr = req.headers.cookie || '' // k1=v1;k2=v2;k3=v3
  cookieStr.split(';').forEach(item => {
    if (!item) {
      return
    }
    const arr = item.split('=')
    const key = arr[0].trim()
    const val = arr[1].trim()
    req.cookie[key] = val
  })

  // 解析session
  let needSetCookie = false
  let userId = req.cookie.userId
  if (!userId) {
    needSetCookie = true
    userId = `${Date.now()}_${Math.random()}`
    // 初始化 redis 中的 session 值
    set(userId, {})
  }
  // 获取 session
  req.sessionId = userId
  get(req.sessionId)
    .then(sessionData => {
      console.log(sessionData)
      if (sessionData === null) {
        set(req.sessionId, {})
        req.session = {}
      } else {
        req.session = sessionData
      }
      return getPostData(req)
    })
    .then(postData => {
      req.body = postData

      // 处理blog路由
      const blogResult = handlerBlogRouter(req, res)
      if (blogResult) {
        return blogResult
          .then(blogData => {
            if (needSetCookie) {
              res.setHeader('Set-Cookie', `userId=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
            }
            res.end(JSON.stringify(blogData))
            return
          })
          .catch(err => {
            throw err
          })
      }

      // 处理user路由
      const userResult = handleUserRouter(req, res)
      if (userResult) {
        return userResult
          .then(userData => {
            if (needSetCookie) {
              res.setHeader('Set-Cookie', `userId=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
            }
            res.end(JSON.stringify(userData))
            return
          })
          .catch(err => {
            throw err
          })
      }

      // 未命中路由返回404
      res.writeHead(404, { 'Content-type': 'text/plain' })
      res.write('404 Not Found\n')
      res.end()
    })
    .catch(err => {
      throw err
    })
}
```

这个有个知识点就是在设置 cookie 时得设置为 http-only 和过期时间

```js
 res.setHeader('Set-Cookie', `userId=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
            }
```

然后再去写登陆的 router 和 controller

```js
// router/user.js
const handleUserRouter = (req, res) => {
  const method = req.method
  // console.log('req', req)
  if (method === 'POST' && req.path === '/api/user/login') {
    if (req.body) {
      const { userName, password } = req.body
      return login(userName, password)
        .then(loginData => {
          if (loginData[0].userName) {
            req.session.userName = loginData[0].userName
            req.session.realName = loginData[0].realName
            set(req.sessionId, req.session)
            return new SuccessModel(loginData[0], '登录成功')
          } else {
            return new ErrorModel(loginData[0], '登录失败')
          }
        })
        .catch(err => {
          return new ErrorModel(err, '登录失败')
        })
    }
  }
}
```

```js
// controller/user.js
const login = (userName, password) => {
  try {
    let sql = `
            select userName, realName from user where username='${userName}' and password='${password}'
        `
    return exec(sql)
  } catch (error) {
    return new Promise((resolve, reject) => {
      return reject(error)
    })
  }
}
```

这样登陆及登陆验证就完成了，然后得在博客相关的路由中的增删改接口中加入校验登陆功能。

```js
// 统一的登录验证函数,不通过返回尚未登陆
const loginCheck = req => {
  if (!req.session.userName) {
    return Promise.resolve(new ErrorModel('尚未登录'))
  }
}
```

## 项目开发之日志记录

现在先做简单的日志记录，后面用框架的时候在改造

首先需要了解 stream 的概念

Node.js 中有四种基本的流类型：

- Writable - 可写入数据的流（例如 fs.createWriteStream()）。
- Readable - 可读取数据的流（例如 fs.createReadStream()）。
- Duplex - 可读又可写的流（例如 net.Socket）。
- Transform - 在读写过程中可以修改或转换数据的 Duplex 流（例如 zlib.createDeflate()）。

此外，该模块还包括实用函数 stream.pipeline()、stream.finished() 和 stream.Readable.from()。

然后在 src/utils 中新建 log.js

```js
// src/utils/log.js
const fs = require('fs')
const path = require('path')

function writeLog(writeStream, log) {
  writeStream.write(log + '\n')
}

// 生成writestream
function createWriteStream(fileName) {
  const fullFileName = path.join(__dirname, '../', '../', 'logs', fileName)
  console.log(fullFileName)
  const writeStream = fs.WriteStream(fullFileName, {
    flags: 'a'
  })
  return writeStream
}

// 写访问日志
const accessWriteStream = createWriteStream('access.log')
function access(log) {
  writeLog(accessWriteStream, log)
}

module.exports = {
  access
}
```

在 app.js 的 serverHandler 中写入浏览器信息

```js
// ... 部分代码省略
const { access } = require('./src/utils/log')
const serverHandle = (req, res) => {
  // 记录accesslog
  access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${Date.now()}`)
  // ...部分代码省略
}
```

## 项目开发之安全

### 安全分三部分：

- 防止 sql 注入
- 防止 xss 攻击
- 密码加密

### 防止 sql 注入

sql 注入即用户提交的数据中含有 sql 语句，数据被解析时当成 sql 语句被执行了。

node_mysql 包中含有暴露出来的 escape 方法。所以先在 src/db/mysql.js 中 export 出去

```js
// src/db/mysql.js
// ... 部分代码省略
module.exports = {
  exec,
  escape: mysql.escape
}
```

然后在处理 sql 语句的 controller 中引入使用，以 user.js 为例

```js
const { exec, escape } = require('../db/mysql')

const login = (userName, password) => {
  try {
    // 在sql语句接收变量的时再用escape去处理一下，这时就不需要带引号了
    let sql = `
            select userName, realName from user where username=${escape(userName)} and password=${escape(password)}
        `
    return exec(sql)
  } catch (error) {
    n
    return new Promise((resolve, reject) => {
      return reject(error)
    })
  }
}
```

### 防止 xss 攻击

HTML 是一种超文本标记语言，通过将一些字符特殊地对待来区别文本和标记，例如，小于符号（<）被看作是 HTML 标签的开始，<title>与</title>之间的字符是页面的标题等等。当动态页面中插入的内容含有这些特殊字符（如<）时，用户浏览器会将其误认为是插入了 HTML 标签，当这些 HTML 标签引入了一段 JavaScript 脚本时，这些脚本程序就将会在用户浏览器中执行。所以，当这些特殊字符不能被动态页面检查或检查出现失误时，就将会产生 XSS 漏洞。

所以我们引入 xss 包去处理 sql 语句

```sh
npm install xss -S
```

以文章列表为例

```js
const newBlog = (blogData = {}) => {
  try {
    let { title, content, author } = blogData
    let sql = `
            INSERT INTO blog(title, content, createtime, author)
            VALUES('${xss(title)}','${content}','${new Date().getTime()}','${author}')
        `
    return exec(sql)
  } catch (error) {
    return new Promise((resolve, reject) => {
      reject(error)
    })
  }
}
```

### 密码加密

node 中有专门加密的模块--crypto。目的就是不在数据库里存明文密码

```js
// src/utils/cryp.js
const crypto = require('crypto')

// 密钥
const SECRET_KEY = 'WJiol_8776#'

// md5加密
function md5(content) {
  let md5 = crypto.createHash('md5')
  return md5.update(content).digest('hex')
}

// 加密函数
function genPwd(password) {
  const str = `password=${password}&key=${SECRET_KEY}`
  return md5(str)
}
module.exports = {
  genPwd
}
```

```js
// src/controller/user.js
const login = (userName, password) => {
  try {
    password = genPwd(password)
    password = escape(password)
    let sql = `
            select userName, realName from user where username=${escape(userName)} and password=${password}
        `
    return exec(sql)
  } catch (error) {
    return new Promise((resolve, reject) => {
      return reject(error)
    })
  }
}
```
