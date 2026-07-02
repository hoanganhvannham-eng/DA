import React, { useState } from 'react'
// 6
const faqs = [
  {
    q: 'Làm thế nào để đăng ký tài khoản?',
    a: 'Bạn có hai cách: (1) Nhấn nút "Đăng ký miễn phí", điền email, mật khẩu và xác nhận — kiểm tra email để xác thực tài khoản; (2) Đăng nhập ngay bằng tài khoản Google chỉ với một cú nhấp. Không cần thẻ tín dụng hay bất kỳ khoản phí nào.',
  },
  {
    q: 'Tôi có thể mượn bao nhiêu sách cùng lúc?',
    a: 'Bạn có thể mượn tối đa 5 cuốn sách cùng một thời điểm. Giới hạn này giúp đảm bảo nguồn sách luôn sẵn có cho tất cả độc giả. Nếu bạn có nhu cầu mượn nhiều hơn, vui lòng liên hệ với thư viện để được xem xét.',
  },
  {
    q: 'Thời hạn mượn sách là bao lâu?',
    a: 'Thời hạn mượn mặc định là 14 ngày. Bạn có thể chọn thời hạn từ 1 đến 30 ngày khi đặt mượn. Trước khi hết hạn 3 ngày, bạn có thể gia hạn thêm 7 ngày một lần. Hệ thống sẽ gửi email nhắc nhở trước khi sách đến hạn trả.',
  },
  {
    q: 'Phí phạt trễ hạn được tính như thế nào?',
    a: 'Phí phạt được tính theo 3 cấp độ: (1) Nhẹ: trễ 1-3 ngày — 5,000đ/ngày; (2) Trung bình: trễ 4-7 ngày — 10,000đ/ngày; (3) Nặng: trễ trên 7 ngày — 20,000đ/ngày. Tiền phạt sẽ được tự động khấu trừ từ ví điện tử của bạn. Bạn có thể xem chi tiết trong mục "Khoản phạt của tôi".',
  },
  {
    q: 'Tôi có thể trả sách ở đâu?',
    a: 'Bạn có hai lựa chọn: (1) Trả tại thư viện — đến quầy, nhân viên sẽ quét mã và xác nhận; (2) Trả qua vận chuyển — đóng gói sách và gửi qua dịch vụ vận chuyển, hệ thống sẽ cập nhật trạng thái khi nhận được. Phí vận chuyển do người mượn chi trả.',
  },
  {
    q: 'Làm thế nào để nạp tiền vào ví?',
    a: 'Vào mục "Ví điện tử" trong tài khoản, chọn số tiền muốn nạp (từ 10,000đ đến 5,000,000đ), sau đó chọn phương thức thanh toán và làm theo hướng dẫn. Tiền sẽ được cập nhật vào ví ngay lập tức sau khi thanh toán thành công.',
  },
  {
    q: 'Chức năng gợi ý theo Mood hoạt động ra sao?',
    a: 'Bạn chỉ cần chọn tâm trạng hiện tại (Vui vẻ, Căng thẳng, Cần tập trung, Mệt mỏi, Muốn khám phá, Lãng mạn). Hệ thống AI sẽ phân tích và gợi ý những cuốn sách phù hợp nhất với tâm trạng đó. Không cần đăng nhập, dùng thử ngay trên trang chủ.',
  },
  {
    q: 'Tôi có thể hủy yêu cầu mượn sách không?',
    a: 'Có, bạn có thể hủy yêu cầu mượn sách bất kỳ lúc nào trước khi yêu cầu được xác nhận. Vào mục "Lịch sử mượn sách", tìm yêu cầu đang ở trạng thái "Chờ xác nhận" và nhấn "Hủy". Nếu đã được xác nhận, vui lòng liên hệ thư viện để được hỗ trợ.',
  },
  {
    q: 'Làm thế nào khi sách bị hư hỏng?',
    a: 'Khi trả sách, nếu sách bị hư hỏng bạn cần báo cáo với nhân viên thư viện. Mức phạt sẽ được đánh giá dựa trên mức độ hư hỏng: nhẹ (ghi chú, quăn mép), trung bình (rách trang, ố nước), nặng (mất trang, hư hỏng nặng).',
  },
  {
    q: 'Dữ liệu cá nhân của tôi có được bảo mật không?',
    a: 'Tuyệt đối. Chúng tôi áp dụng các biện pháp bảo mật nghiêm ngặt: mã hóa mật khẩu (bcrypt), xác thực JWT, SSL/TLS cho truyền dữ liệu, và phân quyền RBAC. Chúng tôi cam kết không chia sẻ thông tin cá nhân của bạn với bên thứ ba. Xem chi tiết tại <a href="/privacy" class="text-cyan-400 hover:text-cyan-300 underline">Chính sách bảo mật</a>.',
  },
]

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section id="faq" className="py-24 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 text-cyan-400 label-cyber mb-5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
            </svg>
            Câu hỏi thường gặp
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5">
            Bạn có{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">thắc mắc</span>
            ?
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Những câu hỏi phổ biến nhất về LibraryMS — chúng tôi đã tổng hợp để giúp bạn dễ dàng tìm câu trả lời.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-cyan-500/20"
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-white font-medium pr-4 text-sm sm:text-base">{faq.q}</span>
                <svg
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <div
                className="transition-all duration-300 ease-in-out overflow-hidden"
                style={{ maxHeight: openIndex === i ? '400px' : '0' }}
              >
                <div className="px-5 pb-5 text-slate-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: faq.a }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
