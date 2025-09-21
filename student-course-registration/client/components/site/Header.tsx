import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold",
            )}
          >
            S
          </span>
          <span className="font-extrabold tracking-tight">
            Student Course Registration
          </span>
        </a>
      </div>
    </header>
  );
}
