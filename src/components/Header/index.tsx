
import styles from './header.module.scss';
import Link from 'next/link'

export default function Header() {
  return (
    <main className={styles.container}>

      <Link href="/">
        <img src="Logo.svg" alt="logo" />
      </Link>
    </main>

  );
}
