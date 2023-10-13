import React from "react";
import { IconButton, TextField, Button, Typography, Grid } from "@mui/material";
import styles from "@/styles/Search.module.css";
import { fontStyles } from "@/utils/fonts";
import SearchIcon from "@mui/icons-material/Search";

const SearchPage = () => {
  const handleSearch = () => {
    // Handle search logic here
  };

  return (
    <main className={styles.main}>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        style={{ height: "80vh" }}
      >
        <Grid item xs={12} sm={8} md={6}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={fontStyles.bold}
          >
            Search User
          </Typography>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Search by name or email"
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleSearch} style={{ margin: "1%" }}>
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />
        </Grid>
      </Grid>
    </main>
  );
};

export default SearchPage;
