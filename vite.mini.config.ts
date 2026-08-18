import { defineConfig } from 'vite'
import { createAppConfig } from './vite.shared'

// Mini App cho người dân (Zalo Mini App)
export default defineConfig(createAppConfig('mini-app', 5173))
