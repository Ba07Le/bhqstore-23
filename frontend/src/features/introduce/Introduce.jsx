import { motion } from "framer-motion";
import { Button } from "@mui/material";

export const Introduce = ({ onScrollToProducts, onScrollToFeatures }) => {
  return (
    <div
      style={{
        height: "100vh",
        background: "#ffffff",
        color: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* BACKGROUND LIGHT EFFECT */}
      <div
        style={{
          position: "absolute",
          top: "-120px",
          right: "-120px",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, #1d4ed8, transparent 70%)",
          opacity: 0.15,
          filter: "blur(100px)",
          zIndex: 0,
        }}
      />

      {/* LEFT CONTENT */}
      <motion.div
        initial={{ opacity: 0, x: -80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          maxWidth: "520px",
          zIndex: 1,
        }}
      >
        <h1
          style={{
            fontSize: "52px",
            fontWeight: "800",
            lineHeight: "1.2",
          }}
        >
          Trải nghiệm tốt nhất{" "}
          <span style={{ color: "#1d4ed8" }}>BHQStore</span>
        </h1>

        <p
          style={{
            margin: "20px 0",
            fontSize: "18px",
            color: "#475569",
          }}
        >
          BHQ Store mang đến những thiết bị gaming cao cấp với hiệu năng mạnh mẽ
          và thiết kế hiện đại.
        </p>

        <div style={{ display: "flex", gap: "16px" }}>
          {/* BUTTON 1 */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
  variant="contained"
  onClick={onScrollToFeatures} // 👈 thêm dòng này
  sx={{
    background: "#1d4ed8",
    color: "white",
    fontWeight: "bold",
    px: 3,
    py: 1.2,
    borderRadius: "10px",
    "&:hover": {
      background: "#1e40af",
    },
  }}
>
  Khám phá ngay
</Button>
          </motion.div>

          {/* BUTTON 2 - SCROLL */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outlined"
              onClick={onScrollToProducts}
              sx={{
                color: "#0f172a",
                borderColor: "#cbd5e1",
                px: 3,
                py: 1.2,
                borderRadius: "10px",
                "&:hover": {
                  borderColor: "#1d4ed8",
                  color: "#1d4ed8",
                },
              }}
            >
              Xem sản phẩm
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* RIGHT IMAGE */}
      <motion.img
        src="https://images.unsplash.com/photo-1603302576837-37561b2e2302"
        alt="gaming"
        style={{
          width: "520px",
          borderRadius: "20px",
          zIndex: 1,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
      />
    </div>
  );
};