import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Prismic from '@prismicio/client'


import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';
import { useRouter } from 'next/router'
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'
import { RichText } from 'prismic-dom';


interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {

  const words = post.data.content.map(contentItem => {
    return {
      wordsInHeading: contentItem.heading.split(' ').length,
      wordsInBody: contentItem.body.map(contentBody => {
        return contentBody.text.split(' ').length
      }).reduce((acc, current) => acc += current)
    }
  })

  const totalWords = words.map(item => item.wordsInHeading + item.wordsInBody)
    .reduce((acc, current) => acc + current)
  const readTime = Math.ceil(totalWords / 200);



  const router = useRouter()

  if (router.isFallback) {
    return <div>Carregando...</div>
  } else {

    const formatedPublicationDate = format(new Date(post.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      });

    return (
      <>
        <Head>
          <title>Post | spacetraveling</title>
        </Head>


        <main className={styles.container} >

          <img src={post.data.banner.url} />

          <article className={styles.content}>

            <h1>{post.data.title}</h1>
            <div className={styles.blogInfo}>
              <time><FiCalendar /> {formatedPublicationDate}</time>
              <span><FiUser /> {post.data.author}</span>
              <span><FiClock /> {readTime + ' min'}</span>
            </div>

            <div className={styles.blogContent}>
              {post.data.content.map(post => (
                <>
                  <h1 key={post.heading}>{post.heading}</h1>
                  <div className={styles.blogText}
                    dangerouslySetInnerHTML={{ __html: RichText.asHtml(post.body) }}
                  />
                </>

              ))}
            </div>


          </article>
        </main>
      </>
    );
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);
  const paths = postsResponse.results.map(post => ({
    params: { slug: post.uid },

  }));

  return {
    paths,
    fallback: true,
  }

}

export const getStaticProps: GetStaticProps<PostProps> = async context => {

  const prismic = getPrismicClient();
  const { slug } = context.params;
  const response = await prismic.getByUID('posts', String(slug), {})

  /* console.log(JSON.stringify(response, null, 2)) */
  const post = {


    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
    uid: response.uid,


  }

  return {
    props: {
      post
    },
    redirect: 60 * 30.
  }
};
