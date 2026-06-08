<script setup lang="ts">
import type { FileInfo, FileFormat } from '@/types'
import { FORMAT_INFO, formatFileSize } from '@/utils/format'

defineProps<{
  sourceFile: FileInfo
  availableFormats: FileFormat[]
  selectedFormat: FileFormat | null
}>()

const emit = defineEmits<{
  (e: 'select', format: FileFormat): void
  (e: 'back'): void
}>()

function handleSelect(format: FileFormat) {
  emit('select', format)
}

function handleBack() {
  emit('back')
}
</script>

<template>
  <div class="format-selector">
    <!-- 源文件信息 -->
    <div class="source-info">
      <div class="file-card">
        <div class="file-icon" :style="{ background: FORMAT_INFO[sourceFile.format].color + '15' }">
          <span class="icon-emoji">{{ FORMAT_INFO[sourceFile.format].icon }}</span>
        </div>
        <div class="file-details">
          <h3 class="file-name">{{ sourceFile.name }}</h3>
          <div class="file-meta">
            <span class="file-format">{{ FORMAT_INFO[sourceFile.format].name }}</span>
            <span class="file-size">{{ formatFileSize(sourceFile.size) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 转换箭头 -->
    <div class="convert-arrow">
      <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
        <path d="M0 12H44M44 12L36 4M44 12L36 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <!-- 目标格式选择 -->
    <div class="target-section">
      <h2 class="section-title">选择目标格式</h2>
      <div class="format-grid">
        <button
          v-for="format in availableFormats"
          :key="format"
          class="format-card"
          :class="{ selected: selectedFormat === format }"
          @click="handleSelect(format)"
        >
          <div class="format-icon" :style="{ background: FORMAT_INFO[format].color + '15' }">
            <span class="icon-emoji">{{ FORMAT_INFO[format].icon }}</span>
          </div>
          <div class="format-info">
            <span class="format-name">{{ FORMAT_INFO[format].name }}</span>
            <span class="format-ext">{{ FORMAT_INFO[format].extension }}</span>
          </div>
          <div v-if="selectedFormat === format" class="check-mark">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="var(--color-primary)"/>
              <path d="M6 10L9 13L14 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </button>
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
    </div>
  </div>
</template>

<style scoped>
.format-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.source-info {
  width: 100%;
  max-width: 400px;
}

.file-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.file-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-emoji {
  font-size: 28px;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--color-gray-500);
}

.file-format {
  font-weight: 500;
}

.convert-arrow {
  color: var(--color-gray-400);
}

.target-section {
  width: 100%;
  max-width: 800px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-gray-900);
  text-align: center;
  margin: 0 0 24px 0;
}

.format-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.format-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.format-card:hover {
  border-color: var(--color-gray-200);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.format-card.selected {
  border-color: var(--color-primary);
  background: rgba(0, 122, 255, 0.02);
}

.format-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.format-icon .icon-emoji {
  font-size: 22px;
}

.format-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}

.format-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-gray-900);
}

.format-ext {
  font-size: 12px;
  color: var(--color-gray-500);
}

.check-mark {
  position: absolute;
  top: -8px;
  right: -8px;
}

.actions {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 500;
  transition: all var(--transition-fast);
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
  .format-grid {
    grid-template-columns: 1fr;
  }
}
</style>