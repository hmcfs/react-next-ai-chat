# 阿里云 OSS 文档预览 Content-Disposition 问题

## 问题描述

浏览器为安全考虑，预览 Word、Excel 等文档时（非浏览器原生提供的解析 API），会限制其内容，需要下载后才能查看完整内容。

在上传阿里云 OSS 时，设置请求头 `Content-Disposition` 为 `inline`，但阿里云 OSS 为安全考虑，不接受外来请求头设置，会强行将 `Content-Disposition` 设置为 `attachment`，导致文档无法预览。

## 根因分析

- 浏览器安全策略限制非原生文档类型的直接预览
- 阿里云 OSS 安全机制会覆盖自定义的 `Content-Disposition` 请求头
- `attachment` 会强制浏览器下载而非内联展示

## 解决方案

（待补充具体解决方案）

## 注意事项

- 上传文档到 OSS 时需注意 Content-Disposition 的设置方式
- 如需在线预览，考虑使用文档预览服务或转换为浏览器原生支持的格式
