import dayjs from 'dayjs'

const TableHeader = ({ children }) => (
  <thead className="sticky top-0 z-10 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5">
    <tr>{children}</tr>
  </thead>
)

const Th = ({ children }) => (
  <th className="px-6 py-5 text-left text-sm  font-semibold text-white/50 uppercase tracking-wider">
    {children}
  </th>
)

const GlassTable = ({ children }) => (
  <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
    <div className="overflow-x-auto max-h-[600px]">
      <table className="w-full text-left border-collapse">
        {children}
      </table>
    </div>
  </div>
)

export const BookTable = ({ data }) => {
  if (!data?.categories?.length) return null
  return (
    <GlassTable>
      <TableHeader>
        <Th>Thể loại</Th>
        <Th>Tổng số sách</Th>
        <Th>Số lần mượn</Th>
      </TableHeader>
      <tbody className="divide-y divide-white/[0.03]">
        {data.categories.map((cat, i) => (
          <tr key={cat.categoryId || i} className="hover:bg-white/[0.02] transition-colors group">
            <td className="px-6 py-4 font-medium text-white group-hover:text-cyan-400 transition-colors text-sm">{cat.categoryName || 'Không phân loại'}</td>
            <td className="px-6 py-4 text-emerald-400 font-mono text-sm">{cat.totalBooks}</td>
            <td className="px-6 py-4 text-violet-400 font-mono text-sm">{cat.borrowCount}</td>
          </tr>
        ))}
      </tbody>
    </GlassTable>
  )
}

export const BorrowReturnTable = ({ data }) => {
  if (!data?.timeBuckets?.length) return null
  return (
    <GlassTable>
      <TableHeader>
        <Th>Kỳ</Th>
        <Th>Mượn</Th>
        <Th>Trả</Th>
      </TableHeader>
      <tbody className="divide-y divide-white/[0.03]">
        {data.timeBuckets.map((bucket, i) => (
          <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
            <td className="px-6 py-4 text-cyan-400 font-mono text-sm">{bucket.period}</td>
            <td className="px-6 py-4 text-white/80 font-mono text-sm">{bucket.borrows}</td>
            <td className="px-6 py-4 text-emerald-400 font-mono text-sm">{bucket.returns}</td>
          </tr>
        ))}
      </tbody>
    </GlassTable>
  )
}

export const FineTable = ({ data }) => {
  if (!data?.debtors?.length) return null
  return (
    <GlassTable>
      <TableHeader>
        <Th>Độc giả</Th>
        <Th>Số phiếu phạt</Th>
        <Th>Tổng nợ</Th>
      </TableHeader>
      <tbody className="divide-y divide-white/[0.03]">
        {data.debtors.map((d, i) => (
          <tr key={d.readerId || i} className="hover:bg-white/[0.02] transition-colors group">
            <td className="px-6 py-4 font-medium text-white group-hover:text-cyan-400 transition-colors text-sm">{d.readerName}</td>
            <td className="px-6 py-4 text-white/60 font-mono text-sm">{d.ticketCount}</td>
            <td className="px-6 py-4 text-rose-400 font-mono text-sm font-bold">{(d.totalOwed || 0).toLocaleString()}đ</td>
          </tr>
        ))}
      </tbody>
    </GlassTable>
  )
}

export const LostDamagedTable = ({ data }) => {
  if (!data?.records?.length) return null
  return (
    <GlassTable>
      <TableHeader>
        <Th>Tên sách</Th>
        <Th>ISBN</Th>
        <Th>Độc giả</Th>
        <Th>Tình trạng</Th>
        <Th>Ngày trả</Th>
      </TableHeader>
      <tbody className="divide-y divide-white/[0.03]">
        {data.records.map((r, i) => (
          <tr key={r.borrowId || i} className="hover:bg-white/[0.02] transition-colors group">
            <td className="px-6 py-4 font-medium text-white group-hover:text-rose-400 transition-colors uppercase text-sm max-w-[200px] truncate">{r.title}</td>
            <td className="px-6 py-4 text-white/40 font-mono text-sm">{r.isbn || '-'}</td>
            <td className="px-6 py-4 text-white/60 text-sm">{r.readerName}</td>
            <td className="px-6 py-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                r.bookCondition === 'LOST'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {r.bookCondition === 'LOST' ? 'Mất' : 'Hư hỏng'}
              </span>
            </td>
            <td className="px-6 py-4 text-white/60 font-mono text-sm">
              {r.returnedAt ? dayjs(r.returnedAt).format('DD/MM/YYYY') : '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </GlassTable>
  )
}
