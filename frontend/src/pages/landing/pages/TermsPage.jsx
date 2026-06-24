import React from 'react'
import { Link } from 'react-router-dom'

const sections = [
  {
    title: 'Điều khoản chung',
    content: 'Khi truy cập và sử dụng Hệ thống Quản lý Thư viện LibraryMS ("Dịch vụ"), bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng Dịch vụ. Chúng tôi có quyền sửa đổi các điều khoản này bất kỳ lúc nào và sẽ thông báo qua email hoặc thông báo trên website.',
  },
  {
    title: 'Đăng ký tài khoản',
    content: 'Để sử dụng đầy đủ các tính năng của LibraryMS, bạn cần đăng ký tài khoản. Bạn cam kết cung cấp thông tin chính xác, đầy đủ và cập nhật. Bạn chịu trách nhiệm bảo mật thông tin tài khoản và mọi hoạt động diễn ra dưới tài khoản của mình. LibraryMS không chịu trách nhiệm cho bất kỳ tổn thất nào phát sinh từ việc bạn không bảo vệ tài khoản của mình.',
  },
  {
    title: 'Quy tắc sử dụng',
    content: 'Bạn đồng ý không sử dụng Dịch vụ vào các mục đích bất hợp pháp hoặc bị cấm bởi các điều khoản này. Các hành vi bị nghiêm cấm bao gồm: (a) can thiệp, phá hoại hoặc làm gián đoạn Dịch vụ; (b) tải lên nội dung độc hại, virus hoặc mã gây hại; (c) lạm dụng hệ thống để spam hoặc gửi thông tin trái phép; (d) cố gắng truy cập trái phép vào hệ thống hoặc tài khoản của người dùng khác.',
  },
  {
    title: 'Mượn & Trả sách',
    content: 'Người dùng có thể mượn tối đa 5 cuốn sách cùng lúc. Thời hạn mượn mặc định là 14 ngày và có thể gia hạn thêm 7 ngày trước khi hết hạn. Sách phải được trả đúng hạn theo hình thức đã chọn (tại thư viện hoặc qua vận chuyển). Trong trường hợp sách bị hư hỏng hoặc mất, người dùng phải bồi thường theo quy định của thư viện. Phí phạt trễ hạn sẽ được tính dựa trên bảng phạt hiện hành.',
  },
  {
    title: 'Phí & Thanh toán',
    content: 'LibraryMS cung cấp ví điện tử tích hợp cho phép người dùng nạp tiền và thực hiện các giao dịch như đặt cọc mượn sách và thanh toán phạt. Tất cả giao dịch được ghi nhận và có lịch sử rõ ràng. Phí phạt trễ hạn được áp dụng theo 3 cấp độ: nhẹ (1-3 ngày), trung bình (4-7 ngày) và nặng (trên 7 ngày). Số dư trong ví có thể được hoàn trả khi người dùng yêu cầu đóng tài khoản.',
  },
  {
    title: 'Bản quyền nội dung',
    content: 'Toàn bộ nội dung trên Dịch vụ, bao gồm nhưng không giới hạn ở văn bản, hình ảnh, logo, biểu tượng, giao diện, mã nguồn đều thuộc sở hữu của LibraryMS hoặc các đối tác cấp phép. Người dùng không được sao chép, phân phối, sửa đổi hoặc tạo tác phẩm phái sinh từ nội dung của Dịch vụ khi chưa có sự đồng ý bằng văn bản từ chúng tôi.',
  },
  {
    title: 'Trách nhiệm',
    content: 'LibraryMS được cung cấp "nguyên trạng" mà không có bất kỳ bảo đảm nào, rõ ràng hay ngụ ý. Chúng tôi không đảm bảo rằng Dịch vụ sẽ đáp ứng mọi nhu cầu của bạn hoặc không bị gián đoạn, kịp thời, an toàn hoặc không có lỗi. Trong mọi trường hợp, LibraryMS không chịu trách nhiệm cho bất kỳ thiệt hại trực tiếp, gián tiếp, ngẫu nhiên hoặc do hậu quả nào phát sinh từ việc sử dụng hoặc không thể sử dụng Dịch vụ.',
  },
  {
    title: 'Sửa đổi điều khoản',
    content: 'Chúng tôi có quyền sửa đổi hoặc cập nhật các điều khoản này bất kỳ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên website. Bạn nên kiểm tra định kỳ để cập nhật. Việc tiếp tục sử dụng Dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới. Chúng tôi sẽ cố gắng thông báo trước về các thay đổi quan trọng qua email.',
  },
  {
    title: 'Liên hệ',
    content: 'Nếu bạn có bất kỳ câu hỏi nào về Điều khoản sử dụng, vui lòng liên hệ với chúng tôi qua email support@libraryms.vn hoặc hotline 1900-xxxx-xx. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.',
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute top-1/3 -right-48 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '-4s' }} />
        <div className="absolute -bottom-48 left-1/3 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '-8s' }} />
      </div>
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-cyan-400 transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Quay lại trang chủ
        </Link>

        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 font-heading">Điều khoản sử dụng</h1>
        <p className="text-white/40 text-sm mb-12">Cập nhật lần cuối: Tháng 6, 2026</p>

        <div className="space-y-6">
          {sections.map((s, i) => (
            <div key={i} className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-white mb-4 font-heading">{i + 1}. {s.title}</h2>
              <p className="text-slate-300 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
