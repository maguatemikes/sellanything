import {Link, useLoaderData} from 'react-router';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {
  buildMockBlogWithArticles,
  MOCK_BLOG_HANDLE,
} from '~/lib/mockBlog';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const title = data?.blog?.title ?? '';
  const description =
    data?.blog?.seo?.description ||
    `Read ${title} on sellanything.us — stories about bandanas, hats, and the people who wear them.`;
  return [
    {title: `${title} · sellanything.us`},
    {name: 'description', content: description},
    {property: 'og:title', content: `${title} · sellanything.us`},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'website'},
  ];
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
  const paginationVariables = getPaginationVariables(request, {pageBy: 9});

  if (!params.blogHandle) {
    throw new Response(`blog not found`, {status: 404});
  }

  // If this is the mock blog handle, serve mock data directly without
  // hitting Shopify. (When you eventually publish a real "journal" blog
  // with articles, remove this short-circuit so the real one wins.)
  if (params.blogHandle === MOCK_BLOG_HANDLE) {
    return {blog: buildMockBlogWithArticles(), usingMock: true};
  }

  let blog = null;
  try {
    const result = await context.storefront.query(BLOG_QUERY, {
      variables: {
        blogHandle: params.blogHandle,
        ...paginationVariables,
      },
    });
    blog = result?.blog ?? null;
  } catch (e) {
    console.error('Blog query failed:', e?.message);
  }

  if (blog) {
    redirectIfHandleIsLocalized(request, {
      handle: params.blogHandle,
      data: blog,
    });
    return {blog, usingMock: false};
  }

  throw new Response('Blog not found', {status: 404});
}

function loadDeferredData() {
  return {};
}

export default function Blog() {
  /** @type {LoaderReturnData} */
  const {blog} = useLoaderData();
  const articles = blog?.articles?.nodes ?? [];
  const [hero, ...rest] = articles;

  return (
    <div className="max-w-[1600px] mx-auto px-9 py-10">
      <nav className="text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/blogs/journal" className="hover:underline">
          Journal
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{blog.title}</span>
      </nav>

      <header className="mb-12 max-w-[800px]">
        <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
          Journal
        </div>
        <h1
          className="font-black tracking-tight uppercase m-0 mb-3"
          style={{fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.05}}
        >
          {blog.title}
        </h1>
        {blog.seo?.description && (
          <p className="text-base text-muted-foreground m-0">
            {blog.seo.description}
          </p>
        )}
      </header>

      {articles.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-10 text-center">
          <p className="text-muted-foreground mb-1">
            No articles published yet.
          </p>
          <p className="text-xs text-muted-foreground/80">
            Add posts in Shopify Admin → Online Store → Blog posts.
          </p>
        </div>
      ) : (
        <>
          {/* Hero / featured article */}
          {hero && <FeaturedArticle article={hero} />}

          {/* Rest of the articles */}
          {rest.length > 0 && (
            <>
              <div className="flex items-end justify-between mb-6 mt-16">
                <h2 className="text-lg font-medium">More from {blog.title}</h2>
                <span className="text-xs text-muted-foreground">
                  {articles.length}{' '}
                  {articles.length === 1 ? 'article' : 'articles'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-10">
                {rest.map((article, i) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    loading={i < 3 ? 'eager' : 'lazy'}
                  />
                ))}
              </div>
            </>
          )}

          {/* Pagination links */}
          {blog.articles?.pageInfo &&
            (blog.articles.pageInfo.hasNextPage ||
              blog.articles.pageInfo.hasPreviousPage) && (
              <PaginatedResourceSection connection={blog.articles}>
                {() => null}
              </PaginatedResourceSection>
            )}
        </>
      )}
    </div>
  );
}

/**
 * Mock images use plain {url, altText} while Shopify Image data needs id +
 * width + height. Render with <Image> when it's a Shopify image, plain <img>
 * for mock data.
 */
function ArticleImage({image, alt, loading, sizes, className}) {
  if (!image?.url) return null;
  const isShopify = !!image.id;
  if (isShopify) {
    return (
      <Image
        alt={image.altText || alt}
        data={image}
        loading={loading}
        sizes={sizes}
        className={className}
      />
    );
  }
  return (
    <img
      src={image.url}
      alt={image.altText || alt}
      loading={loading}
      className={className}
    />
  );
}

function FeaturedArticle({article}) {
  const publishedAt = formatDate(article.publishedAt);
  return (
    <Link
      to={`/blogs/${article.blog.handle}/${article.handle}`}
      prefetch="intent"
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 group items-center mb-4"
    >
      <div className="lg:col-span-7 bg-secondary overflow-hidden aspect-[4/3]">
        <ArticleImage
          image={article.image}
          alt={article.title}
          loading="eager"
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
        />
      </div>
      <div className="lg:col-span-5">
        <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
          Featured · {publishedAt}
        </div>
        <h2
          className="font-bold tracking-tight m-0 mb-4 group-hover:underline underline-offset-4"
          style={{fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', lineHeight: 1.1}}
        >
          {article.title}
        </h2>
        {article.author?.name && (
          <p className="text-sm text-muted-foreground mt-2">
            By {article.author.name}
          </p>
        )}
        <span className="inline-block mt-6 text-sm font-medium border-b border-foreground pb-0.5">
          Read the story →
        </span>
      </div>
    </Link>
  );
}

function ArticleCard({article, loading}) {
  const publishedAt = formatDate(article.publishedAt);
  return (
    <Link
      to={`/blogs/${article.blog.handle}/${article.handle}`}
      prefetch="intent"
      className="group block"
    >
      <div className="bg-secondary aspect-[4/3] mb-4 overflow-hidden">
        <ArticleImage
          image={article.image}
          alt={article.title}
          loading={loading}
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
        {publishedAt}
        {article.author?.name && ` · ${article.author.name}`}
      </div>
      <h3 className="text-lg font-semibold leading-snug m-0 group-hover:underline underline-offset-2">
        {article.title}
      </h3>
    </Link>
  );
}

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

const BLOG_QUERY = `#graphql
  query Blog(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      seo { title description }
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
  fragment ArticleItem on Article {
    author: authorV2 { name }
    contentHtml
    handle
    id
    image { id altText url width height }
    publishedAt
    title
    blog { handle }
  }
`;

/** @typedef {import('./+types/blogs.$blogHandle._index').Route} Route */
/** @typedef {import('storefrontapi.generated').ArticleItemFragment} ArticleItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
