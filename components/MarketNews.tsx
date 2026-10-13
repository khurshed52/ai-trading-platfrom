"use client";

import { useMarketNews } from "@/hooks/useMarketNews";

export default function MarketNews() {
  const { data, isLoading, error } = useMarketNews();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-500 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        Loading market news...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
        Failed to load market news.
      </div>
    );
  }

  return (
    <section>
      <div className="mb-5">
        <h1 className="m-0 text-2xl font-extrabold text-slate-950">
          Market News
        </h1>

        <p className="mb-0 mt-1 text-sm text-slate-500">
          Latest financial market updates
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((news) => (
          <article
            key={news.uuid}
            className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_12px_30px_rgba(15,23,42,0.09)]"
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
              <div className="mb-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                <span>{news.source}</span>

                <span>
                  {new Date(news.published_at).toLocaleDateString()}
                </span>
              </div>

              <h3 className="line-clamp-2 text-lg font-semibold text-slate-950">
                {news.title}
              </h3>

              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                {news.description || news.snippet}
              </p>

              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
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
