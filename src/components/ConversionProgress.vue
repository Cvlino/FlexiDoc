<script setup lang="ts">
import { computed } from 'vue'
import type { ConversionTask } from '@/types'
import { FORMAT_INFO } from '@/utils/format'

const props = defineProps<{
  task: ConversionTask
}>()

const emit = defineEmits<{
  (e: 'download'): void
  (e: 'reset'): void
  (e: 'newConvert'): void
}>()

const isCompleted = computed(() => props.task.status === 'completed')
const isError = computed(() => props.task.status === 'error')
const isConverting = computed(() => props.task.status === 'converting')

const progressPercent = computed(() => Math.round(props.task.progress))

function handleDownload() {
  emit('download')
}

function handleReset() {
  emit('reset')
}

function handleNewConvert() {
  emit('newConvert')
}
</script>

<template>
  <div class="progress-container">
    <!-- 转换中状态 -->
    <div v-if="isConverting" class="status-card converting">
      <div class="status-icon">
        <div class="spinner"></div>
      </div>
      <h2 class="status-title">正在转换中...</h2>
      <p class="status-desc">请稍候，文件正在处理</p>
      
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <span class="progress-text">{{ progressPercent }}%</span>
      
      <div class="convert-info">
        <span class="format-badge source">
          {{ FORMAT_INFO[task.sourceFormat].icon }} {{ FORMAT_INFO[task.sourceFormat].name }}
        </span>
        <svg class="arrow" width="20" height="10" viewBox="0 0 20 10" fill="none">
          <path d="M0 5H18M18 5L13 0M18 5L13 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="format-badge target">
          {{ FORMAT_INFO[task.targetFormat].icon }} {{ FORMAT_INFO[task.targetFormat].name }}
        </span>
      </div>
    </div>

    <!-- 完成状态 -->
    <div v-else-if="isCompleted" class="status-card completed">
      <div class="status-icon success">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="24" fill="#34C759"/>
          <path d="M14 24L21 31L34 18" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2 class="status-title">转换完成!</h2>
      <p class="status-desc">文件已成功转换，可以下载了</p>
      
      <div class="result-card">
        <div class="result-icon" :style="{ background: FORMAT_INFO[task.targetFormat].color + '15' }">
          <span class="icon-emoji">{{ FORMAT_INFO[task.targetFormat].icon }}</span>
        </div>
        <div class="result-info">
          <h3 class="result-name">{{ task.resultName }}</h3>
          <span class="result-format">{{ FORMAT_INFO[task.targetFormat].name }}</span>
        </div>
        <button class="download-btn" @click="handleDownload">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3V14M10 14L5 9M10 14L15 9M3 17H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          下载
        </button>
      </div>
      
      <div class="actions">
        <button class="btn btn-secondary" @click="handleNewConvert">
          转换为其他格式
        </button>
        <button class="btn btn-outline" @click="handleReset">
          转换新文件
        </button>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="isError" class="status-card error">
      <div class="status-icon fail">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="24" fill="#FF3B30"/>
          <path d="M16 16L32 32M32 16L16 32" stroke="white" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>
      <h2 class="status-title">转换失败</h2>
      <p class="status-desc">{{ task.error || '处理过程中出现错误' }}</p>
      
      <div class="actions">
        <button class="btn btn-primary" @click="handleReset">
          重新开始
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.status-card {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: 48px 40px;
  text-align: center;
}

.status-icon {
  margin-bottom: 24px;
}

.spinner {
  width: 64px;
  height: 64px;
  border: 4px solid var(--color-gray-200);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

.status-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0 0 8px 0;
}

.status-desc {
  font-size: 15px;
  color: var(--color-gray-500);
  margin: 0 0 32px 0;
}

/* 进度条 */
.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-gray-100);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
}

/* 转换信息 */
.convert-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--color-gray-100);
}

.format-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 500;
}

.format-badge.source {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

.format-badge.target {
  background: rgba(0, 122, 255, 0.1);
  color: var(--color-primary);
}

.arrow {
  color: var(--color-gray-400);
}

/* 结果卡片 */
.result-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  margin-bottom: 32px;
}

.result-icon {
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

.result-info {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.result-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-format {
  font-size: 13px;
  color: var(--color-gray-500);
}

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.download-btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

/* 操作按钮 */
.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: var(--color-primary);
  color: white;
}

.btn-secondary:hover {
  background: var(--color-primary-hover);
}

.btn-outline {
  background: white;
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-300);
}

.btn-outline:hover {
  background: var(--color-gray-50);
  border-color: var(--color-gray-400);
}

/* 完成状态 */
.status-card.completed .status-icon {
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .status-card {
    padding: 32px 24px;
  }
  
  .result-card {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .result-info {
    text-align: center;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>