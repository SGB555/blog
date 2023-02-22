---
title: JSBridge简析
date: 2020-05-11 17:09:11
tags: JS
---

# 前言

在公司中，一直是独立负责一个 Cordova+vue 为技术栈的移动端，之前有稍微了解过 JSBridge 的概念，同时面试中也有涉及到所以记录下来。

# 概念

JSBridge，字面意思则是 JavaScript 桥，也就是连接 JS 和 Native 端的桥梁。实际上就是两者之间的通信方式。简单的说，JSBridge 就是定义 Native 和 JS 的通信,Native 只通过一个固定的桥对象调用 JS,JS 也只通过固定的桥对象调用 Native。JSBridge 另一个叫法及大家熟知的 Hybrid app 技术。

## H5 调用 NA 方法梳理

|      平台      |                    方法                    |         备注         |
| :------------: | :----------------------------------------: | :------------------: |
|    Android     |          shouldOverrideUrlLoading          |   scheme 拦截方法    |
|    Android     |           addJavascriptInterface           |         API          |
|    Android     | onJsAlert()、onJsConfirm()、onJsPrompt（） |         API          |
|      IOS       |                  拦截 URL                  |                      |
| IOS(UIwebview) |               JavaScriptCore               | API 方法，IOS7+ 支持 |
| IOS(WKwebview) |       window.webkit.messageHandlers        | APi 方法，IOS8+支持  |

## NA 调用 H5 方法梳理

|      平台      |                  方法                  |         备注         |
| :------------: | :------------------------------------: | :------------------: |
|    Android     |               loadurl()                |                      |
|    Android     |          evaluateJavascript()          |    Android 4.4 +     |
| IOS(UIwebview) | stringByEvaluatingJavaScriptFromString |                      |
| IOS(UIwebview) |             JavaScriptCore             | API 方法，IOS7+ 支持 |
| IOS(WKwebview) |  evaluateJavaScript:javaScriptString   | APi 方法，IOS8+支持  |

## 目前有两种主要的通信方式：

通过上面两端调用方法梳理表，不难分析出，URL 拦截 & 注入 API 是 安卓和 IOS 比较通用且兼容性较好的方案

1. url scheme
2. 注入 API

# url scheme

**url scheme**是一种类似 url 的连接，是为了方便 app 直接互相调用设计的，形式和普通的 url 近似。

以普通网页和 iOS 上的微信作对比：

|                   |           网页            |        应用         |
| :---------------: | :-----------------------: | :-----------------: |
| 网站首页/打开应用 |   http://www.apple.com    |      weixin://      |
|  子页面/具体功能  | http://www.apple.com/mac/ | weixin://dl/moments |

而我们实际开发中，app 不会注册对应的 scheme，而是由 web 页面通过某种方式触发 scheme（如 iframe.src），然后 Native 用某种方式捕获 url 后触发相应事件

## 设计一个 Native 和 JS 交互的全局桥对象

将一个对象挂载到全局对象 window 上，其拥有 3 个方法，3 个变量。

![](https://s1.ax1x.com/2020/05/14/YDrmyd.png)

```JS
class JsBridge() {
    constructor() {
        this.uniqueId = 1 // 唯一ID
        this.responseCallbacks = {} // 回调函数集合，原生调用了对应API后根据回调ID调用回调函数
        this.messageHandlers = {} // 本地注册的方法集合，只有在本地注册的方法才允许原生调用
    }
    // JS端注册本地JS方法，注册后Native可以通过全局对象访问并调用到。
    registerHandlers(handlerName,handler) {
        this.messageHandlers[handlerName] = handler
    }
    /**
    * @description JS通知Native调用对应api
    * @param {String} handleName Native函数名
    * @param {Object} data Native函数所需参数
    * @param {Function} responseCallback Native调用后的回调
    */
    callHandler(handleName,data,responseCallback) {
        if(responseCallback && typeof responseCallback === 'function'){
            this.uniqueId++
            const callbackId = 'cb_'+(uniqueId++)+'_'+new Date().getTime()
            this.responseCallbacks[callbackId] = responseCallback
        }
        // url scheme的格式如
        // 基本有用信息就是后面的callbackId,handlerName与data
        // 原生捕获到这个scheme后会进行分析
        const uri = `://CUSTOM_PROTOCOL_SCHEME:${callbackId}/${handlerName}?${JSON.stringify(data)}`

        //创建隐藏iframe过程
        const messagingIframe = document.createElement('iframe')
        messagingIframe.style.display = 'none'
        document.documentElement.appendChild(messagingIframe)

        //触发scheme
        messagingIframe.src = uri;
    }
    /**
    * @description Native调用，通过这个方法返回或者回调JS方法
    * @param {JSON} messageJSON 如果是通知JS进行回调那么key值为：responseID、responseData；如果是主动调用JS方法那么key值为：handleName、data、callbackId
    */
    _handleMessageFromNative(messageJSON) {
        const message = JSON.parse(messageJSON)
        let messageHanlder
        let responseCallback
        // 如果是通知JS进行回调那么key值为：responseID、responseData；
        if(message.responseId){
            responseCallback = this.responseCallbacks[message.responseId]
            if (!responseCallback) {
                return;
            }
            responseCallback(message.responseData);
            delete this.responseCallbacks[message.responseId];
        } else {
            // 如果是主动调用JS方法那么key值为：handleName、data、callbackId
            if(message.callbackId){
                const callbackResponseId = message.callbackId
                this.messageHandlers[callbackId]()
            }
        }
    }
}
window.JSbridge = new JsBridge()
```

## JS 调用 Native

```JS
// 假设Native函数名为testObjcCallback
const handleName = 'testObjcCallback'
const data = { foo: 'bar' }
const cb = () => {
  console.log('JS calling handler "testObjcCallback"')
}
window.JSBridge.callHandler(handleName, data, cb)
```

此时就会使用内部早就创建好的一个隐藏 iframe 来触发 scheme，不同的平台有有其各自的捕获 API

### Android

在 Android 中(WebViewClient 里),通过 shouldoverrideurlloading 可以捕获到 url scheme 的触发。

```java
public boolean shouldOverrideUrlLoading(WebView view, String url){
    //如果返回false，则WebView处理链接url，如果返回true，代表WebView根据程序来执行url
    return true;
}
```

### ios

```objc
(BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
    NSURL *url = [request URL];

    NSString *requestString = [[request URL] absoluteString];
    //获取利润url scheme后自行进行处理

```

## Native 调用 JS

```JS
JSBridge._handleMessageFromNative(messageJSON)
```

## 更完善方案

github 上有一个开源项目,它里面的 JSBridge 做法在 iOS 上进一步优化了,所以参考他的做法,这里进一步进行了完善。地址：[marcuswestin/WebViewJavascriptBridge](https://github.com/marcuswestin/WebViewJavascriptBridge)

## 优缺点

- 优点：兼容性强
- 缺点：使用 iframe.src 发送 URL SCHEME 会有 url 长度的隐患

# 注入 API

基于**Webview**提供的能力，我们可以向 window 上注入对象或方法。JS 通过这个对象或方法进行调用时，执行对应的逻辑操作，可直接调用 Native 的方法。使用该方式时，JS 需要等到 Native 执行完对应的逻辑后才能进行回调里面的操作。

## JS 调用 Native

### Android

Android 的 **Webview** 提供了 addJavascriptInterface 方法，支持 Android4.2 及以上的系统。

```java
gpcWebView.addJavascriptInterface(new JavaScriptInterface(), 'nativeApiBridge');
public class JavaScriptInterface {
	Context mContext;

  JavaScriptInterface(Context c) {
    mContext = c;
  }

  public void share(String webMessage){
    // Native 逻辑
  }
}
```

JS 调用示例：

```js
window.NativeApi.share()
```

### ios

iOS 的 UIWebview 提供了 JavaScriptScore 方法，支持 iOS 7.0 及以上系统。WKWebview 提供了 window.webkit.messageHandlers 方法，支持 iOS 8.0 及以上系统。UIWebview 在几年前常用，目前已不常见。以下为创建 WKWebViewConfiguration 和 创建 WKWebView 示例：

```swift
WKWebViewConfiguration *configuration = [[WKWebViewConfiguration alloc] init];
WKPreferences *preferences = [WKPreferences new];
preferences.javaScriptCanOpenWindowsAutomatically = YES;
preferences.minimumFontSize = 40.0;
configuration.preferences = preferences;


- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    [self.webView.configuration.userContentController addScriptMessageHandler:self name:@"share"];
  	[self.webView.configuration.userContentController addScriptMessageHandler:self name:@"pickImage"];
}
- (void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
    [self.webView.configuration.userContentController 	removeScriptMessageHandlerForName:@"share"];
    [self.webView.configuration.userContentController removeScriptMessageHandlerForName:@"pickImage"];
}
```

JS 调用示例：

```js
window.webkit.messageHandlers.share.postMessage(xxx)
```

## Native 调用 JS

Native 调用 JS 比较简单，只要 H5 将 JS 方法暴露在 Window 上给 Native 调用即可。
Android 中主要有两种方式实现。在 4.4 以前，通过 loadUrl 方法，执行一段 JS 代码来实现。在 4.4 以后，可以使用 evaluateJavascript 方法实现。loadUrl 方法使用起来方便简洁，但是效率低无法获得返回结果且调用的时候会刷新 WebView。evaluateJavascript 方法效率高获取返回值方便，调用时候不刷新 WebView，但是只支持 Android 4.4+。

### Android

```java

webView.loadUrl("javascript:" + javaScriptString);
webView.evaluateJavascript(javaScriptString, new ValueCallback<String>() {
  @Override
  public void onReceiveValue(String value){
    xxx
  }
});
```

### ios

iOS 在 WKWebview 中可以通过 evaluateJavaScript:javaScriptString 来实现，支持 iOS 8.0 及以上系统。

```swift
func evaluateJavaScript(_ javaScriptString: String,
  completionHandler: ((Any?, Error?) -> Void)? = nil)
// javaScriptString 需要调用的 JS 代码
// completionHandler 执行后的回调
```
