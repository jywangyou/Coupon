import { closeToast, showConfirmDialog, showLoadingToast, showToast } from 'vant'
import { createJdCommand, createTpwd } from '../services/products'

async function copyText(text) {
  if (!text) return false
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    textarea.remove()
    return copied
  }
}

// 复制/跳转行为按平台区分：淘宝复制淘口令，京东复制京口令（没有京口令时弹窗引导跳转推广链接）。
export function useProductActions(platform) {
  const resolvePlatform = () => (typeof platform === 'function' ? platform() : platform)

  async function copyPrimary(product) {
    if (!product?.link) return showToast('暂时没有可复制的商品链接')
    const current = resolvePlatform()

    if (current.id === 'jd') {
      showLoadingToast({ message: '正在生成京口令…', forbidClick: true, duration: 0 })
      let result
      try {
        result = await createJdCommand(product.link)
      } catch {
        closeToast()
        const copied = await copyText(product.link)
        return showToast(copied ? '京口令生成失败，已复制商品链接' : '复制失败，请稍后再试')
      }
      closeToast()

      if (result.command) {
        const copied = await copyText(result.command)
        return showToast(copied ? current.copySuccess : '复制失败，请手动复制')
      }

      if (result.clickUrl) {
        try {
          await showConfirmDialog({
            title: '暂未生成京口令',
            message: '该商品暂时无法生成京口令，是否前往京东推广页面？',
            confirmButtonText: '立即前往',
            cancelButtonText: '取消'
          })
          window.open(result.clickUrl, '_blank', 'noopener,noreferrer')
        } catch {
          // 用户取消，无需处理
        }
        return
      }

      const copied = await copyText(product.link)
      return showToast(copied ? '京口令生成失败，已复制商品链接' : '复制失败，请手动复制')
    }

    showLoadingToast({ message: '正在生成淘口令…', forbidClick: true, duration: 0 })
    try {
      const result = await createTpwd(product.link, product.title)
      const copied = await copyText(result.password)
      closeToast()
      const message = result.source === 'fallback' ? '接口暂不可用，已复制商品链接' : current.copySuccess
      showToast(copied ? message : '复制失败，请手动复制')
    } catch {
      closeToast()
      const copied = await copyText(product.link)
      showToast(copied ? '接口暂不可用，已复制商品链接' : '复制失败，请稍后再试')
    }
  }

  function openLink(product) {
    if (!product?.link) return showToast('暂时没有可用的优惠券链接')
    window.open(product.link, '_blank', 'noopener,noreferrer')
  }

  return { copyPrimary, openLink }
}
