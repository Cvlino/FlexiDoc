import { BaseConverter } from './base'
import type { FileFormat } from '@/types'

// PDF 转换器 - 使用 PDF.js
export class PdfConverter extends BaseConverter {
  async convert(file: File, _sourceFormat: FileFormat, targetFormat: FileFormat): Promise<Blob> {
    switch (targetFormat) {
      case 'txt':
        return this.pdfToText(file)
      
      case 'docx':
        return this.pdfToDocx(file)
      
      case 'png':
      case 'jpg':
        return this.pdfToImage(file, targetFormat)
      
      default:
        throw new Error(`PDF 不支持转换为 ${targetFormat}`)
    }
  }
  
  private async pdfToDocx(file: File): Promise<Blob> {
    const pdfjsLib = await import('pdfjs-dist')
    
    // 配置 worker 路径
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = await this.getWorkerSrc()
    }
    
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx')
    
    const arrayBuffer = await this.readFileAsArrayBuffer(file)
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    const docChildren: any[] = []
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      
      // 分析文本样式，按段落分组
      const paragraphs = this.analyzeTextContent(textContent)
      
      for (const para of paragraphs) {
        if (para.items.length === 0) continue
        
        // 根据平均字体大小判断标题级别
        const avgFontSize = para.avgFontSize
        let headingLevel: typeof HeadingLevel[keyof typeof HeadingLevel] | undefined
        
        if (avgFontSize >= 24) {
          headingLevel = HeadingLevel.HEADING_1
        } else if (avgFontSize >= 20) {
          headingLevel = HeadingLevel.HEADING_2
        } else if (avgFontSize >= 16) {
          headingLevel = HeadingLevel.HEADING_3
        }
        
        // 构建段落内容
        const textRuns = para.items.map(item => {
          const runOptions: any = {
            text: item.str,
            size: Math.round(item.fontSize * 2) // 转换为 half-points
          }
          
          // 检测粗体（基于字体名称）
          if (item.fontName && (
            item.fontName.includes('Bold') || 
            item.fontName.includes('bold') ||
            item.fontName.includes('Heavy') ||
            item.fontName.includes('Black')
          )) {
            runOptions.bold = true
          }
          
          // 检测斜体
          if (item.fontName && (
            item.fontName.includes('Italic') || 
            item.fontName.includes('italic') ||
            item.fontName.includes('Oblique')
          )) {
            runOptions.italic = true
          }
          
          return new TextRun(runOptions)
        })
        
        const paraOptions: any = {
          children: textRuns,
          spacing: { after: 200, line: 276 }
        }
        
        if (headingLevel) {
          paraOptions.heading = headingLevel
        }
        
        // 根据位置判断对齐方式
        const pageWidth = page.getViewport({ scale: 1 }).width
        const avgX = para.items.reduce((sum, item) => sum + item.x, 0) / para.items.length
        
        if (avgX > pageWidth * 0.3 && avgX < pageWidth * 0.7) {
          paraOptions.alignment = AlignmentType.CENTER
        } else if (avgX > pageWidth * 0.6) {
          paraOptions.alignment = AlignmentType.RIGHT
        }
        
        docChildren.push(new Paragraph(paraOptions))
      }
      
      // 添加分页符（最后一页不需要）
      if (pageNum < pdf.numPages) {
        docChildren.push(new Paragraph({
          children: [],
          pageBreakBefore: true
        }))
      }
    }
    
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720
            }
          }
        },
        children: docChildren
      }]
    })
    
    return Packer.toBlob(doc)
  }
  
  private analyzeTextContent(textContent: any): ParagraphInfo[] {
    const paragraphs: ParagraphInfo[] = []
    const items: TextItemInfo[] = []
    
    // 提取所有文本项及其样式信息
    for (const item of textContent.items) {
      if ('str' in item && item.str.trim()) {
        const transform = item.transform
        items.push({
          str: item.str,
          x: transform[4],
          y: transform[5],
          fontSize: Math.abs(transform[0]), // transform[0] 包含字体大小（可能有缩放）
          fontName: item.fontName || '',
          width: item.width || 0
        })
      }
    }
    
    if (items.length === 0) return paragraphs
    
    // 按 y 坐标分组（同一行的文本）
    const lines: { y: number; items: TextItemInfo[] }[] = []
    const yThreshold = 5 // y坐标差异阈值
    
    for (const item of items) {
      // 找到最近的行
      let foundLine = lines.find(line => Math.abs(line.y - item.y) < yThreshold)
      
      if (!foundLine) {
        foundLine = { y: item.y, items: [] }
        lines.push(foundLine)
      }
      
      foundLine.items.push(item)
    }
    
    // 按 y 坐标降序排序（从上到下）
    lines.sort((a, b) => b.y - a.y)
    
    // 按 x 坐标排序每行的内容
    for (const line of lines) {
      line.items.sort((a, b) => a.x - b.x)
    }
    
    // 将行合并为段落（基于间距判断）
    let currentParagraph: ParagraphInfo | null = null
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const prevLine = i > 0 ? lines[i - 1] : null
      
      // 计算与前一行间距
      const gap = prevLine ? Math.abs(prevLine.y - line.y) : 0
      
      // 如果间距较大，认为是新段落
      const isNewParagraph = !prevLine || gap > 20
      
      if (isNewParagraph) {
        if (currentParagraph) {
          paragraphs.push(currentParagraph)
        }
        currentParagraph = {
          items: line.items,
          avgFontSize: this.calculateAvgFontSize(line.items)
        }
      } else {
        // 同一段落，添加行内容
        if (currentParagraph) {
          currentParagraph.items.push(...line.items)
          currentParagraph.avgFontSize = this.calculateAvgFontSize(currentParagraph.items)
        }
      }
    }
    
    // 添加最后一个段落
    if (currentParagraph) {
      paragraphs.push(currentParagraph)
    }
    
    return paragraphs
  }
  
  private calculateAvgFontSize(items: TextItemInfo[]): number {
    if (items.length === 0) return 12
    const total = items.reduce((sum, item) => sum + item.fontSize * item.str.length, 0)
    const totalLength = items.reduce((sum, item) => sum + item.str.length, 0)
    return totalLength > 0 ? total / totalLength : 12
  }
  
  private async pdfToText(file: File): Promise<Blob> {
    const pdfjsLib = await import('pdfjs-dist')
    
    // 配置 worker 路径
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = await this.getWorkerSrc()
    }
    
    const arrayBuffer = await this.readFileAsArrayBuffer(file)
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    let fullText = ''
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      
      // 按行分组
      const lines: { y: number; items: any[] }[] = []
      let currentLine: { y: number; items: any[] } | null = null
      
      for (const item of textContent.items) {
        if ('transform' in item) {
          const y = item.transform[5]
          if (!currentLine || Math.abs(y - currentLine.y) > 5) {
            currentLine = { y, items: [item] }
            lines.push(currentLine)
          } else {
            currentLine.items.push(item)
          }
        }
      }
      
      // 按 y 坐标降序排序（从上到下）
      lines.sort((a, b) => b.y - a.y)
      
      // 按 x 坐标排序每行的内容
      for (const line of lines) {
        line.items.sort((a, b) => {
          const ax = 'transform' in a ? a.transform[4] || 0 : 0
          const bx = 'transform' in b ? b.transform[4] || 0 : 0
          return ax - bx
        })
      }
      
      // 构建文本
      for (const line of lines) {
        const text = line.items.map((item: any) => item.str).join('')
        if (text.trim()) {
          fullText += text + '\n'
        }
      }
      
      // 页面分隔
      if (i < pdf.numPages) {
        fullText += '\n--- 第 ' + i + ' 页 ---\n\n'
      }
    }
    
    return new Blob([fullText.trim()], { type: 'text/plain;charset=utf-8' })
  }
  
  private async pdfToImage(file: File, format: 'png' | 'jpg'): Promise<Blob> {
    const pdfjsLib = await import('pdfjs-dist')
    
    // 配置 worker 路径
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = await this.getWorkerSrc()
    }
    
    const arrayBuffer = await this.readFileAsArrayBuffer(file)
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    const page = await pdf.getPage(1)
    const scale = 2
    const viewport = page.getViewport({ scale })
    
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('无法创建画布上下文')
    }
    
    // 填充白色背景
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    await page.render({
      canvasContext: ctx,
      viewport
    }).promise
    
    return new Promise((resolve, reject) => {
      const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'
      const quality = format === 'jpg' ? 0.92 : undefined
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('图片转换失败'))
        }
      }, mimeType, quality)
    })
  }
  
  private async getWorkerSrc(): Promise<string> {
    return '/pdf.worker.min.mjs'
  }
}

// 辅助类型定义
interface TextItemInfo {
  str: string
  x: number
  y: number
  fontSize: number
  fontName: string
  width: number
}

interface ParagraphInfo {
  items: TextItemInfo[]
  avgFontSize: number
}

// PDF 生成器 - 从其他格式生成 PDF
export class PdfGenerator extends BaseConverter {
  async convert(file: File, sourceFormat: FileFormat, _targetFormat: FileFormat): Promise<Blob> {
    switch (sourceFormat) {
      case 'html':
        return this.htmlToPdf(file)
      
      case 'txt':
        return this.textToPdf(file)
      
      case 'md': {
        const { MarkdownConverter } = await import('./basic')
        const mdConverter = new MarkdownConverter()
        const htmlBlob = await mdConverter.convert(file, 'md', 'html')
        const htmlFile = new File([htmlBlob], 'temp.html', { type: 'text/html' })
        return this.htmlToPdf(htmlFile)
      }
      
      case 'png':
      case 'jpg':
        return this.imageToPdf(file)
      
      case 'docx': {
        return this.docxToPdf(file)
      }
      
      case 'xlsx': {
        const { XlsxConverter } = await import('./xlsx')
        const xlsxConverter = new XlsxConverter()
        const csvBlob = await xlsxConverter.convert(file, 'xlsx', 'csv')
        return this.csvToPdf(csvBlob)
      }
      
      default:
        throw new Error(`${sourceFormat} 不支持转换为 PDF`)
    }
  }
  
  private async docxToPdf(file: File): Promise<Blob> {
    // 使用 mammoth 将 docx 转为 HTML，然后用 html2pdf.js 生成 PDF
    const mammoth = await import('mammoth')
    const arrayBuffer = await this.readFileAsArrayBuffer(file)
    
    const result = await mammoth.convertToHtml({ arrayBuffer })
    
    // 创建完整的 HTML 文档，添加样式
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Converted Document</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Microsoft YaHei', 'SimSun', Arial, sans-serif;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.8;
      color: #333;
      font-size: 14px;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: bold;
      color: #000;
    }
    h1 { font-size: 28px; }
    h2 { font-size: 24px; }
    h3 { font-size: 20px; }
    h4 { font-size: 18px; }
    p {
      margin: 12px 0;
      text-align: justify;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 16px 0;
      border: 1px solid #333;
    }
    td, th {
      border: 1px solid #333;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    ul, ol {
      padding-left: 2em;
      margin: 12px 0;
    }
    li {
      margin: 4px 0;
    }
    strong, b {
      font-weight: bold;
    }
    em, i {
      font-style: italic;
    }
  </style>
</head>
<body>
${result.value}
</body>
</html>`
    
    // 使用 html2pdf.js 生成 PDF
    return this.generatePdfFromHtml(html)
  }
  
  private async htmlToPdf(file: File): Promise<Blob> {
    const html = await this.readFileAsText(file)
    return this.generatePdfFromHtml(html)
  }
  
  private async generatePdfFromHtml(html: string): Promise<Blob> {
    // 创建临时容器
    const container = document.createElement('div')
    container.innerHTML = html
    container.style.width = '800px'
    container.style.padding = '20px'
    container.style.fontFamily = "'Microsoft YaHei', 'SimSun', Arial, sans-serif"
    document.body.appendChild(container)
    
    try {
      // 使用 html2pdf.js
      const html2pdf = await import('html2pdf.js')
      
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: 'document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        }
      }
      
      // 生成 PDF
      const pdf = html2pdf.default().set(opt).from(container)
      const blob = await pdf.output('blob')
      
      return blob
    } finally {
      // 清理临时容器
      document.body.removeChild(container)
    }
  }
  
  private async textToPdf(file: File): Promise<Blob> {
    const text = await this.readFileAsText(file)
    
    // 将文本转为 HTML，使用 html2pdf.js 生成 PDF（支持中文）
    const escapedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
    
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>Converted Text</title>
  <style>
    body {
      font-family: 'Microsoft YaHei', 'SimSun', Arial, sans-serif;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.8;
      color: #333;
      font-size: 14px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  </style>
</head>
<body>
${escapedText}
</body>
</html>`
    
    return this.generatePdfFromHtml(html)
  }
  
  private async imageToPdf(file: File): Promise<Blob> {
    const arrayBuffer = await this.readFileAsArrayBuffer(file)
    const url = URL.createObjectURL(new Blob([arrayBuffer], { type: file.type }))
    
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const { jsPDF } = require('jspdf')
        
        // 根据图片尺寸决定页面方向和大小
        const orientation = img.width > img.height ? 'landscape' : 'portrait'
        const pdf = new jsPDF({
          orientation,
          unit: 'px',
          format: [img.width, img.height]
        })
        
        // 添加图片到 PDF
        const format = file.type.split('/')[1].toUpperCase()
        pdf.addImage(img, format === 'JPEG' ? 'JPEG' : 'PNG', 0, 0, img.width, img.height)
        
        URL.revokeObjectURL(url)
        resolve(pdf.output('blob'))
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('图片加载失败'))
      }
      img.src = url
    })
  }
  
  private async csvToPdf(csvBlob: Blob): Promise<Blob> {
    const csv = await this.readFileAsText(csvBlob)
    
    // 解析 CSV 并生成 HTML 表格
    const lines = csv.trim().split('\n')
    if (lines.length === 0) {
      return this.generatePdfFromHtml('<p>空数据</p>')
    }
    
    const headers = lines[0].split(',').map(h => h.trim())
    const rows = lines.slice(1).map(line => line.split(',').map(c => c.trim()))
    
    const headerHtml = headers.map(h => `<th>${this.escapeHtml(h)}</th>`).join('')
    const rowsHtml = rows.map(row => 
      `<tr>${row.map(cell => `<td>${this.escapeHtml(cell)}</td>`).join('')}</tr>`
    ).join('')
    
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>CSV to PDF</title>
  <style>
    body {
      font-family: 'Microsoft YaHei', 'SimSun', Arial, sans-serif;
      padding: 20px;
      margin: 0;
      line-height: 1.6;
      color: #333;
      font-size: 14px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 16px 0;
      border: 1px solid #333;
    }
    th, td {
      border: 1px solid #333;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    tr:nth-child(even) {
      background-color: #fafafa;
    }
  </style>
</head>
<body>
  <table>
    <thead><tr>${headerHtml}</tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</body>
</html>`
    
    return this.generatePdfFromHtml(html)
  }
  
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }
}