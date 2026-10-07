"use client";

import { useMarketNews } from "@/hooks/useMarketNews";

export default function MarketNews() {
  const { data, isLoading, error } = useMarketNews();

  if (isLoading) {
    return (
      <div className="mt-10 text-zinc-400">
        Loading market news...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10 text-red-400">
        Failed to load market news.
      </div>
    );
  }
   
  return (
    <section className="mt-10">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          Market News
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Latest financial market updates
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((news) => (
          <article
            key={news.uuid}
            className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
          >
            {news.image_url && (
              // News images come from third-party publishers with dynamic hosts.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={news.image_url}
                alt={news.title}
                className="h-48 w-full object-cover"
              />
            )}

            <div className="p-5">
              <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
                <span>{news.source}</span>

                <span>
                  {new Date(news.published_at).toLocaleDateString()}
                </span>
              </div>

              <h3 className="line-clamp-2 text-lg font-semibold">
                {news.title}
              </h3>

              <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-400">
                {news.description || news.snippet}
              </p>

              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                Read more →
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
