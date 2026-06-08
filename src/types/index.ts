// 支持的文件格式
export type FileFormat = 
  | 'docx'  // Word 文档
  | 'pdf'   // PDF 文档
  | 'xlsx'  // Excel 表格
  | 'csv'   // CSV 表格
  | 'md'    // Markdown
  | 'html'  // HTML
  | 'txt'   // 纯文本
  | 'png'   // PNG 图片
  | 'jpg'   // JPG 图片
  | 'json'  // JSON

// 文件信息
export interface FileInfo {
  id: string
  file: File
  name: string
  format: FileFormat
  size: number
  lastModified: number
}

// 转换任务状态
export type ConversionStatus = 'pending' | 'converting' | 'completed' | 'error'

// 转换任务
export interface ConversionTask {
  id: string
  sourceFile: FileInfo
  sourceFormat: FileFormat
  targetFormat: FileFormat
  status: ConversionStatus
  progress: number
  result?: Blob
  resultName?: string
  error?: string
  previewUrl?: string
}

// 格式转换映射
export interface FormatConversion {
  source: FileFormat
  targets: FileFormat[]
}

// 格式显示信息
export interface FormatInfo {
  format: FileFormat
  name: string
  extension: string
  mimeType: string
  icon: string
  color: string
}

// 预览类型
export type PreviewType = 'image' | 'pdf' | 'text' | 'html' | 'office' | 'unsupported'

// 预览数据
export interface PreviewData {
  type: PreviewType
  content?: string
  url?: string
  html?: string
}