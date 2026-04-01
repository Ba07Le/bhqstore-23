import { Box, MobileStepper } from "@mui/material"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

export const ProductBanner = ({ images = [] }) => {
  const [activeStep, setActiveStep] = useState(0)
  const maxSteps = images.length

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % maxSteps)
    }, 4000)

    return () => clearInterval(timer)
  }, [maxSteps])

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
    
      <AnimatePresence mode="wait">
        <motion.img
          key={activeStep}
          src={images[activeStep]}
          alt="banner"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            position: "absolute",
            inset: 0,
          }}
        />
      </AnimatePresence>



      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          position: "absolute",
          bottom: 24,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ alignSelf: "center" }}>
          <MobileStepper
            steps={maxSteps}
            position="static"
            activeStep={activeStep}
            sx={{
              background: "transparent",
              "& .MuiMobileStepper-dot": {
                backgroundColor: "rgba(255,255,255,0.4)",
              },
              "& .MuiMobileStepper-dotActive": {
                backgroundColor: "#fff",
              },
            }}
          />
        </div>
      </motion.div>
    </Box>
  )
}