import BackLink from "@/components/BackLink";
import styles from "@/styles/Edit.module.css";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { Box, TextField, Typography } from "@mui/material";
import { deletePost, postEntry, updatePost } from "../utils/db/post";

import ErrorSnackbar from "@/components/ErrorSnackbar";

import {
  formatDateVerbose,
  formatNextDueDay,
  getNextCutoff,
} from "@/utils/dateHelper";
import { useCheckUser } from "@/utils/hooks";
import LoadingButton from "@mui/lab/LoadingButton";

import AlertDialog from "@/components/AlertDialog";
import Help from "@/components/Help";
import MonthPicker from "@/components/MonthPicker";
import {
  isYearValid,
  isLinkValid,
  fixTitleFormat,
  isAuthorValid,
} from "@/utils/validationHelper";
import { getPostInProgressByUser } from "../utils/db/post";

export default function Edit() {
  const { user } = useCheckUser();

  const [postInProgress, setPostInProgress] = useState(undefined);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    async function getPostInProgress() {
      const { data, error } = await getPostInProgressByUser(user.id);
      if (error) {
        setSnackbarOpen(true);
        setSnackbarMessage(error);
      } else {
        if (data) setPostInProgress(data); // if there's post in progress
      }
    }
    if (user) getPostInProgress();
  }, [user]);

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
          <ErrorSnackbar
            open={snackbarOpen}
            message={snackbarMessage}
            handleClose={handleSnackbarClose}
          />
        </Typography>
        <PaperForm postInProgress={postInProgress} />
      </main>
    )
  );
}

function PaperForm({ postInProgress }) {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

  const [titleFormatted, setTitleFormatted] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [linkError, setLinkError] = useState(false);
  const [linkErrorHelper, setLinkErrorHelper] = useState("");
  const [authorError, setAuthorError] = useState(false);
  const [authorErrorHelper, setAuthorErrorHelper] = useState("");
  const [descriptionError, setDescriptionError] = useState(false);
  const [yearError, setYearError] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);

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
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [buttonText, setButtonText] = useState("Post");

  useEffect(() => {
    if (postInProgress) {
      setTitle(postInProgress.title);
      setLink(postInProgress.link);
      setAuthor(postInProgress.author);
      setDescription(postInProgress.description);
      setYear(postInProgress.year);
      setMonth(postInProgress.month);
      setInitialPost(postInProgress);
      setButtonText("Update");
    }
  }, [postInProgress]);

  const handleLinkChange = (event) => {
    setLink(event.target.value);
    const isError =
      event.target.value.length === 0 || !isLinkValid(event.target.value);
    setLinkError(isError);
    if (isError) {
      setLinkErrorHelper(
        "Please enter a valid link that contains http(s), www., and/or ends with .some_domain."
      );
    } else {
      setLinkErrorHelper("");
    }
  };

  const handleTitleChange = (event) => {
    const newTitle = event.target.value;

    if (!titleFormatted) {
      setTitle(fixTitleFormat(newTitle));
      setTitleFormatted(true);
    } else {
      setTitle(newTitle);
    }
    setTitleError(newTitle.length === 0);
  };

  const handleAuthorChange = (event) => {
    setAuthor(event.target.value);
    setAuthorError(
      event.target.value.length === 0 || !isAuthorValid(event.target.value)
    );
    if (authorError) {
      setAuthorErrorHelper(
        `Please enter the author names correctly. For multiple authors,` +
          `separate each name with a comma and a space (, ), such as` +
          `"First M. Last, F. Last".`
      );
    } else {
      setAuthorErrorHelper("");
    }
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

    if (postInProgress) {
      const { data, error } = await updatePost(
        title,
        link,
        author,
        description,
        year,
        month,
        postInProgress.id
      );
      if (error) {
        setSnackbarOpen(true);
        setSnackbarMessage(error.message);
      } else {
        setLoading(false);
        if (data) {
          router.replace("/");
        }
      }
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
        user.id
      );
      if (error) {
        setSnackbarOpen(true);
        setSnackbarMessage(error);
      } else {
        setLoading(false);
        if (data) {
          router.replace("/");
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
        helperText={linkErrorHelper}
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
        helperText={authorErrorHelper}
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

      <div>
        <LoadingButton
          style={{ margin: "1%" }}
          variant="contained"
          color="secondary"
          size="large"
          disabled={submitDisabled()}
          onClick={handleSubmit}
          loading={loading}
        >
          {buttonText}
        </LoadingButton>
        {buttonText === "Update" && (
          <LoadingButton
            style={{ margin: "1%" }}
            variant="outlined"
            color="error"
            size="large"
            onClick={() => setAlertOpen(true)}
            loading={loading}
          >
            Delete
          </LoadingButton>
        )}
        {alertOpen && (
          <AlertDialog
            open={alertOpen}
            handleClose={() => setAlertOpen(false)}
            handleAction={async () => {
              const { data, error } = await deletePost(postInProgress.id);
              if (error) {
                setSnackbarOpen(true);
                setSnackbarMessage(error);
              } else {
                setAlertOpen(false);
                router.replace("/");
              }
            }}
            text={"Are you sure you want to delete this post?"}
            contentText={
              "Once deleted, this post will not appear in the recommendation" +
              "list for you and your network this week."
            }
            confirmButtonText={"Delete"}
          ></AlertDialog>
        )}
      </div>

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
