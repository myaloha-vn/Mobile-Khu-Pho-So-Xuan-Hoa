import { defineConfig } from 'vite'
import { createAppConfig } from './vite.shared'

// Hệ thống điều hành: dashboard + màn LED + giao diện mobile cho cán bộ
export default defineConfig(createAppConfig('admin', 5174))
