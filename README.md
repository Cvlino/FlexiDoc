
一个强大的纯前端在线文档格式转换工具，支持多种常见文件格式之间的相互转换，所有文件处理均在浏览器本地完成，保护您的隐私安全。

<img width="1419" height="1187" alt="image" src="https://github.com/user-attachments/assets/38f8b917-7ad9-4f85-8510-bdad9e590846" />


## ✨ 功能特性

- 🎯 **多格式支持**：支持 DOCX、PDF、XLSX、CSV、Markdown、HTML、TXT、PNG、JPG、JSON 等 10+ 种格式
- 🔄 **丰富的转换路径**：提供 25+ 条转换路径，满足各种文档转换需求
- 🔒 **隐私安全**：所有文件均在浏览器本地处理，无需上传至服务器
- 📱 **响应式设计**：完美适配桌面端与移动端设备
- 🎨 **现代化 UI**：简洁美观的用户界面，四步完成文件转换
- ⚡ **快速高效**：基于 Web Assembly 和 Canvas API 实现高性能转换

---

## 📋 支持的格式转换

### 办公文档
| 源格式 | 支持转换目标 |
|--------|--------------|
| 📄 DOCX | PDF、HTML、Markdown、TXT |
| 📕 PDF | DOCX、TXT、PNG、JPG |

### 电子表格
| 源格式 | 支持转换目标 |
|--------|--------------|
| 📊 XLSX | CSV、JSON、PDF |
| 📋 CSV | XLSX、JSON |
| 🔧 JSON | CSV、XLSX |

### 文本格式
| 源格式 | 支持转换目标 |
|--------|--------------|
| 📝 Markdown | HTML、PDF、DOCX |
| 🌐 HTML | PDF、Markdown、TXT |
| 📃 TXT | PDF、HTML、Markdown |

### 图片格式
| 源格式 | 支持转换目标 |
|--------|--------------|
| 🖼️ PNG | PDF、JPG |
| 📷 JPG | PDF、PNG |

---

## 🚀 快速开始

### 在线使用

可直接点进链接进行预览体验：
- 🔗(https://flexibledoc.netlify.app/)

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/Cvlino/flexidoc.git

# 进入项目目录
cd flexidoc

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

---

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **构建工具**: Vite 5
- **PDF 处理**: PDF.js
- **Word 处理**: Mammoth.js、docx
- **Excel 处理**: SheetJS (xlsx)
- **PDF 生成**: html2pdf.js、jsPDF
- **样式**: Tailwind CSS 风格

---

## 📁 项目结构

```
flexidoc/
├── src/
│   ├── components/          # Vue 组件
│   │   ├── FileUploader.vue     # 文件上传组件
│   │   ├── FormatSelector.vue   # 格式选择组件
│   │   ├── FilePreview.vue      # 文件预览组件
│   │   └── ConversionProgress.vue # 转换进度组件
│   ├── converters/          # 转换器模块
│   │   ├── base.ts              # 转换器基类
│   │   ├── basic.ts             # 基础格式转换器
│   │   ├── pdf.ts               # PDF 转换器
│   │   ├── docx.ts              # Word 转换器
│   │   ├── xlsx.ts              # Excel 转换器
│   │   └── index.ts             # 转换器注册
│   ├── types/               # TypeScript 类型定义
│   ├── utils/               # 工具函数
│   ├── App.vue              # 主应用组件
│   ├── main.ts              # 应用入口
│   └── style.css            # 全局样式
├── index.html               # HTML 模板
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
└── package.json             # 项目依赖
```

---

## 📖 使用说明

1. **上传文件**：点击上传区域或拖拽文件至上传框
2. **选择格式**：从下拉列表中选择目标格式
3. **预览确认**：查看源文件信息和目标格式
4. **转换下载**：点击转换按钮，等待完成后下载结果

---

## 🌟 核心技术亮点

### 插件化转换器架构
设计了灵活的转换器注册机制，通过 `ConversionManager` 统一管理所有转换器，支持动态扩展新格式。

### PDF 深度处理
基于 PDF.js 实现高质量的 PDF 解析，支持文本提取、样式分析（标题层级、对齐方式、字体样式）。

### 中文字符支持
针对中文文档转换，采用 html2pdf.js 方案确保中文字符正确渲染，避免乱码问题。

### 零服务端依赖
所有转换逻辑均在前端实现，无需后端服务支持，部署简单，隐私安全。

---

## 📝 开发日志

### v1.0.0
- ✅ 支持 10 种文件格式
- ✅ 实现 25+ 转换路径
- ✅ 纯前端文件处理
- ✅ 响应式 UI 设计

---

## 📄 许可证

MIT License

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**FlexiDoc** - 让文档转换更简单 🚀
