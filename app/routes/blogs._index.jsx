import {Link, useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {MOCK_BLOGS} from '~/lib/mockBlog';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    {title: 'Journal · sellanything.us'},
    {
      name: 'description',
      content:
        'Stories, guides, and the lookbook behind sellanything.us — bandanas, hats, and the people who wear them.',
    },
    {property: 'og:title', content: 'Journal · sellanything.us'},
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

async function loadCriticalData({context, request}) {
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});

  let realBlogs = [];
  try {
    const result = await context.storefront.query(BLOGS_QUERY, {
      variables: {...paginationVariables},
    });
    realBlogs = result?.blogs?.nodes ?? [];
  } catch (e) {
    console.error('Blogs query failed:', e?.message);
  }

  // Always prepend the mock "Journal" blog so the storefront has visible
  // content during development. When you publish a blog with handle "journal"
  // in Shopify Admin, the real one is preferred (deduplicated by handle).
  // Other real blogs (e.g. Shopify's default "News") are still shown.
  const seen = new Set();
  const merged = [];
  for (const b of [...MOCK_BLOGS, ...realBlogs]) {
    if (seen.has(b.handle)) continue;
    seen.add(b.handle);
    merged.push(b);
  }
  // If a real blog uses the mock handle, prefer the real one — re-build
  // with real blogs first, then mocks
  const finalList = [];
  const finalSeen = new Set();
  for (const b of [...realBlogs, ...MOCK_BLOGS]) {
    if (finalSeen.has(b.handle)) continue;
    finalSeen.add(b.handle);
    finalList.push(b);
  }

  const blogs = {
    nodes: finalList,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };

  const usingMock = MOCK_BLOGS.some(
    (m) => !realBlogs.find((r) => r.handle === m.handle),
  );

  return {blogs, usingMock};
}

function loadDeferredData() {
  return {};
}

export default function Blogs() {
  /** @type {LoaderReturnData} */
  const {blogs, usingMock} = useLoaderData();
  const nodes = blogs?.nodes ?? [];

  return (
    <div className="max-w-[1600px] mx-auto px-9 py-10">
      <nav className="text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Journal</span>
      </nav>

      <header className="mb-12 max-w-[800px]">
        <h1
          className="font-black tracking-tight uppercase m-0 mb-4"
          style={{fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 1.02}}
        >
          The Journal
        </h1>
        <p className="text-base text-muted-foreground m-0">
          Field notes, drops, and the people who keep our pieces in rotation.
          Less feed, more story.
        </p>
        {usingMock && (
          <p className="text-[11px] text-muted-foreground/60 mt-3 italic">
            Showing sample content. Real blogs will appear here once published
            in Shopify Admin.
          </p>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-10">
        {nodes.map((blog) => (
          <BlogCard key={blog.handle} blog={blog} />
        ))}
      </div>
    </div>
  );
}

function BlogCard({blog}) {
  return (
    <Link
      to={`/blogs/${blog.handle}`}
      prefetch="intent"
      className="group block"
    >
      <div className="aspect-[4/5] bg-secondary mb-4 overflow-hidden relative">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-neutral-200 via-secondary to-neutral-300"
        />
        <div className="absolute inset-0 flex items-end p-6">
          <div className="text-foreground">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
              Collection
            </div>
            <div
              className="font-bold tracking-tight uppercase leading-none"
              style={{fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)'}}
            >
              {blog.title}
            </div>
          </div>
        </div>
      </div>
      <div className="text-sm font-medium group-hover:underline underline-offset-4">
        Read all stories →
      </div>
      {blog.seo?.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {blog.seo.description}
        </p>
      )}
    </Link>
  );
}

const BLOGS_QUERY = `#graphql
  query Blogs(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    blogs(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        title
        handle
        seo {
          title
          description
        }
      }
    }
  }
`;

/** @typedef {BlogsQuery['blogs']['nodes'][0]} BlogNode */
/** @typedef {import('./+types/blogs._index').Route} Route */
/** @typedef {import('storefrontapi.generated').BlogsQuery} BlogsQuery */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
