import BackLink from "@/components/BackLink";
import styles from "@/styles/Edit.module.css";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { Box, TextField, Typography, Select, MenuItem } from "@mui/material";
import { getPostById, postEntry, updatePost } from "../utils/db/post";

import ErrorSnackbar from "@/components/ErrorSnackbar";

import {
  formatDateVerbose,
  formatNextDueDay,
  getNextCutoff,
} from "@/utils/dateHelper";
import LoadingButton from "@mui/lab/LoadingButton";
import { useCheckUser } from "@/utils/hooks";

import Help from "@/components/Help";
import MonthPicker from "@/components/MonthPicker";
import { isYearValid } from "@/utils/validationHelper";

export default function Edit() {
  const { user, router } = useCheckUser();

  const { postId } = router.query;

  return (
    user && (
      <main className={styles.main}>
        <Typography
          variant="h2"
          noWrap
          component="a"
          sx={{
            fontWeight: 700,
            letterSpacing: ".3rem",
            padding: "1%",
          }}
        >
          Week of {formatNextDueDay()}
        </Typography>
        <PaperForm postId={postId} />
      </main>
    )
  );
}

function PaperForm({ postId }) {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

  const [titleError, setTitleError] = useState(false);
  const [linkError, setLinkError] = useState(false);
  const [authorError, setAuthorError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const [yearError, setYearError] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [initialPost, setInitialPost] = useState({
    title: "",
    link: "",
    author: "",
    description: "",
    year: "",
    month: "",
  });

  const charLimit = 280;

  const user = useSelector((state) => state.user.value);
  const userId = useSelector((state) => state.user.id);
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [buttonText, setButtonText] = useState("Post");

  useEffect(() => {
    async function getPost(id) {
      const { data, error } = await getPostById(id);
      if (error){
        setSnackbarOpen(true);
        setSnackbarMessage(error);
      } else{
        setTitle(data.title);
        setLink(data.link);
        setAuthor(data.author);
        setDescription(data.description);
        setYear(data.year);
        setMonth(data.month);
        setInitialPost(data);
        setButtonText("Update");
      }
    }
    if (postId) getPost(postId);
  }, [postId]);

  const handleLinkChange = (event) => {
    setLink(event.target.value);
    setLinkError(event.target.value.length === 0);
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
    setTitleError(event.target.value.length === 0);
  };

  const handleAuthorChange = (event) => {
    setAuthor(event.target.value);
    setAuthorError(event.target.value.length === 0);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
    setDescriptionError(
      event.target.value.length === 0 || event.target.value.length > charLimit
    );
  };

  const handleYearChange = (event) => {
    setYear(event.target.value);
    setYearError(!isYearValid(event.target.value));
  };

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);

    if (postId) {
      //update post
      await updatePost(title, link, author, description, year, month, postId);
      setLoading(false);
      router.push("/");
    } else {
      // create new post
      const { data, error } = await postEntry(
        title,
        link,
        author,
        description,
        user.email,
        year,
        month,
        userId
      );
      if (error){
        setSnackbarOpen(true);
        setSnackbarMessage(error);
      } else{
        setLoading(false);
        if (data) {
          router.push("/");
        }
      }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  function submitDisabled() {
    if (buttonText === "Post") {
      // month is optional
      return (
        linkError ||
        titleError ||
        authorError ||
        descriptionError ||
        yearError ||
        link === initialPost.link ||
        title === initialPost.title ||
        author === initialPost.author ||
        description === initialPost.description ||
        year === initialPost.year
      );
    }
    if (buttonText === "Update") {
      return (
        linkError ||
        titleError ||
        authorError ||
        descriptionError ||
        yearError ||
        (link === initialPost.link &&
          title === initialPost.title &&
          author === initialPost.author &&
          description === initialPost.description &&
          year === initialPost.year &&
          month === initialPost.month)
      );
    }
  }

  return (
    <div className={styles.form}>
      <TextField
        label="Link to paper"
        variant="outlined"
        fullWidth
        margin="normal"
        value={link}
        error={linkError}
        onChange={handleLinkChange}
      />
      <TextField
        label="Title"
        variant="outlined"
        fullWidth
        margin="normal"
        value={title}
        error={titleError}
        onChange={handleTitleChange}
      />
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        paddingTop="1rem"
        paddingBottom="0.5rem"
      >
        <TextField
          fullWidth
          label="Year"
          variant="outlined"
          sx={{ mr: "1rem" }}
          value={year}
          error={yearError}
          onChange={handleYearChange}
        />
        <MonthPicker month={month} onChange={handleMonthChange} />
      </Box>

      <TextField
        label="Author(s)"
        variant="outlined"
        fullWidth
        margin="normal"
        value={author}
        error={authorError}
        onChange={handleAuthorChange}
      />
      <TextField
        label="Description"
        variant="outlined"
        multiline
        rows={4}
        fullWidth
        margin="normal"
        value={description}
        error={descriptionError}
        onChange={handleDescriptionChange}
      />
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        paddingRight="16px"
      >
        <Typography variant="body2" color="textSecondary">
          {`${description.length}/${charLimit}`}
        </Typography>
      </Box>

      <LoadingButton
        className={styles.postButton}
        variant="contained"
        color="secondary"
        size="large"
        disabled={submitDisabled()}
        onClick={handleSubmit}
        loading={loading}
      >
        <span>{buttonText}</span>
      </LoadingButton>

      <div className={styles.infoText}>
        <Typography variant="body2" color="textSecondary">
          {`You can edit as many times as you want before this week's cutoff: ${formatDateVerbose(
            getNextCutoff()
          )}.`}
        </Typography>
        <Help />
      </div>

      <ErrorSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        handleClose={handleSnackbarClose}
      />

      <BackLink route="/" text="back to homepage" />
    </div>
  );
}
