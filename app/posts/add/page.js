'use client';

import Nav from '@/app/nav';
import { useRef, useState } from 'react';
import styles from './add.module.css';
import { useRouter } from 'next/navigation';

export default function Add() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const [published, setPublished] = useState(false);
  const [errors, setErrors] = useState('');
  const router = useRouter();

  function logout() {
    localStorage.clear();
  }

  const handleCheckboxChange = (e) => {
    setPublished(e.target.checked);
  };

  async function addPost() {
    let postData = {
      title: title,
      content: content,
      published: published,
    };
    const token = localStorage.getItem('token');
    const bearer = `Bearer ${token}`;
    try {
      let res = await fetch(`https://zishan-blog-api.adaptable.app/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: bearer,
        },
        body: JSON.stringify(postData),
      });

      if (res.status === 400) {
        const data = await res.json();
        setErrors(data.err.errors);
      }
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      if (res.ok) {
        router.push('/posts');
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className={styles.main}>
      <Nav styles={styles} logout={logout} />
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
        {errors.title && <p>{errors.title.message}</p>}
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
        {errors.content && <p>{errors.content.message}</p>}
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={published}
            onChange={handleCheckboxChange}
          ></input>
          <span className={styles.slider}></span>
        </label>
        <label>Publish: {published ? 'Yes' : 'No'}</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => addPost()}
            style={{ justifySelf: 'center' }}
          >
            ADD POST
          </button>
        </div>
      </form>
    </div>
  );
}
