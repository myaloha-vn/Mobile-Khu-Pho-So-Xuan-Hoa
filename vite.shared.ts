import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { UserConfig } from 'vite'

const rootDir = __dirname

/** Cho phép import kiểu `figma:asset/ten-file.png` mà Figma Make sinh ra. */
function figmaAssetResolver(appDir: string) {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        return path.resolve(appDir, 'src/assets', id.replace('figma:asset/', ''))
      }
    },
  }
}

/**
 * Config dùng chung cho cả 2 app.
 * @param app  tên thư mục trong apps/ ("mini-app" hoặc "admin")
 * @param port cổng dev server
 */
export function createAppConfig(app: string, port: number): UserConfig {
  const appDir = path.resolve(rootDir, 'apps', app)

  return {
    root: appDir,
    plugins: [
      figmaAssetResolver(appDir),
      // Cả React lẫn Tailwind plugin đều bắt buộc với file Figma Make - đừng gỡ
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(appDir, 'src'),
        '@shared': path.resolve(rootDir, 'shared'),
      },
    },
    server: { port, strictPort: false },
    build: {
      outDir: path.resolve(rootDir, 'dist', app),
      emptyOutDir: true,
    },
    // Kiểu file cho phép import raw. Không bao giờ thêm .css, .ts, .tsx vào đây.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
}
