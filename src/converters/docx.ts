import { BaseConverter } from './base'
import type { FileFormat } from '@/types'

// Word 文档转换器
export class DocxConverter extends BaseConverter {
  async convert(file: File, _sourceFormat: FileFormat, targetFormat: FileFormat): Promise<Blob> {
    switch (targetFormat) {
      case 'html':
        return this.docxToHtml(file)
      
      case 'txt':
        const html = await this.docxToHtml(file)
        return this.htmlToText(html)
      
      case 'md':
        const htmlContent = await this.docxToHtml(file)
        return this.htmlToMarkdown(htmlContent)
      
      default:
        throw new Error(`Word 不支持转换为 ${targetFormat}`)
    }
  }
  
  private async docxToHtml(file: File): Promise<Blob> {
    // 使用 mammoth.js 解析 docx
    const mammoth = await import('mammoth')
    const arrayBuffer = await this.readFileAsArrayBuffer(file)
    
    const result = await mammoth.convertToHtml({ arrayBuffer })
    
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${file.name.replace('.docx', '')}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #333; }
    h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; }
    p { margin: 16px 0; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
${result.value}
</body>
</html>`
    
    return new Blob([html], { type: 'text/html;charset=utf-8' })
  }
  
  private async htmlToText(htmlBlob: Blob): Promise<Blob> {
    const html = await htmlBlob.text()
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
  
  private async htmlToMarkdown(htmlBlob: Blob): Promise<Blob> {
    const html = await htmlBlob.text()
    
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

// Word 文档生成器
export class DocxGenerator extends BaseConverter {
  async convert(file: File, sourceFormat: FileFormat, _targetFormat: FileFormat): Promise<Blob> {
    switch (sourceFormat) {
      case 'html':
        return this.htmlToDocx(file)
      
      case 'md':
        // 先转 HTML 再转 Word
        const { MarkdownConverter } = await import('./basic')
        const mdConverter = new MarkdownConverter()
        const htmlBlob = await mdConverter.convert(file, 'md', 'html')
        const htmlFile = new File([htmlBlob], 'temp.html', { type: 'text/html' })
        return this.htmlToDocx(htmlFile)
      
      default:
        throw new Error(`${sourceFormat} 不支持转换为 Word`)
    }
  }
  
  private async htmlToDocx(file: File): Promise<Blob> {
    const html = await this.readFileAsText(file)
    
    // 使用 docx 库创建 Word 文档
    const { Document, Packer, Paragraph, TextRun } = await import('docx')
    
    // 简单解析 HTML（实际应用中可以用更复杂的解析器）
    const text = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim()
    
    const paragraphs = text.split('\n\n').map(p => 
      new Paragraph({
        children: [
          new TextRun({
            text: p.trim(),
            size: 24
          })
        ]
      })
    )
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    })
    
    return Packer.toBlob(doc)
  }
}