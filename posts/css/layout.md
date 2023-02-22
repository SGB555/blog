---
title: css布局方案
date: 2020-03-17 23:38:17
tags: css
---

# 居中布局

    以下居中布局均以不定宽为前提，定宽情况包含其中

## 水平居中

![demo](https://s1.ax1x.com/2020/03/29/GVE0XV.png)

### inline-block + text-align

```css
.parent {
  text-align: center;
}
.child {
  display: inline-block;
}
```

### table + margin

```css
.child {
  display: table;
  margin: 0 auto;
}
```

### absolute + transform

```css
.parent {
  position: relative;
  height: 500px;
}
.child {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
```

如果子元素为定宽元素，则可以如下写法

```css
.parent {
  position: relative;
  height: 500px;
}
.child {
  position: absolute;
  width: 100px;
  left: 50%;
  margin-left: -50px;
}
```

### flex + justify-content

```css
.parent {
  display: flex;
  justify-content: center;
}
```

## 垂直居中

![dmeo](https://s1.ax1x.com/2020/03/29/GVEgh9.png)

### table-cell + vertical-align

```css
.parent {
  display: table-cell;
  vertical-align: middle;
}
```

### absolute + transform

```css
.parent {
  position: relative;
}
.child {
  position: absolute;
  top: 50%;
  transfrom: translateY(-50%);
}
```

### flex + align-items

```css
.parent {
  display: flex;
  align-items: center;
}
```

## 水平垂直居中

![demo](https://s1.ax1x.com/2020/03/29/GVEHtH.png)

### inline-block + table-cell + text-align + vertical-align

```css
.parent {
  text-align: center;
  display: table-cell;
  vertical-align: middle;
}
.child {
  display: inline-block;
}
```

### absolute + transform

```css
.parent {
  position: relative;
}
.child {
  position: absolute;
  top: 50%;
  left:50%
  transfrom: translate(-50%,-50%);
}
```

### flex

```css
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}
```
