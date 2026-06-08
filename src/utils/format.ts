import type { FileFormat, FormatInfo, FormatConversion, PreviewType } from '@/types'

// 格式信息映射
export const FORMAT_INFO: Record<FileFormat, FormatInfo> = {
  docx: {
    format: 'docx',
    name: 'Word 文档',
    extension: '.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    icon: '📄',
    color: '#2B579A'
  },
  pdf: {
    format: 'pdf',
    name: 'PDF 文档',
    extension: '.pdf',
    mimeType: 'application/pdf',
    icon: '📕',
    color: '#E13F34'
  },
  xlsx: {
    format: 'xlsx',
    name: 'Excel 表格',
    extension: '.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    icon: '📊',
    color: '#217346'
  },
  csv: {
    format: 'csv',
    name: 'CSV 表格',
    extension: '.csv',
    mimeType: 'text/csv',
    icon: '📋',
    color: '#4A90D9'
  },
  md: {
    format: 'md',
    name: 'Markdown',
    extension: '.md',
    mimeType: 'text/markdown',
    icon: '📝',
    color: '#083FA1'
  },
  html: {
    format: 'html',
    name: 'HTML 页面',
    extension: '.html',
    mimeType: 'text/html',
    icon: '🌐',
    color: '#E44D26'
  },
  txt: {
    format: 'txt',
    name: '纯文本',
    extension: '.txt',
    mimeType: 'text/plain',
    icon: '📃',
    color: '#6B7280'
  },
  png: {
    format: 'png',
    name: 'PNG 图片',
    extension: '.png',
    mimeType: 'image/png',
    icon: '🖼️',
    color: '#8B5CF6'
  },
  jpg: {
    format: 'jpg',
    name: 'JPG 图片',
    extension: '.jpg',
    mimeType: 'image/jpeg',
    icon: '📷',
    color: '#F59E0B'
  },
  json: {
    format: 'json',
    name: 'JSON 数据',
    extension: '.json',
    mimeType: 'application/json',
    icon: '🔧',
    color: '#10B981'
  }
}

// 支持的转换映射
export const CONVERSION_MAP: FormatConversion[] = [
  { source: 'docx', targets: ['pdf', 'html', 'md', 'txt'] },
  { source: 'pdf', targets: ['docx', 'txt', 'png', 'jpg'] },
  { source: 'xlsx', targets: ['csv', 'json', 'pdf'] },
  { source: 'csv', targets: ['xlsx', 'json'] },
  { source: 'md', targets: ['html', 'pdf', 'docx'] },
  { source: 'html', targets: ['pdf', 'md', 'txt'] },
  { source: 'txt', targets: ['pdf', 'html', 'md'] },
  { source: 'png', targets: ['pdf', 'jpg'] },
  { source: 'jpg', targets: ['pdf', 'png'] },
  { source: 'json', targets: ['csv', 'xlsx'] }
]

// 根据扩展名获取格式
export function getFormatFromExtension(filename: string): FileFormat | null {
  const ext = filename.toLowerCase().split('.').pop()
  if (!ext) return null
  
  for (const [format, info] of Object.entries(FORMAT_INFO)) {
    if (info.extension === `.${ext}`) {
      return format as FileFormat
    }
  }
  return null
}

// 根据文件获取格式
export function getFormatFromFile(file: File): FileFormat | null {
  // 先检查扩展名
  const extFormat = getFormatFromExtension(file.name)
  if (extFormat) return extFormat
  
  // 再检查 MIME 类型
  for (const [format, info] of Object.entries(FORMAT_INFO)) {
    if (info.mimeType === file.type) {
      return format as FileFormat
    }
  }
  
  return null
}

// 获取可转换的目标格式
export function getTargetFormats(sourceFormat: FileFormat): FileFormat[] {
  const conversion = CONVERSION_MAP.find(c => c.source === sourceFormat)
  return conversion ? conversion.targets : []
}

// 检查是否支持该格式
export function isSupportedFormat(format: FileFormat | null): boolean {
  return format !== null && format in FORMAT_INFO
}

// 获取预览类型
export function getPreviewType(format: FileFormat): PreviewType {
  switch (format) {
    case 'png':
    case 'jpg':
      return 'image'
    case 'pdf':
      return 'pdf'
    case 'txt':
    case 'md':
    case 'csv':
    case 'json':
      return 'text'
    case 'html':
      return 'html'
    case 'docx':
    case 'xlsx':
      return 'office'
    default:
      return 'unsupported'
  }
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生成唯一 ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}