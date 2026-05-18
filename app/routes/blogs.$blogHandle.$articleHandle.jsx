import {Link, useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {findMockArticle} from '~/lib/mockBlog';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const article = data?.article;
  if (!article) return [{title: 'Article · sellanything.us'}];

  const title = article.title;
  const description =
    article.seo?.description ||
    article.contentHtml?.replace(/<[^>]*>/g, '').slice(0, 160) ||
    '';
  const image = article.image?.url;

  return [
    {title: `${title} · sellanything.us`},
    {name: 'description', content: description},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'article'},
    image && {property: 'og:image', content: image},
    {property: 'article:published_time', content: article.publishedAt},
    article.author?.name && {
      property: 'article:author',
      content: article.author.name,
    },
    {name: 'twitter:card', content: 'summary_large_image'},
    image && {name: 'twitter:image', content: image},
  ].filter(Boolean);
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, request, params}) {
  const {blogHandle, articleHandle} = params;

  if (!articleHandle || !blogHandle) {
    throw new Response('Not found', {status: 404});
  }

  // Check mock first when the blog handle is our mock journal
  const mockArticle = findMockArticle(blogHandle, articleHandle);
  if (mockArticle) {
    return {article: mockArticle, blogHandle, usingMock: true};
  }

  // Otherwise query Shopify for real article content
  let blog = null;
  try {
    const result = await context.storefront.query(ARTICLE_QUERY, {
      variables: {blogHandle, articleHandle},
    });
    blog = result?.blog ?? null;
  } catch (e) {
    console.error('Article query failed:', e?.message);
  }

  if (blog?.articleByHandle) {
    redirectIfHandleIsLocalized(
      request,
      {handle: articleHandle, data: blog.articleByHandle},
      {handle: blogHandle, data: blog},
    );
    return {article: blog.articleByHandle, blogHandle, usingMock: false};
  }

  throw new Response('Article not found', {status: 404});
}

function loadDeferredData() {
  return {};
}

export default function Article() {
  /** @type {LoaderReturnData} */
  const {article, blogHandle, usingMock} = useLoaderData();
  const {title, image, contentHtml, author} = article;
  const publishedDate = formatDate(article.publishedAt);
  const readingMinutes = estimateReadingTime(contentHtml);

  return (
    <article className="max-w-[1600px] mx-auto px-9 py-10">
      <nav className="text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/blogs/journal" className="hover:underline">
          Journal
        </Link>
        <span className="mx-2">/</span>
        <Link to={`/blogs/${blogHandle}`} className="hover:underline">
          {blogHandle}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground line-clamp-1 max-w-[20ch] inline-block align-bottom">
          {title}
        </span>
      </nav>

      {/* Hero header */}
      <header className="max-w-[800px] mx-auto mb-10 text-center">
        <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
          <time dateTime={article.publishedAt}>{publishedDate}</time>
          {author?.name && (
            <>
              <span className="mx-2">·</span>
              <span>{author.name}</span>
            </>
          )}
          {readingMinutes > 0 && (
            <>
              <span className="mx-2">·</span>
              <span>{readingMinutes} min read</span>
            </>
          )}
        </div>
        <h1
          className="font-black tracking-tight m-0"
          style={{fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1.05}}
        >
          {title}
        </h1>
        {usingMock && (
          <p className="text-[11px] text-muted-foreground/60 italic mt-4">
            Sample article. Replace with real Shopify blog posts in admin.
          </p>
        )}
      </header>

      {/* Hero image — handles both Shopify Image and mock {url, altText} */}
      {image?.url && (
        <div className="max-w-[1200px] mx-auto mb-12 bg-secondary overflow-hidden">
          {image.id ? (
            <Image
              alt={image.altText || title}
              data={image}
              sizes="(min-width: 1200px) 1200px, 95vw"
              loading="eager"
              className="w-full h-auto"
            />
          ) : (
            <img
              src={image.url}
              alt={image.altText || title}
              loading="eager"
              className="w-full h-auto"
            />
          )}
        </div>
      )}

      {/* Article body */}
      <div className="max-w-[720px] mx-auto">
        <div
          className="prose-article"
          dangerouslySetInnerHTML={{__html: contentHtml}}
        />
      </div>

      {/* Footer / back link */}
      <div className="max-w-[720px] mx-auto mt-16 pt-8 border-t border-border flex items-center justify-between">
        <Link
          to={`/blogs/${blogHandle}`}
          className="text-sm font-medium underline underline-offset-4 hover:opacity-70"
        >
          ← Back to Journal
        </Link>
        <Link
          to="/shop"
          className="text-sm font-medium px-4 py-2 bg-foreground text-background rounded-full hover:opacity-80 transition"
        >
          Shop the look →
        </Link>
      </div>

      {/* Schema.org JSON-LD for SEO */}
      <ArticleJsonLd article={article} blogHandle={blogHandle} />

      {/* Article body typography styles — scoped to .prose-article */}
      <style>{`
        .prose-article {
          font-size: 17px;
          line-height: 1.75;
          color: var(--foreground, #111);
        }
        .prose-article p {
          margin: 0 0 1.4em;
        }
        .prose-article h2 {
          font-size: clamp(1.5rem, 2.5vw, 2rem);
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.01em;
          margin: 2.5em 0 0.6em;
        }
        .prose-article h3 {
          font-size: clamp(1.2rem, 1.8vw, 1.5rem);
          font-weight: 600;
          line-height: 1.3;
          margin: 2em 0 0.5em;
        }
        .prose-article a {
          color: inherit;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .prose-article a:hover {
          opacity: 0.7;
        }
        .prose-article ul,
        .prose-article ol {
          padding-left: 1.5em;
          margin: 0 0 1.4em;
        }
        .prose-article li {
          margin-bottom: 0.5em;
        }
        .prose-article blockquote {
          border-left: 3px solid currentColor;
          padding-left: 1.25em;
          margin: 1.8em 0;
          font-style: italic;
          color: var(--muted-foreground, #666);
        }
        .prose-article img {
          width: 100%;
          height: auto;
          margin: 2em 0;
        }
        .prose-article hr {
          border: 0;
          border-top: 1px solid var(--border, #e5e5e5);
          margin: 2.5em 0;
        }
        .prose-article code {
          background: var(--secondary, #f5f5f5);
          padding: 0.15em 0.4em;
          border-radius: 4px;
          font-size: 0.9em;
        }
        .prose-article pre {
          background: var(--secondary, #f5f5f5);
          padding: 1em;
          border-radius: 6px;
          overflow-x: auto;
          margin: 1.5em 0;
        }
        .prose-article pre code {
          background: transparent;
          padding: 0;
        }
      `}</style>
    </article>
  );
}

function ArticleJsonLd({article, blogHandle}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    datePublished: article.publishedAt,
    author: article.author?.name
      ? {'@type': 'Person', name: article.author.name}
      : undefined,
    image: article.image?.url,
    description:
      article.seo?.description ||
      article.contentHtml?.replace(/<[^>]*>/g, '').slice(0, 160),
    mainEntityOfPage: `/blogs/${blogHandle}/${article.handle}`,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
    />
  );
}

function estimateReadingTime(html) {
  if (!html) return 0;
  const text = html.replace(/<[^>]*>/g, ' ').trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      handle
      articleByHandle(handle: $articleHandle) {
        handle
        title
        contentHtml
        publishedAt
        author: authorV2 { name }
        image { id altText url width height }
        seo { description title }
      }
    }
  }
`;

/** @typedef {import('./+types/blogs.$blogHandle.$articleHandle').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
