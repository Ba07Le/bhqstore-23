import { motion } from "framer-motion";
import VerifiedIcon from "@mui/icons-material/Verified";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

const features = [
  {
    icon: <VerifiedIcon sx={{ fontSize: 40, color: "#1d4ed8" }} />,
    title: "Uy tín",
    desc: `BHQ Store cam kết mang đến các sản phẩm chính hãng từ những thương hiệu hàng đầu thế giới như Logitech, Razer, SteelSeries, Corsair và nhiều hãng gaming nổi tiếng khác. 
    Tất cả sản phẩm đều có nguồn gốc rõ ràng, bảo hành minh bạch và được kiểm định chất lượng trước khi đến tay khách hàng. 
    Chúng tôi luôn đặt sự uy tín và trải nghiệm người dùng lên hàng đầu, xây dựng niềm tin lâu dài với cộng đồng game thủ.`,
  },
  {
    icon: <WorkspacePremiumIcon sx={{ fontSize: 40, color: "#1d4ed8" }} />,
    title: "Chất lượng",
    desc: `Các sản phẩm tại BHQ Store được lựa chọn kỹ lưỡng nhằm mang lại hiệu năng tối ưu cho cả gaming và làm việc chuyên nghiệp. 
    Từ bàn phím cơ với độ phản hồi nhanh, chuột gaming chính xác từng mili giây, đến tai nghe với âm thanh sống động – tất cả đều hướng tới trải nghiệm tốt nhất. 
    Dù bạn là game thủ casual hay chuyên nghiệp, chúng tôi luôn có thiết bị phù hợp để nâng tầm setup của bạn.`,
  },
  {
    icon: <AttachMoneyIcon sx={{ fontSize: 40, color: "#1d4ed8" }} />,
    title: "Giá cả",
    desc: `BHQ Store cung cấp đa dạng phân khúc giá từ phổ thông đến cao cấp, phù hợp với mọi nhu cầu và ngân sách. 
    Chúng tôi luôn tối ưu mức giá cạnh tranh trên thị trường, đi kèm với nhiều chương trình khuyến mãi, ưu đãi hấp dẫn và combo tiết kiệm. 
    Bạn hoàn toàn có thể sở hữu những thiết bị gaming chất lượng cao với mức giá hợp lý và xứng đáng với giá trị nhận được.`,
  },
];

export const Features = () => {
  return (
    <div
      style={{
        background: "#ffffff",
        padding: "80px 80px",
        textAlign: "center",
      }}
    >
      {/* TITLE */}
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          fontSize: "36px",
          fontWeight: "800",
          marginBottom: "50px",
        }}
      >
        Tại sao chọn chúng tôi?
      </motion.h2>

      {/* GRID */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "40px",
          flexWrap: "wrap",
        }}
      >
        {features.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            whileHover={{ y: -10 }}
            style={{
              width: "300px",
              padding: "30px",
              borderRadius: "16px",
              background: "#f8fafc",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div style={{ marginBottom: "20px" }}>{item.icon}</div>

            <h3
              style={{
                fontSize: "20px",
                fontWeight: "700",
                marginBottom: "12px",
              }}
            >
              {item.title}
            </h3>

            <p
              style={{
                color: "#64748b",
                fontSize: "15px",
                lineHeight: "1.6",
                whiteSpace: "pre-line",
              }}
            >
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};