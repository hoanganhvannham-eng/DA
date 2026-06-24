const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs  font-bold uppercase transition-all duration-300 ${
      active
        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 glow-cyan'
        : 'text-white/40 hover:text-white hover:bg-white/5'
    }`}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {label}
  </button>
)

export default TabButton
