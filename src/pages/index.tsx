import { GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client'

import Link from 'next/link'

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar, FiUser } from 'react-icons/fi'

import { getPrismicClient } from '../services/prismic';


import styles from './home.module.scss';
import React, { useState } from 'react';


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
  const [posts, setPosts] = useState<PostPagination>(postsPagination as PostPagination);

  async function handleLoadMorePost() {

    let newData;

    await fetch(postsPagination.next_page)
      .then((response) => response.json())
      .then((data) => newData = data)


    const newObject: Post = {
      uid: newData.results[0].uid,
      first_publication_date: newData.results[0].first_publication_date,
      data: {
        title: newData.results[0].data.title,
        subtitle: newData.results[0].data.subtitle,
        author: newData.results[0].data.author,
      }
    }

    const newPost = {
      results: [...postsPagination.results, newObject],
      next_page: newData.next_page,
    };

    setPosts(newPost)
    console.log(newPost)

  }

  return (
    <>
      <Head>
        <title>Posts | spacetraveling</title>
      </Head>

      <main className={styles.container}>


        {posts.results.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a href="#" className={styles.content}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div>
                <time><FiCalendar /> {format(new Date(post.first_publication_date),
                  'dd MMM yyyy',
                  {
                    locale: ptBR,
                  })}</time>
                <span><FiUser /> {post.data.author}</span>
              </div>
            </a>
          </Link>
        ))}

        {!!posts.next_page && (
          <a
            className={`${styles.loadMore} `}
            onClick={handleLoadMorePost} >
            Carregar mais posts
          </a>)}

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

  const next_page = postsResponse.next_page;
  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
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
