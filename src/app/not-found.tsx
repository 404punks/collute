import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-head">
      <h1>Page not found</h1>
      <p className="lede">That profile, post, or address is not on Callout Social.</p>
      <Link className="btn btn-primary mt-3" href="/">
        Back home
      </Link>
    </section>
  );
}
