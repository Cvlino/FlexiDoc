import type { FileFormat, FileInfo, ConversionTask } from '@/types'
import { generateId } from '@/utils/format'

// 转换器基类
export abstract class BaseConverter {
  abstract convert(file: File, sourceFormat: FileFormat, targetFormat: FileFormat): Promise<Blob>
  
  protected readFileAsArrayBuffer(file: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }
  
  protected readFileAsText(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }
  
  protected readFileAsDataURL(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
  
  protected blobToFile(blob: Blob, filename: string): File {
    return new File([blob], filename, { type: blob.type })
  }
}

// 转换管理器
export class ConversionManager {
  private converters: Map<string, BaseConverter> = new Map()
  
  register(key: string, converter: BaseConverter) {
    this.converters.set(key, converter)
  }
  
  async convert(
    file: File,
    sourceFormat: FileFormat,
    targetFormat: FileFormat
  ): Promise<Blob> {
    const key = `${sourceFormat}-${targetFormat}`
    const converter = this.converters.get(key)
    
    if (!converter) {
      throw new Error(`不支持从 ${sourceFormat} 转换到 ${targetFormat}`)
    }
    
    return converter.convert(file, sourceFormat, targetFormat)
  }
  
  createTask(sourceFile: FileInfo, targetFormat: FileFormat): ConversionTask {
    return {
      id: generateId(),
      sourceFile,
      sourceFormat: sourceFile.format,
      targetFormat,
      status: 'pending',
      progress: 0
    }
  }
  
  async executeTask(task: ConversionTask, onProgress?: (progress: number, status: ConversionTask['status']) => void): Promise<ConversionTask> {
    try {
      task.status = 'converting'
      task.progress = 10
      onProgress?.(task.progress, task.status)
      
      const result = await this.convert(
        task.sourceFile.file,
        task.sourceFormat,
        task.targetFormat
      )
      
      task.progress = 90
      onProgress?.(task.progress, task.status)
      
      task.result = result
      task.resultName = this.getResultFilename(task.sourceFile.name, task.targetFormat)
      task.status = 'completed'
      task.progress = 100
      onProgress?.(task.progress, task.status)
      
      return task
    } catch (error) {
      task.status = 'error'
      task.error = error instanceof Error ? error.message : '转换失败'
      onProgress?.(task.progress, task.status)
      return task
    }
  }
  
  private getResultFilename(sourceName: string, targetFormat: FileFormat): string {
    const baseName = sourceName.substring(0, sourceName.lastIndexOf('.')) || sourceName
    const extensions: Record<FileFormat, string> = {
      docx: '.docx',
      pdf: '.pdf',
      xlsx: '.xlsx',
      csv: '.csv',
      md: '.md',
      html: '.html',
      txt: '.txt',
      png: '.png',
      jpg: '.jpg',
      json: '.json'
    }
    return baseName + extensions[targetFormat]
  }
}

export const conversionManager = new ConversionManager()