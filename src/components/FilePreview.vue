<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { FileInfo, FileFormat, PreviewType } from '@/types'
import { FORMAT_INFO, formatFileSize, getPreviewType } from '@/utils/format'

const props = defineProps<{
  sourceFile: FileInfo
  targetFormat: FileFormat
  previewUrl: string | null
}>()

const emit = defineEmits<{
  (e: 'convert'): void
  (e: 'back'): void
}>()

const previewType = ref<PreviewType>('unsupported')
const textContent = ref<string>('')
const isLoading = ref(false)
const objectUrl = ref<string | null>(null)

// 判断预览类型
onMounted(() => {
  previewType.value = getPreviewType(props.sourceFile.format)
  loadPreview()
})

// 清理
onUnmounted(() => {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
  }
})

// 加载预览内容
async function loadPreview() {
  isLoading.value = true
  
  try {
    const type = previewType.value
    
    if (type === 'image' && props.previewUrl) {
      // 图片预览使用传入的 URL
    } else if (type === 'text') {
      // 文本预览
      const text = await props.sourceFile.file.text()
      // 限制显示长度
      textContent.value = text.length > 10000 
        ? text.substring(0, 10000) + '\n\n... (内容已截断)' 
        : text
    } else if (type === 'html') {
      // HTML 预览
      const html = await props.sourceFile.file.text()
      textContent.value = html
    } else if (type === 'pdf') {
      // PDF 预览 - 创建 blob URL
      objectUrl.value = URL.createObjectURL(props.sourceFile.file)
    }
  } catch (error) {
    console.error('预览加载失败:', error)
  } finally {
    isLoading.value = false
  }
}

function handleConvert() {
  emit('convert')
}

function handleBack() {
  emit('back')
}
</script>

<template>
  <div class="preview-container">
    <!-- 文件信息卡片 -->
    <div class="info-cards">
      <!-- 源文件 -->
      <div class="info-card source-card">
        <div class="card-header">
          <span class="card-label">源文件</span>
        </div>
        <div class="card-body">
          <div class="file-icon" :style="{ background: FORMAT_INFO[sourceFile.format].color + '15' }">
            <span class="icon-emoji">{{ FORMAT_INFO[sourceFile.format].icon }}</span>
          </div>
          <div class="file-info">
            <h3 class="file-name">{{ sourceFile.name }}</h3>
            <div class="file-meta">
              <span class="meta-item">{{ FORMAT_INFO[sourceFile.format].name }}</span>
              <span class="meta-divider">·</span>
              <span class="meta-item">{{ formatFileSize(sourceFile.size) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 转换箭头 -->
      <div class="convert-indicator">
        <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
          <path d="M0 8H28M28 8L22 2M28 8L22 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- 目标格式 -->
      <div class="info-card target-card">
        <div class="card-header">
          <span class="card-label">目标格式</span>
        </div>
        <div class="card-body">
          <div class="file-icon" :style="{ background: FORMAT_INFO[targetFormat].color + '15' }">
            <span class="icon-emoji">{{ FORMAT_INFO[targetFormat].icon }}</span>
          </div>
          <div class="file-info">
            <h3 class="file-name">{{ FORMAT_INFO[targetFormat].name }}</h3>
            <div class="file-meta">
              <span class="meta-item">{{ FORMAT_INFO[targetFormat].extension }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览区域 -->
    <div class="preview-section">
      <h2 class="section-title">文件预览</h2>
      <div class="preview-area">
        <!-- 加载中 -->
        <div v-if="isLoading" class="preview-loading">
          <div class="loading-spinner"></div>
          <span>加载预览中...</span>
        </div>

        <!-- 图片预览 -->
        <div v-else-if="previewType === 'image' && previewUrl" class="preview-image">
          <img :src="previewUrl" :alt="sourceFile.name" />
        </div>

        <!-- PDF 预览 -->
        <div v-else-if="previewType === 'pdf' && objectUrl" class="preview-pdf">
          <iframe :src="objectUrl" />
        </div>

        <!-- 文本预览 -->
        <div v-else-if="previewType === 'text'" class="preview-text">
          <pre>{{ textContent }}</pre>
        </div>

        <!-- HTML 预览 -->
        <div v-else-if="previewType === 'html'" class="preview-html">
          <iframe :srcdoc="textContent" />
        </div>

        <!-- Office 文件 - 无法直接预览 -->
        <div v-else-if="previewType === 'office'" class="preview-unsupported">
          <div class="unsupported-icon">📄</div>
          <p>Office 文件暂不支持预览</p>
          <span>转换后可查看结果</span>
        </div>

        <!-- 不支持的格式 -->
        <div v-else class="preview-unsupported">
          <div class="unsupported-icon">❓</div>
          <p>无法预览此格式</p>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button class="btn btn-secondary" @click="handleBack">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        返回
      </button>
      <button class="btn btn-primary" @click="handleConvert">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 8H14M14 8L8 2M14 8L8 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        开始转换
      </button>
    </div>
  </div>
</template>

<style scoped>
.preview-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 信息卡片 */
.info-cards {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.info-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  min-width: 240px;
}

.card-header {
  padding: 12px 20px;
  background: var(--color-gray-50);
  border-bottom: 1px solid var(--color-gray-100);
}

.card-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-gray-500);
}

.card-body {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.file-icon {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-emoji {
  font-size: 26px;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-gray-500);
}

.meta-divider {
  color: var(--color-gray-300);
}

.convert-indicator {
  color: var(--color-gray-400);
}

/* 预览区域 */
.preview-section {
  width: 100%;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0 0 16px 0;
}

.preview-area {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  min-height: 300px;
  max-height: 500px;
  overflow: hidden;
}

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  height: 300px;
  color: var(--color-gray-500);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-gray-200);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.preview-image {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--color-gray-50);
  min-height: 300px;
}

.preview-image img {
  max-width: 100%;
  max-height: 450px;
  object-fit: contain;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
}

.preview-pdf iframe,
.preview-html iframe {
  width: 100%;
  height: 500px;
  border: none;
}

.preview-text {
  padding: 20px;
  overflow: auto;
  max-height: 500px;
}

.preview-text pre {
  margin: 0;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-gray-700);
  white-space: pre-wrap;
  word-break: break-all;
}

.preview-unsupported {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 300px;
  color: var(--color-gray-500);
}

.unsupported-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.preview-unsupported p {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-gray-700);
  margin: 0;
}

.preview-unsupported span {
  font-size: 14px;
}

/* 操作按钮 */
.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 122, 255, 0.4);
}

.btn-secondary {
  background: white;
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-300);
}

.btn-secondary:hover {
  background: var(--color-gray-50);
  border-color: var(--color-gray-400);
}

@media (max-width: 640px) {
  .info-cards {
    flex-direction: column;
  }
  
  .convert-indicator {
    transform: rotate(90deg);
  }
}
</style>