/**
 * Tạo gradient màu cho bìa sách khi sách không có ảnh bìa (imageUrl).
 * Màu được chọn cố định dựa trên tổng mã ký tự của tên sách,
 * nên cùng 1 tên sách luôn ra cùng 1 màu (không bị đổi màu mỗi lần render).
 *
 * @param {string} title - Tên sách
 * @returns {string} Tailwind gradient classes, dùng trong className
 *                    Ví dụ: "from-indigo-600 via-indigo-800 to-slate-900"
 */
export const getCoverGradientPreset = (title = '') => {
  const charCodeSum = title.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const presets = [
    'from-indigo-600 via-indigo-800 to-slate-900',
    'from-emerald-600 via-teal-800 to-slate-900',
    'from-violet-600 via-purple-800 to-slate-900',
    'from-cyan-600 via-blue-800 to-slate-900',
    'from-rose-600 via-pink-800 to-slate-900',
  ]
  return presets[charCodeSum % presets.length]
}