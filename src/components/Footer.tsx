import { Instagram, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-gold/30 bg-cream-deep/60 bg-jali">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4">
        <div>
          <h3 className="font-display text-2xl text-maroon">Ethnoj<span className="text-gold">.</span></h3>
          <p className="mt-3 text-sm text-ink/70 max-w-xs">
            Heirloom-worthy Indian ethnic wear, handcrafted by artisans across the country.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-xs uppercase tracking-widest text-ink/60">Shop</h4>
          <ul className="space-y-2 text-sm text-ink/80">
            <li>Lehengas</li><li>Sarees</li><li>Kurtis</li><li>Co-ord Sets</li><li>Suits</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs uppercase tracking-widest text-ink/60">Help</h4>
          <ul className="space-y-2 text-sm text-ink/80">
            <li>Size Guide</li><li>Shipping</li><li>Returns</li><li>Care</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs uppercase tracking-widest text-ink/60">Stay close</h4>
          <p className="text-sm text-ink/80 mb-3">Whispers of new collections, first.</p>
          <div className="flex gap-3">
            <a className="rounded-full border border-gold/50 p-2 text-ink/70 hover:text-maroon" href="#"><Instagram className="h-4 w-4" /></a>
            <a className="rounded-full border border-gold/50 p-2 text-ink/70 hover:text-maroon" href="#"><Mail className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-gold/20 px-5 py-4 text-center text-xs text-ink/50">
        © {new Date().getFullYear()} Ethnoj. Woven with love in India.
      </div>
    </footer>
  );
}
