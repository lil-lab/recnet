import BackLink from "@/components/BackLink";
import styles from "@/styles/Edit.module.css";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { Box, TextField, Typography } from "@mui/material";
import { getPostbyId, postEntry, updatePost } from "../utils/db/post";

import { getNextDueDay } from "@/utils/dateHelper";
import LoadingButton from "@mui/lab/LoadingButton";

export default function Edit() {
  const user = useSelector((state) => state.user.value);
  const userLoaded = useSelector((state) => state.user.loaded);

  const router = useRouter();
  const { postId } = router.query;

  useEffect(() => {
    if (userLoaded && !user) {
      router.push("/");
    }
  }, [router, user, userLoaded]);

  return (
    <main className={styles.main}>
      {user && (
        <>
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
            Week of {getNextDueDay()}
          </Typography>
          <PaperForm postId={postId} />
        </>
      )}
    </main>
  );
}

function PaperForm({ postId }) {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");

  const [titleError, setTitleError] = useState(false);
  const [linkError, setLinkError] = useState(false);
  const [authorError, setAuthorError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const [firstLoaded, setFirstLoaded] = useState(true);
  const charLimit = 200;

  const user = useSelector((state) => state.user.value);
  const userId = useSelector((state) => state.user.id);
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [buttonText, setButtonText] = useState("Post");

  useEffect(() => {
    async function getPost(id) {
      const post = await getPostbyId(id);
      setTitle(post.title);
      setLink(post.link);
      setAuthor(post.author);
      setDescription(post.description);
      setButtonText("Update");
    }
    if (postId) getPost(postId);
  }, [postId]);

  const handleFieldChange = (event, setFunction, setError) => {
    setFirstLoaded(false);
    setFunction(event.target.value);
    setError(event.target.value.length === 0);
  };

  const handleDescriptionChange = (event) => {
    setFirstLoaded(false);
    setDescription(event.target.value);
    setDescriptionError(
      event.target.value.length === 0 || event.target.value.length > 200
    );
  };

  function checkErrorExists() {
    const titleCondition = title.length === 0;
    const linkCondition = link.length === 0;
    const authorCondition = author.length === 0;
    const descriptionCondition =
      description.length === 0 || description.length > 200;
    setTitleError(titleCondition);
    setLinkError(linkCondition);
    setAuthorError(authorCondition);
    setDescriptionError(descriptionCondition);
    return (
      titleCondition || linkCondition || authorCondition || descriptionCondition
    );
  }

  const handleSubmit = async () => {
    if (!checkErrorExists()) {
      setLoading(true);

      if (postId) {
        //update post
        await updatePost(title, link, author, description, postId);
        setLoading(false);
        router.push("/");
      } else {
        // create new post
        const newPostId = await postEntry(
          title,
          link,
          author,
          description,
          user.email,
          userId
        );
        setLoading(false);

        if (newPostId) {
          router.push("/");
        }
      }
    }
  };

  return (
    <div>
      <TextField
        label="Link to paper"
        variant="outlined"
        fullWidth
        margin="normal"
        value={link}
        error={linkError}
        onChange={(e) => handleFieldChange(e, setLink, setLinkError)}
      />
      <TextField
        label="Title"
        variant="outlined"
        fullWidth
        margin="normal"
        value={title}
        error={titleError}
        onChange={(e) => handleFieldChange(e, setTitle, setTitleError)}
      />
      <TextField
        label="Author(s)"
        variant="outlined"
        fullWidth
        margin="normal"
        value={author}
        error={authorError}
        onChange={(e) => handleFieldChange(e, setAuthor, setAuthorError)}
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
        onChange={(e) => handleDescriptionChange(e)}
      />
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        paddingRight="16px" // Adjust padding as needed
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
        disabled={
          linkError ||
          titleError ||
          authorError ||
          descriptionError ||
          firstLoaded
        }
        onClick={handleSubmit}
        loading={loading}
      >
        <span>{buttonText}</span>
      </LoadingButton>

      <Typography variant="body2" color="textSecondary">
        You can edit as many times as you want before the cutoff.
      </Typography>
      <BackLink />
    </div>
  );
}
