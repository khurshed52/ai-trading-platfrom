type PageTitlePlaceholderProps = {
  title: string;
};

export function PageTitlePlaceholder({ title }: PageTitlePlaceholderProps) {
  return (
    <section>
      <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-950">
        {title}
      </h1>
    </section>
  );
}
