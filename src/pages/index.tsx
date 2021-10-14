import { GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client'

import Link from 'next/link'

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar, FiUser } from 'react-icons/fi'

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}



export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);

  console.log(posts)

  let newData;
  useEffect(() => {
    fetch(postsPagination.next_page)
      .then((response) => response.json())
      .then((data) => newData = data)
  }, []);

  async function handleLoadMorePost() {
    const newObject = {
      uid: newData.results[0].uid,
      first_publication_date: format(new Date(newData.results[0].last_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }),
      data: {
        title: newData.results[0].data.title,
        subtitle: newData.results[0].data.subtitle,
        author: newData.results[0].data.author,
      }
    }

    const aux = postsPagination.results;
    const newPost = [...aux]
    newPost.push(newObject);

    console.log(postsPagination.results)
    console.log(newPost)

  }

  return (
    <>
      <Head>
        <title>Posts | spacetraveling</title>
      </Head>

      <main className={styles.container}>

        <Header />
        {posts.map(post => (
          <Link href={`/post/${post.uid}`}>
            <a key={post.uid} href="#" className={styles.content}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div>
                <time><FiCalendar /> {post.first_publication_date}</time>
                <span><FiUser /> {post.data.author}</span>
              </div>
            </a>
          </Link>
        ))}

        <a className={styles.loadMore} onClick={handleLoadMorePost} >Carregar mais posts</a>
      </main>
    </>

  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.author', 'post.content', 'post.banner'],
    pageSize: 1,
  })

  console.log(JSON.stringify(postsResponse, null, 2))

  const next_page = postsResponse.next_page;
  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(new Date(post.last_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    };
  })


  const postsPagination = {
    results,
    next_page
  }

  return {
    props: {
      postsPagination
    }
  }
};
