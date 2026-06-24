import React from 'react'
import { Link } from 'react-router-dom'

const sections = [
  {
    title: 'Thu thập thông tin',
    content: 'Chúng tôi thu thập các thông tin sau khi bạn đăng ký và sử dụng Dịch vụ: (a) Thông tin cá nhân: họ tên, địa chỉ email, số điện thoại, địa chỉ giao hàng; (b) Thông tin sử dụng: lịch sử mượn sách, tìm kiếm, đánh giá và xếp hạng; (c) Thông tin giao dịch: lịch sử nạp tiền, thanh toán phạt, đặt cọc; (d) Thông tin kỹ thuật: địa chỉ IP, loại trình duyệt, hệ điều hành.',
  },
  {
    title: 'Mục đích sử dụng',
    content: 'Thông tin thu thập được sử dụng cho các mục đích: (a) Quản lý tài khoản và cung cấp Dịch vụ; (b) Xử lý giao dịch mượn trả sách và thanh toán; (c) Cải thiện trải nghiệm người dùng và phát triển tính năng mới; (d) Gửi thông báo liên quan đến tài khoản, đơn mượn sách và các cập nhật dịch vụ; (e) Hỗ trợ khách hàng và giải quyết vấn đề kỹ thuật. Chúng tôi không sử dụng thông tin của bạn cho mục đích quảng cáo mà không có sự đồng ý.',
  },
  {
    title: 'Bảo mật dữ liệu',
    content: 'LibraryMS áp dụng các biện pháp bảo mật nghiêm ngặt để bảo vệ dữ liệu của bạn: mã hóa mật khẩu bằng bcrypt, xác thực JWT (JSON Web Token) cho phiên làm việc, mã hóa SSL/TLS cho truyền dữ liệu, và phân quyền truy cập chặt chẽ (RBAC). Hệ thống được kiểm tra bảo mật định kỳ và tuân thủ các tiêu chuẩn an toàn thông tin. Tuy nhiên, không có phương thức truyền tải hoặc lưu trữ nào là an toàn tuyệt đối.',
  },
  {
    title: 'Chia sẻ thông tin',
    content: 'Chúng tôi cam kết không bán, trao đổi hoặc chuyển giao thông tin cá nhân của bạn cho bên thứ ba vì mục đích thương mại. Thông tin của bạn chỉ được chia sẻ trong các trường hợp: (a) Có sự đồng ý của bạn; (b) Tuân thủ yêu cầu pháp lý hoặc quy trình tòa án; (c) Bảo vệ quyền lợi, tài sản hoặc sự an toàn của LibraryMS, người dùng hoặc công chúng; (d) Với các đối tác cung cấp dịch vụ hỗ trợ (vận chuyển, thanh toán) và chỉ trong phạm vi cần thiết.',
  },
  {
    title: 'Cookie & Tracking',
    content: 'LibraryMS sử dụng cookie và localStorage để cải thiện trải nghiệm người dùng: (a) Cookie phiên: duy trì trạng thái đăng nhập trong phiên làm việc; (b) LocalStorage: lưu thông tin cấu hình giao diện và dữ liệu tạm thời. Bạn có thể tùy chỉnh cài đặt cookie trong trình duyệt. Tuy nhiên, việc vô hiệu hóa cookie có thể ảnh hưởng đến một số tính năng của Dịch vụ. Chúng tôi không sử dụng cookie của bên thứ ba cho mục đích theo dõi quảng cáo.',
  },
  {
    title: 'Quyền người dùng',
    content: 'Bạn có quyền: (a) Truy cập và xem thông tin cá nhân trong trang hồ sơ; (b) Chỉnh sửa thông tin cá nhân bất kỳ lúc nào; (c) Yêu cầu xóa tài khoản, sau đó dữ liệu của bạn sẽ được ẩn danh hoặc xóa trong vòng 30 ngày; (d) Xuất dữ liệu cá nhân theo yêu cầu; (e) Rút lại sự đồng ý sử dụng dữ liệu bất kỳ lúc nào. Để thực hiện các quyền này, vui lòng liên hệ support@libraryms.vn.',
  },
  {
    title: 'Lưu trữ dữ liệu',
    content: 'Chúng tôi lưu trữ dữ liệu của bạn trong suốt thời gian tài khoản còn hoạt động. Sau khi tài khoản bị xóa hoặc vô hiệu hóa, dữ liệu sẽ được lưu trữ thêm 90 ngày để phục vụ mục đích kiểm toán và tuân thủ pháp lý, sau đó sẽ bị xóa hoặc ẩn danh vĩnh viễn. Lịch sử giao dịch tài chính và nhật ký hệ thống có thể được lưu trữ lâu hơn theo quy định pháp luật hiện hành.',
  },
  {
    title: 'Thay đổi chính sách',
    content: 'Chính sách bảo mật này có thể được cập nhật định kỳ để phản ánh các thay đổi trong hoạt động của chúng tôi hoặc yêu cầu pháp lý. Khi có thay đổi quan trọng, chúng tôi sẽ thông báo qua email đăng ký hoặc thông báo trên website. Bạn nên xem xét chính sách này định kỳ. Việc tiếp tục sử dụng Dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận chính sách cập nhật.',
  },
  {
    title: 'Liên hệ',
    content: 'Nếu bạn có bất kỳ câu hỏi hoặc lo ngại nào về chính sách bảo mật hoặc cách chúng tôi xử lý dữ liệu cá nhân, vui lòng liên hệ qua email privacy@libraryms.vn hoặc gửi thư về địa chỉ: LibraryMS, Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội. Chúng tôi sẽ phản hồi trong vòng 7 ngày làm việc.',
  },
]

export default function PrivacyPage() {
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

        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 font-heading">Chính sách bảo mật</h1>
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
