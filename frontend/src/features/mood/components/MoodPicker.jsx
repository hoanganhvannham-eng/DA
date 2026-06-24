import React, { useState, useEffect } from 'react'
import { getPublicMoods } from '../services/moodService'

const moodEmojis = {
  'Stress': '😓',
  'Mất động lực': '😴',
  'Cần tập trung': '🎯',
  'Muốn khám phá': '🌍',
  'Học kỹ năng mới': '💡',
  'Thư giãn tối': '🌙',
  'Căng thẳng': '😓',
  'Vui vẻ': '😊',
  'Buồn': '😢',
  'Tò mò': '🤔',
}

const moodColors = [
  'from-rose-500 to-pink-600',
  'from-orange-500 to-amber-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-indigo-500 to-blue-600',
  'from-pink-500 to-red-500',
  'from-yellow-500 to-orange-500',
  'from-teal-500 to-green-500',
  'from-purple-500 to-fuchsia-500',
]

const moodShadowColors = [
  'shadow-rose-500/20',
  'shadow-orange-500/20',
  'shadow-blue-500/20',
  'shadow-emerald-500/20',
  'shadow-violet-500/20',
  'shadow-indigo-500/20',
  'shadow-pink-500/20',
  'shadow-yellow-500/20',
  'shadow-teal-500/20',
  'shadow-purple-500/20',
]

export default function MoodPicker({ selectedMoodId, onMoodSelect }) {
  const [moods, setMoods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getPublicMoods()
      .then((data) => {
        if (mounted) setMoods(data.moods || [])
      })
      .catch(() => {
        if (mounted) setMoods([])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-wrap gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-28 rounded-full bg-white/[0.03] animate-pulse" />
        ))}
      </div>
    )
  }

  if (moods.length === 0) {
    return (
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-center">
        <p className="text-white/30 text-sm">Chưa có mood nào trong hệ thống</p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      {moods.map((mood, i) => (
        <button
          key={mood.id}
          onClick={() => onMoodSelect(mood.id, mood.name)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedMoodId === mood.id
              ? `bg-gradient-to-r ${moodColors[i % moodColors.length]} text-white shadow-lg ${moodShadowColors[i % moodShadowColors.length]}`
              : 'bg-white/[0.05] border border-white/10 text-white/40 hover:text-white hover:border-white/20'
          }`}
        >
          <span className="text-sm">{moodEmojis[mood.name] || '📚'}</span>
          {mood.name}
        </button>
      ))}
    </div>
  )
}
