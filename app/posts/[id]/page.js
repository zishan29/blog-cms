'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Nav from '../../nav';
import styles from './post.module.css';

export default function Post() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [resMessage, setResMessage] = useState(null);
  const [errors, setErrors] = useState([]);
  const router = useRouter();

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const messageRef = useRef(null);
  const titleRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `https://zishan-blog-api.adaptable.app/posts/${id}`,
        );
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        setPost(data.post);
      } catch (error) {
        if (error) {
          console.log(error);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (post) {
      titleRef.current.value = post.title;
      contentRef.current.value = post.content;
      setTitle(post.title);
      setContent(post.content);
    }
  }, [post]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `https://zishan-blog-api.adaptable.app/posts/${id}/comments`,
        );
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        setComments(data.comments);
      } catch (error) {
        if (error) {
          console.log(error);
        }
      }
    })();
  }, []);

  async function addComment(data) {
    try {
      const res = await fetch(
        `https://zishan-blog-api.adaptable.app/posts/${id}/comments`,
        {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!res.ok) {
        if (res.status === 400) {
          const errorData = await res.json();
          setErrors(errorData.err.errors);
        } else {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
      } else {
        return true;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function fetchUpdatedComments() {
    try {
      const commentsRes = await fetch(
        `https://zishan-blog-api.adaptable.app/posts/${id}/comments`,
      );

      if (!commentsRes.ok) {
        throw new Error(`HTTP error! Status: ${commentsRes.status}`);
      }

      const updatedComments = await commentsRes.json();
      setComments(updatedComments.comments);
      setErrors([]);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleCommentSubmission() {
    let data = {
      username: name,
      email: email,
      comment: message,
      postId: id,
    };

    const commentAdded = await addComment(data);
    if (commentAdded) {
      await fetchUpdatedComments();
    }

    setName('');
    setEmail('');
    setMessage('');
    nameRef.current.value = '';
    emailRef.current.value = '';
    messageRef.current.value = '';
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  async function deleteComment(id) {
    const token = localStorage.getItem('token');
    const bearer = `Bearer ${token}`;
    try {
      let res = await fetch(
        `https://zishan-blog-api.adaptable.app/posts/${post._id}/comments/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: bearer,
          },
        },
      );
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const commentsRes = await fetch(
        `https://zishan-blog-api.adaptable.app/posts/${post._id}/comments`,
      );
      if (!commentsRes.ok) {
        throw new Error(`HTTP error! Status: ${commentsRes.status}`);
      }
      const updatedComments = await commentsRes.json();
      setComments(updatedComments.comments);
    } catch (error) {
      console.log(error);
    }
  }

  async function publishPost() {
    await updatePost(true);
  }

  async function unpublishPost() {
    await updatePost(false);
  }

  async function updatePost(updatedPublishedState) {
    setLoading(true);
    let data = {
      title: title,
      content: content,
      published: updatedPublishedState,
      _id: post._id,
    };
    console.log(data);
    const token = localStorage.getItem('token');
    const bearer = `Bearer ${token}`;
    try {
      let res = await fetch(
        `https://zishan-blog-api.adaptable.app/posts/${post._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: bearer,
          },
          body: JSON.stringify(data),
        },
      );
      let jsonRes = await res.json();
      setResMessage(jsonRes.message);

      let updatedRes = await fetch(
        `https://zishan-blog-api.adaptable.app/posts/${post._id}`,
      );
      if (!updatedRes.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const updatedPost = await updatedRes.json();
      setPost(updatedPost.post);

      titleRef.current.value = title;
      contentRef.current.value = content;
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function deletePost() {
    const token = localStorage.getItem('token');
    const bearer = `Bearer ${token}`;
    try {
      let res = await fetch(
        `https://zishan-blog-api.adaptable.app/posts/${post._id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: bearer,
          },
        },
      );
      if (res.ok) {
        router.push('/posts');
      }
    } catch (error) {
      console.log(error);
    }
  }

  function logout() {
    localStorage.clear();
  }

  return (
    <div className={styles.main}>
      <Nav styles={styles} logout={logout} />
      {loading ? (
        <div
          className={styles.loader}
          style={{ justifySelf: 'center', alignSelf: 'flex-start' }}
        >
          <div className={styles.circle}></div>
          <div className={styles.circle}></div>
          <div className={styles.circle}></div>
          <div className={styles.circle}></div>
        </div>
      ) : (
        <>
          <form action="" className={styles.postForm}>
            <label htmlFor="title" style={{ gridColumn: '1 / -1' }}>
              TITLE *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              onChange={(e) => setTitle(e.target.value)}
              style={{ gridColumn: '1 / -1' }}
              ref={titleRef}
            ></input>
            <label htmlFor="content" style={{ gridColumn: '1 / -1' }}>
              Content *
            </label>
            <textarea
              type="text"
              id="content"
              name="content"
              onChange={(e) => setContent(e.target.value)}
              style={{ gridColumn: '1 / -1' }}
              rows="15"
              ref={contentRef}
            ></textarea>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => updatePost(post.published)}
                style={{ justifySelf: 'center' }}
              >
                UPDATE POST
              </button>
              {post.published === true && (
                <button
                  type="button"
                  style={{ justifySelf: 'center' }}
                  onClick={() => {
                    unpublishPost();
                  }}
                >
                  UNPUBLISH
                </button>
              )}
              {post.published === false && (
                <button
                  type="button"
                  style={{ justifySelf: 'center' }}
                  onClick={() => {
                    publishPost();
                  }}
                >
                  PUBLISH
                </button>
              )}
            </div>
          </form>
          <div>{resMessage}</div>
          <div style={{ width: '40vw' }}>
            {comments && (
              <div
                style={{
                  fontSize: '32px',
                  justifySelf: 'flex-start',
                  margin: '40px 0',
                  marginTop: '80px',
                  color: '#323232',
                }}
              >
                {comments.length} Comments
              </div>
            )}
            <div className={styles.comments}>
              {comments &&
                comments
                  .slice()
                  .reverse()
                  .map((comment, index) => (
                    <div key={index} className={styles.comment}>
                      <div className={styles.user}>
                        {comment.username}{' '}
                        <button
                          style={{
                            marginLeft: 'auto',
                            height: '35px',
                            padding: '6px 12px',
                          }}
                          onClick={() => deleteComment(comment._id)}
                        >
                          Delete
                        </button>
                      </div>
                      <p className={styles.timestamp}>
                        {formatDate(comment.timeStamp)}
                      </p>
                      <p>{comment.comment}</p>
                    </div>
                  ))}
            </div>
          </div>
          <div style={{ width: '40vw', marginTop: '100px', display: 'grid' }}>
            <div
              style={{
                justifySelf: 'flex-start',
                fontSize: '32px',
                color: '#323232',
              }}
            >
              Leave a comment
            </div>
            <form action="" className={styles.form}>
              <label htmlFor="name">NAME *</label>
              <label htmlFor="email">EMAIL *</label>
              <input
                type="text"
                id="name"
                name="name"
                ref={nameRef}
                onChange={(e) => setName(e.target.value)}
                required
              ></input>
              <input
                type="email"
                id="email"
                email="email"
                ref={emailRef}
                onChange={(e) => setEmail(e.target.value)}
                required
              ></input>
              {errors.username && <p>{errors.username.message}</p>}
              {errors.email && (
                <p style={{ gridColumn: '2 / -1', gridRow: '3 / 4' }}>
                  {errors.email.message}
                </p>
              )}
              <label htmlFor="message" style={{ gridColumn: '1 / -1' }}>
                MESSAGE *
              </label>
              <textarea
                type="text"
                id="message"
                message="message"
                ref={messageRef}
                onChange={(e) => setMessage(e.target.value)}
                style={{ gridColumn: '1 / -1' }}
                rows="15"
                required
              ></textarea>
              {errors.comment && (
                <p style={{ gridColumn: '1 / -1' }}>{errors.comment.message}</p>
              )}
              <button type="button" onClick={() => handleCommentSubmission()}>
                POST COMMENT
              </button>
            </form>
            <button
              style={{
                justifySelf: 'center',
                marginBottom: '40px',
                fontSize: '16px',
                backgroundColor: '#FF4450',
              }}
              onClick={() => deletePost()}
            >
              Delete this post
            </button>
          </div>
        </>
      )}
    </div>
  );
}
