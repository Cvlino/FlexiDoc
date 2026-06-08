<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'select', file: File): void
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// 支持的文件类型
const acceptedTypes = '.docx,.pdf,.xlsx,.csv,.md,.html,.txt,.png,.jpg,.jpeg,.json'

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

function processFile(file: File) {
  emit('select', file)
}

function triggerFileInput() {
  fileInput.value?.click()
}
</script>

<template>
  <div class="uploader">
    <div 
      class="drop-zone"
      :class="{ dragging: isDragging }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="triggerFileInput"
    >
      <div class="drop-icon">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="16" fill="url(#upload-gradient)"/>
          <path d="M32 20V44M32 20L24 28M32 20L40 28" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M18 44H46" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          <defs>
            <linearGradient id="upload-gradient" x1="0" y1="0" x2="64" y2="64">
              <stop offset="0%" stop-color="#007AFF"/>
              <stop offset="100%" stop-color="#5856D6"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h3 class="drop-title">拖放文件到此处</h3>
      <p class="drop-subtitle">或点击选择文件</p>
      <div class="supported-formats">
        <span class="format-tag">Word</span>
        <span class="format-tag">PDF</span>
        <span class="format-tag">Excel</span>
        <span class="format-tag">CSV</span>
        <span class="format-tag">Markdown</span>
        <span class="format-tag">HTML</span>
        <span class="format-tag">图片</span>
        <span class="format-tag">JSON</span>
      </div>
      <input
        ref="fileInput"
        type="file"
        :accept="acceptedTypes"
        class="file-input"
        @change="handleFileChange"
      />
    </div>
    
    <div class="features">
      <div class="feature">
        <div class="feature-icon">🔒</div>
        <div class="feature-text">
          <h4>隐私安全</h4>
          <p>所有文件处理均在浏览器本地完成，不会上传到服务器</p>
        </div>
      </div>
      <div class="feature">
        <div class="feature-icon">⚡</div>
        <div class="feature-text">
          <h4>快速转换</h4>
          <p>无需等待上传下载，即时完成格式转换</p>
        </div>
      </div>
      <div class="feature">
        <div class="feature-icon">🎯</div>
        <div class="feature-text">
          <h4>多种格式</h4>
          <p>支持 Word、PDF、Excel、Markdown 等多种格式互转</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
}

.drop-zone {
  width: 100%;
  max-width: 600px;
  padding: 64px 48px;
  background: white;
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.drop-zone:hover {
  border-color: var(--color-primary);
  background: rgba(0, 122, 255, 0.02);
}

.drop-zone.dragging {
  border-color: var(--color-primary);
  background: rgba(0, 122, 255, 0.05);
  transform: scale(1.01);
}

.drop-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 8px;
}

.drop-icon svg {
  width: 100%;
  height: 100%;
}

.drop-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
}

.drop-subtitle {
  font-size: 15px;
  color: var(--color-gray-500);
  margin: 0;
}

.supported-formats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
}

.format-tag {
  padding: 6px 12px;
  background: var(--color-gray-100);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-gray-600);
}

.file-input {
  display: none;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  width: 100%;
  max-width: 800px;
}

.feature {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.feature-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.feature-text h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0 0 4px 0;
}

.feature-text p {
  font-size: 13px;
  color: var(--color-gray-500);
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .features {
    grid-template-columns: 1fr;
  }
  
  .drop-zone {
    padding: 48px 32px;
  }
}

@media (max-width: 480px) {
  .drop-zone {
    padding: 32px 24px;
  }
  
  .drop-title {
    font-size: 18px;
  }
}
</style>