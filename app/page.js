'use client';

import styles from './page.module.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from './nav';

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [resMessage, setResMessage] = useState('');
  const router = useRouter();

  async function login() {
    let loginData = {
      username: username,
      password: password,
    };

    console.log(loginData);

    try {
      const res = await fetch('https://zishan-blog-api.adaptable.app/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      if (res.ok) {
        let data = await res.json();
        localStorage.setItem('token', data.token);
        router.push('/posts');
      }
      if (res.status === 403) {
        setResMessage('Forbidden');
      }
    } catch (error) {
      console.log(error);
    }
  }

  function checkToken() {
    let token = localStorage.getItem('token');
    if (token) {
      return token;
    }
    return;
  }

  if (checkToken()) {
    router.push('/posts');
  }

  return (
    <main className={styles.main}>
      <Nav styles={styles} />
      <form className={styles.form} action="/Home">
        <label htmlFor="username">USERNAME:</label>
        <label htmlFor="password">PASSWORD:</label>
        <input
          type="text"
          name="username"
          id="username"
          onChange={(e) => setUsername(e.target.value)}
        ></input>
        <input
          type="password"
          name="password"
          id="password"
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        <button type="button" onClick={() => login()}>
          LOGIN
        </button>
      </form>
      <div>{resMessage}</div>
    </main>
  );
}
