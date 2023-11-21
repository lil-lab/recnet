import { Typography } from "@mui/material";
import { fontStyles } from "@/utils/fonts"; 

export default function TopBarLink({ href, text, sx }){
  const defaultStyles = {
    ml: "2%",
    ...fontStyles.regular,
    letterSpacing: ".1rem",
    color: "white",
    textDecoration: "underline",
  };
    
  const styles = { ...defaultStyles, ...sx };
    
  return (
    <Typography
      variant="h6"
      noWrap
      component="a"
      href={href}
      sx={styles}
    >
      {text}
    </Typography>
  );
}

