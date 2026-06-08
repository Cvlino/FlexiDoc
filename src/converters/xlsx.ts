import { BaseConverter } from './base'
import type { FileFormat } from '@/types'

// Excel 转换器
export class XlsxConverter extends BaseConverter {
  async convert(file: File, __sourceFormat: FileFormat, targetFormat: FileFormat): Promise<Blob> {
    switch (targetFormat) {
      case 'csv':
        return this.xlsxToCsv(file)
      
      case 'json':
        return this.xlsxToJson(file)
      
      default:
        throw new Error(`Excel 不支持转换为 ${targetFormat}`)
    }
  }
  
  private async xlsxToCsv(file: File): Promise<Blob> {
    const XLSX = await import('xlsx')
    const arrayBuffer = await this.readFileAsArrayBuffer(file)
    
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const csv = XLSX.utils.sheet_to_csv(firstSheet)
    
    return new Blob([csv], { type: 'text/csv;charset=utf-8' })
  }
  
  private async xlsxToJson(file: File): Promise<Blob> {
    const XLSX = await import('xlsx')
    const arrayBuffer = await this.readFileAsArrayBuffer(file)
    
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json(firstSheet)
    
    return new Blob([JSON.stringify(json, null, 2)], { type: 'application/json;charset=utf-8' })
  }
}

// Excel 生成器
export class XlsxGenerator extends BaseConverter {
  async convert(file: File, sourceFormat: FileFormat, _targetFormat: FileFormat): Promise<Blob> {
    switch (sourceFormat) {
      case 'csv':
        return this.csvToXlsx(file)
      
      case 'json':
        return this.jsonToXlsx(file)
      
      default:
        throw new Error(`${sourceFormat} 不支持转换为 Excel`)
    }
  }
  
  private async csvToXlsx(file: File): Promise<Blob> {
    const XLSX = await import('xlsx')
    const text = await this.readFileAsText(file)
    
    const workbook = XLSX.read(text, { type: 'string' })
    const xlsxBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
    
    return new Blob([xlsxBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
  }
  
  private async jsonToXlsx(file: File): Promise<Blob> {
    const XLSX = await import('xlsx')
    const text = await this.readFileAsText(file)
    
    const data = JSON.parse(text)
    const worksheet = XLSX.utils.json_to_sheet(Array.isArray(data) ? data : [data])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    
    const xlsxBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
    
    return new Blob([xlsxBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
  }
}