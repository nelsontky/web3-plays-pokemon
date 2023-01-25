import { Slider, styled } from "@mui/material";

const AppSlider = styled(Slider)({
  "& .MuiSlider-thumb": {
    background: "#000000",
    boxShadow: "none !important",

    "&::before": {
      display: "none",
    },
  },

  "& .MuiSlider-track": {
    background: "#000000",
    border: "none",
  },

  "& .MuiSlider-rail": {
    background: "#ffffff",
    border: "1px solid #000000",
    opacity: 1,
  },
});

export default AppSlider;
