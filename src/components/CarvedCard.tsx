type Props = {
  title: string;
  image: string;
  href?: string;
};

export function CarvedCard({ title, image, href }: Props) {
  const inner = (
    <article className="group relative overflow-hidden rounded-[var(--sa-radius-card)] bg-[var(--sa-navy)] px-3 pt-4 pb-5 transition-transform duration-300 hover:-translate-y-1">
      <div className="relative mx-auto aspect-square w-[72%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/shah-abbasi/carved-card-frame.svg"
          alt=""
          className="absolute inset-0 h-full w-full"
          aria-hidden
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          className="absolute inset-[14%] rounded-full object-cover"
        />
      </div>
      <h3 className="mt-2 text-center text-[var(--sa-text-on-navy)]">{title}</h3>
    </article>
  );

  if (href) {
    return (
      <a href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sa-gold)]">
        {inner}
      </a>
    );
  }
  return inner;
}
