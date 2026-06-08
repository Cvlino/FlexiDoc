<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FileInfo, ConversionTask, FileFormat } from './types'
import { getFormatFromFile, getTargetFormats, generateId, getPreviewType } from './utils/format'
import { initializeConverters, conversionManager } from './converters'
import FileUploader from './components/FileUploader.vue'
import FormatSelector from './components/FormatSelector.vue'
import FilePreview from './components/FilePreview.vue'
import ConversionProgress from './components/ConversionProgress.vue'

// 初始化转换器
initializeConverters()

// 状态
const currentStep = ref<'upload' | 'select' | 'preview' | 'convert'>('upload')
const sourceFile = ref<FileInfo | null>(null)
const targetFormat = ref<FileFormat | null>(null)
const conversionTask = ref<ConversionTask | null>(null)
const previewUrl = ref<string | null>(null)

// 计算属性
const availableTargetFormats = computed(() => {
  if (!sourceFile.value) return []
  return getTargetFormats(sourceFile.value.format)
})



// 方法
function handleFileSelect(file: File) {
  const format = getFormatFromFile(file)
  if (!format) {
    alert('不支持的文件格式')
    return
  }
  
  sourceFile.value = {
    id: generateId(),
    file,
    name: file.name,
    format,
    size: file.size,
    lastModified: file.lastModified
  }
  
  // 生成预览 URL
  if (getPreviewType(format) === 'image') {
    previewUrl.value = URL.createObjectURL(file)
  } else {
    previewUrl.value = null
  }
  
  targetFormat.value = null
  currentStep.value = 'select'
}

function handleFormatSelect(format: FileFormat) {
  targetFormat.value = format
  currentStep.value = 'preview'
}

function handleBack() {
  if (currentStep.value === 'select') {
    currentStep.value = 'upload'
    sourceFile.value = null
    previewUrl.value = null
  } else if (currentStep.value === 'preview') {
    currentStep.value = 'select'
    targetFormat.value = null
  } else if (currentStep.value === 'convert') {
    currentStep.value = 'preview'
    conversionTask.value = null
  }
}

async function handleStartConvert() {
  if (!sourceFile.value || !targetFormat.value) return
  
  currentStep.value = 'convert'
  
  const task = conversionManager.createTask(sourceFile.value, targetFormat.value)
  conversionTask.value = { ...task }
  
  try {
    const result = await conversionManager.executeTask(task, (progress, status) => {
      conversionTask.value = {
        ...conversionTask.value!,
        progress,
        status
      }
    })
    conversionTask.value = result
  } catch (error) {
    console.error('转换失败:', error)
    conversionTask.value = {
      ...conversionTask.value!,
      status: 'error' as const,
      error: error instanceof Error ? error.message : '转换失败'
    }
  }
}

function handleDownload() {
  if (!conversionTask.value?.result || !conversionTask.value.resultName) return
  
  const url = URL.createObjectURL(conversionTask.value.result)
  const a = document.createElement('a')
  a.href = url
  a.download = conversionTask.value.resultName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function handleReset() {
  currentStep.value = 'upload'
  sourceFile.value = null
  targetFormat.value = null
  conversionTask.value = null
  previewUrl.value = null
}

function handleNewConvert() {
  // 保留源文件，重新选择目标格式
  currentStep.value = 'select'
  targetFormat.value = null
  conversionTask.value = null
}
</script>

<template>
  <div class="app">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <svg class="logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="10" fill="url(#logo-gradient)"/>
            <path d="M12 10 L12 30 L28 30" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18 16 L24 16 L24 22 L18 22 Z" fill="white" opacity="0.9"/>
            <path d="M24 16 L30 20 L30 26 L24 22 Z" fill="white" opacity="0.7"/>
            <path d="M18 22 L24 22 L30 26 L24 26 Z" fill="white" opacity="0.5"/>
            <defs>
              <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40">
                <stop offset="0%" stop-color="#007AFF"/>
                <stop offset="100%" stop-color="#5856D6"/>
              </linearGradient>
            </defs>
          </svg>
          <span class="logo-text">FlexiDoc</span>
        </div>
        <nav class="nav">
          <span class="nav-item active">格式转换</span>
        </nav>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main">
      <!-- 步骤指示器 -->
      <div class="steps">
        <div class="step" :class="{ active: currentStep === 'upload', completed: currentStep !== 'upload' }">
          <div class="step-number">1</div>
          <span class="step-label">上传文件</span>
        </div>
        <div class="step-line" :class="{ active: currentStep !== 'upload' }"></div>
        <div class="step" :class="{ active: currentStep === 'select', completed: ['preview', 'convert'].includes(currentStep) }">
          <div class="step-number">2</div>
          <span class="step-label">选择格式</span>
        </div>
        <div class="step-line" :class="{ active: ['preview', 'convert'].includes(currentStep) }"></div>
        <div class="step" :class="{ active: currentStep === 'preview', completed: currentStep === 'convert' }">
          <div class="step-number">3</div>
          <span class="step-label">预览确认</span>
        </div>
        <div class="step-line" :class="{ active: currentStep === 'convert' }"></div>
        <div class="step" :class="{ active: currentStep === 'convert' }">
          <div class="step-number">4</div>
          <span class="step-label">转换下载</span>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content">
        <!-- 上传步骤 -->
        <FileUploader 
          v-if="currentStep === 'upload'" 
          @select="handleFileSelect" 
        />

        <!-- 格式选择步骤 -->
        <FormatSelector
          v-else-if="currentStep === 'select' && sourceFile"
          :source-file="sourceFile"
          :available-formats="availableTargetFormats"
          :selected-format="targetFormat"
          @select="handleFormatSelect"
          @back="handleBack"
        />

        <!-- 预览步骤 -->
        <FilePreview
          v-else-if="currentStep === 'preview' && sourceFile && targetFormat"
          :source-file="sourceFile"
          :target-format="targetFormat"
          :preview-url="previewUrl"
          @convert="handleStartConvert"
          @back="handleBack"
        />

        <!-- 转换步骤 -->
        <ConversionProgress
          v-else-if="currentStep === 'convert' && conversionTask"
          :task="conversionTask"
          @download="handleDownload"
          @reset="handleReset"
          @new-convert="handleNewConvert"
        />
      </div>
    </main>

    <!-- 底部 -->
    <footer class="footer">
      <p>FlexiDoc - 多种文档格式转换工具 · 所有文件处理均在本地完成，保护您的隐私</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
}

/* 头部 */
.header {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 36px;
  height: 36px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-gray-900);
  letter-spacing: -0.02em;
}

.nav {
  display: flex;
  gap: 32px;
}

.nav-item {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-gray-500);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.nav-item:hover,
.nav-item.active {
  color: var(--color-primary);
}

/* 主内容 */
.main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 24px;
}

/* 步骤指示器 */
.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 48px;
  gap: 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-gray-200);
  color: var(--color-gray-500);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  transition: all var(--transition-normal);
}

.step.active .step-number {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.step.completed .step-number {
  background: var(--color-success);
  color: white;
}

.step-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-gray-500);
  transition: color var(--transition-fast);
}

.step.active .step-label {
  color: var(--color-primary);
}

.step-line {
  width: 60px;
  height: 2px;
  background: var(--color-gray-200);
  margin: 0 12px;
  margin-bottom: 24px;
  transition: background var(--transition-normal);
}

.step-line.active {
  background: var(--color-primary);
}

/* 内容区 */
.content {
  animation: fadeIn var(--transition-normal) ease-out;
}

/* 底部 */
.footer {
  padding: 24px;
  text-align: center;
  color: var(--color-gray-500);
  font-size: 13px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background: white;
}

/* 响应式 */
@media (max-width: 640px) {
  .header-content {
    padding: 0 16px;
  }
  
  .main {
    padding: 24px 16px;
  }
  
  .steps {
    transform: scale(0.85);
  }
  
  .step-line {
    width: 40px;
  }
}
</style>