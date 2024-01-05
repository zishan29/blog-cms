'use client';

import Link from 'next/link';

export default function Nav({ styles, logout }) {
  return (
    <>
      <nav className={styles.nav}>
        <Link href="/posts" className={styles.title}>
          Selfscape Stories CMS
        </Link>

        {logout && (
          <>
            <Link className={styles.link} href="/posts/add">
              Add Post
            </Link>
            <Link className={styles.link} onClick={() => logout()} href="/">
              Logout
            </Link>
          </>
        )}
      </nav>
    </>
  );
}
