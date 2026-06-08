// 转换器模块导出
export { BaseConverter, ConversionManager, conversionManager } from './base'
export { TextConverter, HtmlConverter, MarkdownConverter, CsvConverter, JsonConverter, ImageConverter } from './basic'
export { PdfConverter, PdfGenerator } from './pdf'
export { DocxConverter, DocxGenerator } from './docx'
export { XlsxConverter, XlsxGenerator } from './xlsx'

import { conversionManager } from './base'
import { TextConverter, HtmlConverter, MarkdownConverter, CsvConverter, JsonConverter, ImageConverter } from './basic'
import { PdfConverter, PdfGenerator } from './pdf'
import { DocxConverter, DocxGenerator } from './docx'
import { XlsxConverter, XlsxGenerator } from './xlsx'

// 初始化所有转换器
export function initializeConverters() {
  // 文本转换
  conversionManager.register('txt-html', new TextConverter())
  conversionManager.register('txt-md', new TextConverter())
  
  // HTML 转换
  conversionManager.register('html-txt', new HtmlConverter())
  conversionManager.register('html-md', new HtmlConverter())
  
  // Markdown 转换
  conversionManager.register('md-html', new MarkdownConverter())
  conversionManager.register('md-txt', new MarkdownConverter())
  
  // CSV 转换
  conversionManager.register('csv-json', new CsvConverter())
  
  // JSON 转换
  conversionManager.register('json-csv', new JsonConverter())
  
  // 图片转换
  conversionManager.register('png-jpg', new ImageConverter())
  conversionManager.register('jpg-png', new ImageConverter())
  
  // PDF 转换
  conversionManager.register('pdf-txt', new PdfConverter())
  conversionManager.register('pdf-docx', new PdfConverter())
  conversionManager.register('pdf-png', new PdfConverter())
  conversionManager.register('pdf-jpg', new PdfConverter())
  
  // 生成 PDF
  conversionManager.register('html-pdf', new PdfGenerator())
  conversionManager.register('txt-pdf', new PdfGenerator())
  conversionManager.register('md-pdf', new PdfGenerator())
  conversionManager.register('png-pdf', new PdfGenerator())
  conversionManager.register('jpg-pdf', new PdfGenerator())
  conversionManager.register('docx-pdf', new PdfGenerator())
  conversionManager.register('xlsx-pdf', new PdfGenerator())
  
  // Word 转换
  conversionManager.register('docx-html', new DocxConverter())
  conversionManager.register('docx-txt', new DocxConverter())
  conversionManager.register('docx-md', new DocxConverter())
  
  // 生成 Word
  conversionManager.register('html-docx', new DocxGenerator())
  conversionManager.register('md-docx', new DocxGenerator())
  
  // Excel 转换
  conversionManager.register('xlsx-csv', new XlsxConverter())
  conversionManager.register('xlsx-json', new XlsxConverter())
  
  // 生成 Excel
  conversionManager.register('csv-xlsx', new XlsxGenerator())
  conversionManager.register('json-xlsx', new XlsxGenerator())
}