/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic'
  })],
  esbuild: {
    jsx: 'automatic'
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    css: true,
    reporters: ['verbose'],
    include: ['src/**/*.test.{js,jsx}'],
    transformMode: {
      web: [/\.[jt]sx?$/]
    },
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.js',
        'src/reportWebVitals.js',
        'src/index.js',
        '**/*.test.{js,jsx}',
        '**/*.spec.{js,jsx}'
      ]
    }
  }
})