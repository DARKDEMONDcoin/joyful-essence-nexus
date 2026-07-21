import type { LandingContent } from "./types";

const vi: LandingContent = {
  meta: {
    title: "Megsy AI — Chat, Slides, Hình ảnh, Video & Mã nguồn",
    description:
      "Nền tảng AI tất cả trong một: Hơn 80 mô hình cho chat, slides, nghiên cứu chuyên sâu, tạo hình ảnh & video và xây dựng ứng dụng full-stack.",
    keywords:
      "nền tảng AI, thay thế ChatGPT, công cụ tạo ảnh AI, công cụ tạo video AI, AI slides, nghiên cứu chuyên sâu, trình xây dựng AI full-stack, Nano Banana Pro, GPT-Image 2, Gemini 3 Pro, Veo 3.1",
    ogLocale: "vi_VN",
  },
  hero: {
    h1Pre: "MỘT AI. MỌI CÔNG CỤ",
    h1Highlight: "SÁNG TẠO BẠN CẦN.",
    subtitle:
      "Chat, slides, nghiên cứu chuyên sâu, hình ảnh, video, điện ảnh, lip-sync và ứng dụng full-stack — được xây dựng trên những mô hình tốt nhất thế giới, hợp nhất trong một không gian làm việc.",
    ctaPrimary: "Bắt đầu sáng tạo — Miễn phí",
    ctaSecondary: "Nền tảng API",
  },
  chatModels: {
    kicker: "MEGSY CHAT",
    title: "MỘT CỬA SỔ CHAT.",
    titleHighlight: "MỌI MÔ HÌNH.",
    subtitle:
      "Megsy thông minh điều hướng tin nhắn của bạn đến mô hình tốt nhất — hoặc bạn có thể tự chọn thủ công. Chuyển đổi giữa các mô hình ngay trong cuộc hội thoại mà không mất ngữ cảnh.",
    items: [
      {
        name: "Megsy",
        tag: "Mặc định · Điều hướng thông minh",
        description: "Chọn mô hình hoàn hảo cho mọi câu lệnh. Miễn phí sử dụng.",
      },
      {
        name: "GPT-5",
        tag: "OpenAI",
        description: "Dẫn đầu về khả năng lập luận, lập trình và viết nội dung với ngữ cảnh dài.",
      },
      {
        name: "Gemini 2.5 Pro",
        tag: "Google",
        description: "Ngữ cảnh 1 triệu token, hiểu hình ảnh và tệp tin một cách tự nhiên.",
      },
      {
        name: "Grok",
        tag: "xAI",
        description: "Kiến thức web theo thời gian thực với phong cách dí dỏm, không bộ lọc.",
      },
      {
        name: "DeepSeek",
        tag: "Mã nguồn mở",
        description: "Mô hình lập luận hiệu quả về chi phí cho các khối lượng công việc lớn.",
      },
    ],
    modesTitle: "Chế độ chuyên biệt",
    modes: [
      {
        name: "Chế độ Học tập",
        description: "Giải thích từng bước, bài kiểm tra và thẻ học tập cho mọi chủ đề.",
      },
      {
        name: "Chế độ Tài liệu",
        description: "Báo cáo chuyên nghiệp, hợp đồng, bài nghiên cứu và các mẫu văn bản.",
      },
      {
        name: "Nghiên cứu chuyên sâu",
        description: "Nghiên cứu đa nguồn tự động với các trích dẫn nguồn đầy đủ.",
      },
      {
        name: "Slides",
        description: "Tạo bài thuyết trình hoàn chỉnh với hình ảnh, biểu đồ và chủ đề sinh động.",
      },
    ],
  },
  imageModels: {
    kicker: "MÔ HÌNH HÌNH ẢNH",
    title: "TẠO HÌNH ẢNH",
    titleHighlight: "HOÀN HẢO ĐẾN TỪNG PIXEL.",
    subtitle:
      "Năm mô hình hàng đầu cùng hơn 20 công cụ chuyên nghiệp — đổi mặt, ảnh chân dung, xóa nền, chỉnh sáng, hoạt hình hóa và hơn thế nữa.",
    items: [
      {
        name: "Nano Banana Pro",
        cost: "4 MC",
        description:
          "Chi tiết chân thực, nhân vật nhất quán và phong cách thương hiệu ở chất lượng studio.",
      },
      {
        name: "Nano Banana 2",
        cost: "3 MC",
        description:
          "Chất lượng thế hệ mới với khả năng tái tạo bàn tay, văn bản và giải phẫu học tiên tiến.",
      },
      {
        name: "GPT-Image 2",
        cost: "5 MC",
        description:
          "Mô hình hình ảnh hàng đầu của OpenAI — chữ viết hoàn hảo và bối cảnh phức tạp.",
      },
      {
        name: "Gemini 3 Pro Image",
        cost: "5 MC",
        description: "Công cụ tạo ảnh cao cấp của Google với bố cục và ánh sáng đậm chất điện ảnh.",
      },
      {
        name: "Nano Banana",
        cost: "2 MC",
        description: "Tạo hình ảnh cực nhanh để phác thảo ý tưởng và lặp lại với số lượng lớn.",
      },
    ],
  },
  codeModels: {
    kicker: "MEGSY BUILD",
    title: "TỪ Ý TƯỞNG ĐẾN",
    titleHighlight: "ỨNG DỤNG FULL-STACK.",
    subtitle:
      "Mô tả điều bạn muốn. Megsy Build sẽ tạo frontend React + Tailwind, cơ sở dữ liệu, xác thực, API — và triển khai chúng.",
    steps: [
      {
        title: "Code",
        description: "React, TypeScript và Tailwind sẵn sàng cho sản xuất với kiến trúc sạch sẽ.",
      },
      {
        title: "Cloud",
        description: "Cơ sở dữ liệu, lưu trữ, edge functions và xác thực — được kết nối tự động.",
      },
      {
        title: "Tốc độ",
        description: "Bản build tối ưu Lighthouse, lazy loading và nén ảnh được tích hợp sẵn.",
      },
      {
        title: "Bảo mật",
        description: "Chính sách RLS, quản lý bí mật và quét phụ thuộc trong mọi thay đổi.",
      },
      {
        title: "Phát hành",
        description: "Triển khai một lần nhấp vào tên miền riêng của bạn kèm theo SSL và CDN.",
      },
    ],
  },
  howItWorks: {
    title: "BẮT ĐẦU",
    titleHighlight: "VỚI MEGSY",
    subtitle: "Từ đăng ký đến triển khai chỉ trong năm bước đơn giản.",
    steps: [
      {
        title: "Tạo tài khoản",
        description:
          "Đăng ký trong vài giây và nhận credit miễn phí để khám phá mọi mô hình ngay lập tức.",
      },
      {
        title: "Chọn công cụ",
        description:
          "Chat, Studio hình ảnh, Video, Điện ảnh, Slides, Tài liệu, Builder — hãy chọn không gian làm việc của bạn.",
      },
      {
        title: "Chọn mô hình",
        description: "Hơn 80 mô hình từ OpenAI, Google, Black Forest Labs, xAI và hơn thế nữa.",
      },
      {
        title: "Sáng tạo & tinh chỉnh",
        description:
          "Tạo mới, chỉnh sửa, nâng cấp, đổi phong cách. Megsy lưu giữ mọi phiên bản trong thư viện của bạn.",
      },
      {
        title: "Xuất bản & Triển khai",
        description:
          "Tải xuống ở bất kỳ định dạng nào, xuất bản lên tên miền riêng hoặc chia sẻ lên mạng xã hội.",
      },
    ],
  },
  cta: {
    line1: "ĐƯỢC TIN DÙNG BỞI",
    line2: "NHỮNG NHÀ SÁNG TẠO HÀNG ĐẦU",
    subtitle:
      "Hàng triệu nhà sáng tạo và các đội ngũ đổi mới nhất thế giới tin tưởng Megsy để ra mắt sản phẩm nhanh hơn với sự hoàn thiện và quyền kiểm soát tối đa.",
    button: "Bắt đầu sáng tạo",
  },
  faq: {
    title: "Câu hỏi thường gặp",
    subtitle: "Mọi điều bạn cần biết về Megsy.",
    items: [
      {
        q: "Megsy là gì?",
        a: "Megsy là một không gian làm việc AI tất cả trong một, hợp nhất hơn 80 mô hình để chat, slides, nghiên cứu chuyên sâu, hình ảnh, video, điện ảnh, lip-sync và tạo mã nguồn full-stack — trong một giao diện, một hệ thống credit duy nhất.",
      },
      {
        q: "Những mô hình AI nào được bao gồm?",
        a: "Chat: Megsy, GPT-5.5, Gemini 3 Pro, Claude 4.5, Grok 4, DeepSeek. Hình ảnh: Nano Banana Pro, Nano Banana 2, GPT-Image 2, Gemini 3 Pro Image. Video: Veo 3.1, Kling 3.0 Pro, Runway Gen-4, Hunyuan. Cùng các mô hình giọng nói, lip-sync và builder — tất cả trong một gói đăng ký.",
      },
      {
        q: "Hệ thống credit MC hoạt động như thế nào?",
        a: "MC (Megsy Credits) là đơn vị tiền tệ của nền tảng. Chat là miễn phí; việc tạo hình ảnh, video và sử dụng các công cụ sẽ tốn một lượng nhỏ MC tùy theo mô hình. Xây dựng mã nguồn tốn 5 MC. Credit được cấp kèm theo mỗi gói Starter, Pro hoặc Elite.",
      },
      {
        q: "Có những gói dịch vụ nào?",
        a: "Gói Starter ($9/mo · 80 MC), Pro ($29/mo · 280 MC, tích hợp API + xuất bản mạng xã hội), Elite ($59/mo · 480 MC, webhooks + hỗ trợ riêng) và Business ($149/mo · 1,480 MC, hạ tầng riêng + cam kết SLA). Mọi gói đều hỗ trợ mục đích thương mại, tạo ảnh & video, code và đồng bộ GitHub.",
      },
      {
        q: "Tôi có thể sử dụng Megsy bằng ngôn ngữ của mình không?",
        a: "Có — Megsy hiểu và tạo nội dung bằng hơn 50 ngôn ngữ bao gồm tiếng Ả Rập, Tây Ban Nha, Pháp, Đức, Bồ Đào Nha, Trung Quốc, Nhật Bản, Hindi và nhiều ngôn ngữ khác.",
      },
      {
        q: "Megsy có API không?",
        a: "Có. Các gói Pro và Elite bao gồm API cho nhà phát triển để tạo hình ảnh, video, chat và sử dụng công cụ. Webhooks có sẵn trong gói Elite.",
      },
      {
        q: "Tôi có thể xuất bản ứng dụng từ Megsy Build không?",
        a: "Có. Megsy Build đưa ứng dụng full-stack của bạn lên nền tảng đám mây được quản lý, với tên miền tùy chỉnh, SSL, edge cache và cơ sở dữ liệu được kết nối sẵn — không cần kiến thức DevOps.",
      },
    ],
  },
};

export default vi;
