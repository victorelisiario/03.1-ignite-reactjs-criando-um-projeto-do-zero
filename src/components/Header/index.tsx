
import styles from './header.module.scss';

export default function Header() {
  return (
    <main className={styles.container}>

      <a href="/"><img src="Logo.svg" alt="logo" /></a>
    </main>

  );
}
