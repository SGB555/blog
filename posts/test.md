---
title: 10分钟搭建hexo博客
date: 2018-05-01 22:51:58
tags: hexo
---

**前言:**
信息社会，每天都在阅读大量的文章，汲取大量的知识，但是总觉得记不住，所以通过博客来记录吧！那么第一篇当然是记录搭建博客啦~

**流程:**
1. 安装Node环境
2. 安装git
3. 注册github账号
4. 安装与配置hexo
5. 生成SSH keys 并添加到github
6. 绑定个人域名

### 搭建node环境
> hexo是基于node.js快速搭建博客的框架

在node官网：https://nodejs.org/en/download/,  根据不同的操作系统下载相应版本即可
我使用的是mac环境，所以这里以mac环境为例，window环境也大同小异。
如有疑问可以查看安装教程 https://www.runoob.com/nodejs/nodejs-install-setup.html
建议下载最新稳定版。

![](https://ws1.sinaimg.cn/large/80676d79gy1fqw98fjgw2j20t50l50vx.jpg)

下载过后在终端输入
```shh
node -v
```
![](https://ws1.sinaimg.cn/large/80676d79gy1fqw9gl9yjkj20ow08o750.jpg)
如上图出现版本号即说明安装成功

同时建议安装node版本管理工具 n 或者 nvm.因为实际项目开发的时候，有需要和其他同事统一版本，而自身又想要尝新的时候，版本管理就很有用处了

#### 安装n
```ssh
npm -g install n
```
![](https://ws1.sinaimg.cn/large/80676d79gy1frc9hkvwo0j20ef0270su.jpg)

如上图出现版本号即说明安装成功

n 版本管理器常用操作
```ssh
n //输出已安装的node版本
n latest //安装最新的node版本
n --latest //输出可安装的最新node版本
n stable //输出最稳定且最新的node版本
n --stable //输出可安装的最稳定且最新的node版本
n <version> //安装某个node版本
n rm <version ...> //删除某个node版本
```
### 安装git
通过brew安装git,命令如下:

```ssh
brew install git
```
[廖雪峰大神GIT安装教程][1]
  [1]: https://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000/00137396287703354d8c6c01c904c7d9ff056ae23da865a000

基本上没有什么困难。

### 注册github账号

![](https://ws1.sinaimg.cn/large/80676d79gy1frcaf2dkx4j20ns0i2tba.jpg)

![](https://ws1.sinaimg.cn/large/80676d79gy1frcaf2ozpdj20mp0eyjtx.jpg)
填入相关信息之后选择公共免费仓库即可

#### 创建仓库
![](https://ws1.sinaimg.cn/large/80676d79gy1frcaiti338j208v04waaa.jpg)

点击右上角加号选择创建新仓库

![](https://ws1.sinaimg.cn/large/80676d79gy1frcaljqyunj20jm0emtai.jpg)

这边仓库名必须与用户名相同，否则无法搭建。格式最好为：userName.github.io

![](https://ws1.sinaimg.cn/large/80676d79gy1frcaxm8kiwj20tc0bkac7.jpg)
创建过后来到这个页面说明已经创建成功。
基本上搭建hexo博客的环境就基本完成搭建了。

### 安装与配置hexo
接下来是安装hexo
#### 安装hexo
![](https://ws1.sinaimg.cn/large/80676d79gy1frcb0l3jknj211x0eb40m.jpg)
正如官网首页所提示 直接复制命令运行
```ssh
npm install hexo-cli -g
hexo init blog
cd blog
npm install
hexo server
```
![](https://ws1.sinaimg.cn/large/80676d79gy1fsmlp5lm4jj21400p0154.jpg)
启动本地服务器后的效果
新建完成后，指定文件夹的目录如下：
```
.
├── _config.yml
├── package.json
├── scaffolds
├── source
|   ├── _drafts
|   └── _posts
└── themes
```
#### 配置hexo
我们可以在_config.yml文件中修改博客配置

参数 | 配置 |  
- | :-: | 
title | 网站标题
subtitle | 网站副标题
description | 网站描述
author | 您的名字
language | 网站使用的语言
timezone | 网站时区。Hexo 默认使用您电脑的时区。时区列表。比如说：America/New_York, Japan, 和 UTC 。

**最重要的是：** 配置部署地址

```json
deploy:
  type: git
  //  git地址
  repo: git@github.com:SGB555/SGB555.github.io.git
  // 分支名
  branch: master
```
此时，还需安装一个用于推送至GitHub的插件，否则会推送失败
```ssh
npm install hexo-deployer-git --save
```

#### hexo常用命令

启动本地服务器
```ssh
hexo s 
```
新建文章
```
hexo new [layout] <title>
```
清除缓存
```
hexo clean
```
生成静态文件
```
hexo g
```
部署网站
```
hexo d
```
更详细的配置可以在hexo官方文档中查找，目前提供的已经足以搭建
### 生成SSH keys 并添加到Github

#### 生成SSH keys
```
ssh-keygen -t rsa -C "your_email@example.com"
```
其中 your_email@example.com 为你在 GitHub 注册时的邮箱

#### 添加到GitHub
![](https://ws1.sinaimg.cn/large/80676d79gy1fsmmcmmz85j20ut0gp0u6.jpg)
在设置中，将刚刚生成的SSH keys 粘贴至文本框
