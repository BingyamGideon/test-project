export function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} Student Course Registration — Mid‑Sprint
          Review
        </p>
        <p>
          Built with React + Tailwind. For production deploy, connect Netlify or
          Vercel via MCP.
        </p>
      </div>
    </footer>
  );
}
