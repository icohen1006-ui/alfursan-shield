import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Fursan Shield — AL FURSAN Ltd counterpart intelligence",
  description: "Live global company verification and trade due diligence for AL FURSAN Ltd.",
};

const links = [
  ["/", "Command"],
  ["/verify", "Verify"],
  ["/diligence", "Due diligence"],
  ["/sources", "Live sources"],
];

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Syne:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="shell">
          <header className="topbar">
            <Link className="brand" href="/">
              <div className="mark">AF</div>
              <div>
                <b>FURSAN SHIELD</b>
                <span>AL FURSAN Ltd · Cairo · global produce</span>
              </div>
            </Link>
            <details className="navwrap">
              <summary className="navtoggle">Menu</summary>
              <nav>
                {links.map(([href, label]) => (
                  <Link key={href} href={href}>{label}</Link>
                ))}
              </nav>
            </details>
          </header>
          {children}
          <footer className="site-footer">
            <span>AL FURSAN Ltd · counterpart desk · not a law firm opinion</span>
            <span>Sources are official registers. A name match is not a finding.</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
