import { BaseConverter } from './base'
import type { FileFormat } from '@/types'

// 文本格式转换器
export class TextConverter extends BaseConverter {
  async convert(file: File, _sourceFormat: FileFormat, targetFormat: FileFormat): Promise<Blob> {
    const text = await this.readFileAsText(file)
    
    switch (targetFormat) {
      case 'txt':
        return new Blob([text], { type: 'text/plain;charset=utf-8' })
      
      case 'html':
        return this.textToHtml(text)
      
      case 'md':
        return this.textToMarkdown(text)
      
      default:
        throw new Error(`文本不支持转换为 ${targetFormat}`)
    }
  }
  
  private textToHtml(text: string): Blob {
    const escapedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
    
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Converted Text</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
  </style>
</head>
<body>
${escapedText}
</body>
</html>`
    
    return new Blob([html], { type: 'text/html;charset=utf-8' })
  }
  
  private textToMarkdown(text: string): Blob {
    // 简单的文本转 Markdown（保持原样）
    return new Blob([text], { type: 'text/markdown;charset=utf-8' })
  }
}

// HTML 转换器
export class HtmlConverter extends BaseConverter {
  async convert(file: File, _sourceFormat: FileFormat, targetFormat: FileFormat): Promise<Blob> {
    const html = await this.readFileAsText(file)
    
    switch (targetFormat) {
      case 'txt':
        return this.htmlToText(html)
      
      case 'md':
        return this.htmlToMarkdown(html)
      
      default:
        throw new Error(`HTML 不支持转换为 ${targetFormat}`)
    }
  }
  
  private htmlToText(html: string): Blob {
    // 移除 HTML 标签
    const text = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim()
    
    return new Blob([text], { type: 'text/plain;charset=utf-8' })
  }
  
  private htmlToMarkdown(html: string): Blob {
    // 简单的 HTML 转 Markdown
    let md = html
    
    // 移除 head 和 style/script
    md = md.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    md = md.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    md = md.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    
    // 标题
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
    
    // 粗体和斜体
    md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    
    // 链接
    md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    
    // 列表
    md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    
    // 段落和换行
    md = md.replace(/<br\s*\/?>/gi, '\n')
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    md = md.replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\n')
    
    // 移除剩余标签
    md = md.replace(/<[^>]+>/g, '')
    
    // 清理
    md = md.replace(/&nbsp;/g, ' ')
    md = md.replace(/&lt;/g, '<')
    md = md.replace(/&gt;/g, '>')
    md = md.replace(/&amp;/g, '&')
    md = md.replace(/\n{3,}/g, '\n\n')
    md = md.trim()
    
    return new Blob([md], { type: 'text/markdown;charset=utf-8' })
  }
}

// Markdown 转换器
export class MarkdownConverter extends BaseConverter {
  async convert(file: File, _sourceFormat: FileFormat, targetFormat: FileFormat): Promise<Blob> {
    const md = await this.readFileAsText(file)
    
    switch (targetFormat) {
      case 'html':
        return this.markdownToHtml(md)
      
      case 'txt':
        return new Blob([md], { type: 'text/plain;charset=utf-8' })
      
      default:
        throw new Error(`Markdown 不支持转换为 ${targetFormat}`)
    }
  }
  
  private markdownToHtml(md: string): Blob {
    // 简单的 Markdown 转 HTML
    let html = md
    
    // 标题
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
    
    // 粗体和斜体
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
    html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>')
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
    html = html.replace(/_(.+?)_/g, '<em>$1</em>')
    
    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    
    // 图片
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
    
    // 代码块
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // 列表
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    
    // 引用
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
    
    // 水平线
    html = html.replace(/^---$/gm, '<hr>')
    html = html.replace(/^\*\*\*$/gm, '<hr>')
    
    // 段落
    html = html.replace(/\n\n/g, '</p><p>')
    html = `<p>${html}</p>`
    
    // 清理空段落
    html = html.replace(/<p>\s*<\/p>/g, '')
    html = html.replace(/<p>\s*(<h[1-6]>)/g, '$1')
    html = html.replace(/(<\/h[1-6]>)\s*<\/p>/g, '$1')
    html = html.replace(/<p>\s*(<ul>)/g, '$1')
    html = html.replace(/(<\/ul>)\s*<\/p>/g, '$1')
    html = html.replace(/<p>\s*(<pre>)/g, '$1')
    html = html.replace(/(<\/pre>)\s*<\/p>/g, '$1')
    html = html.replace(/<p>\s*(<blockquote>)/g, '$1')
    html = html.replace(/(<\/blockquote>)\s*<\/p>/g, '$1')
    
    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Converted Markdown</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #333; }
    h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; }
    h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
    code { background: #f6f8fa; padding: 2px 6px; border-radius: 3px; font-family: 'SF Mono', Consolas, monospace; font-size: 85%; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #dfe2e5; padding-left: 16px; color: #6a737d; margin: 0; }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    ul { padding-left: 2em; }
    hr { border: none; border-top: 1px solid #eaecef; margin: 24px 0; }
    img { max-width: 100%; }
  </style>
</head>
<body>
${html}
</body>
</html>`
    
    return new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
  }
}

// CSV 转换器
export class CsvConverter extends BaseConverter {
  async convert(file: File, _sourceFormat: FileFormat, targetFormat: FileFormat): Promise<Blob> {
    const csv = await this.readFileAsText(file)
    
    switch (targetFormat) {
      case 'json':
        return this.csvToJson(csv)
      
      default:
        throw new Error(`CSV 不支持转换为 ${targetFormat}`)
    }
  }
  
  private csvToJson(csv: string): Blob {
    const lines = csv.trim().split('\n')
    if (lines.length === 0) {
      return new Blob(['[]'], { type: 'application/json;charset=utf-8' })
    }
    
    const headers = this.parseCsvLine(lines[0])
    const result = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i])
      const obj: Record<string, string> = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || ''
      })
      result.push(obj)
    }
    
    return new Blob([JSON.stringify(result, null, 2)], { type: 'application/json;charset=utf-8' })
  }
  
  private parseCsvLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }
}

// JSON 转换器
export class JsonConverter extends BaseConverter {
  async convert(file: File, _sourceFormat: FileFormat, targetFormat: FileFormat): Promise<Blob> {
    const jsonText = await this.readFileAsText(file)
    
    switch (targetFormat) {
      case 'csv':
        return this.jsonToCsv(jsonText)
      
      default:
        throw new Error(`JSON 不支持转换为 ${targetFormat}`)
    }
  }
  
  private jsonToCsv(jsonText: string): Blob {
    try {
      const data = JSON.parse(jsonText)
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('JSON 数据必须是非空数组')
      }
      
      const headers = Object.keys(data[0])
      const csvLines: string[] = []
      
      // 添加表头
      csvLines.push(headers.map(h => this.escapeCsvField(h)).join(','))
      
      // 添加数据行
      for (const item of data) {
        const values = headers.map(h => this.escapeCsvField(String(item[h] ?? '')))
        csvLines.push(values.join(','))
      }
      
      return new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8' })
    } catch (error) {
      throw new Error('JSON 格式无效或无法转换为 CSV')
    }
  }
  
  private escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`
    }
    return field
  }
}

// 图片转换器
export class ImageConverter extends BaseConverter {
  async convert(file: File, sourceFormat: FileFormat, targetFormat: FileFormat): Promise<Blob> {
    const dataUrl = await this.readFileAsDataURL(file)
    
    switch (targetFormat) {
      case 'jpg':
        if (sourceFormat === 'png') {
          return this.pngToJpg(dataUrl)
        }
        throw new Error('只支持 PNG 转 JPG')
      
      case 'png':
        if (sourceFormat === 'jpg') {
          return this.jpgToPng(dataUrl)
        }
        throw new Error('只支持 JPG 转 PNG')
      
      default:
        throw new Error(`图片不支持转换为 ${targetFormat}`)
    }
  }
  
  private pngToJpg(dataUrl: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('无法创建画布上下文'))
          return
        }
        
        // 填充白色背景（JPG 不支持透明）
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('图片转换失败'))
          }
        }, 'image/jpeg', 0.92)
      }
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = dataUrl
    })
  }
  
  private jpgToPng(dataUrl: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('无法创建画布上下文'))
          return
        }
        
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('图片转换失败'))
          }
        }, 'image/png')
      }
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = dataUrl
    })
  }
}