import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { SectionHeading } from "@/components/SectionHeading";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Ethnoj" },
      { name: "description", content: "Get in touch with Ethnoj — or book a personal styling session." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16">
      <SectionHeading kicker="Say hello" title="We'd love to hear from you" sub="Questions about a piece, custom sizing, or a bridal consultation — we're here." />

      <div className="grid gap-10 md:grid-cols-2">
        <ContactForm />

        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-2xl bg-card p-7 gold-border"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Book a session</p>
          <h3 className="mt-2 font-display text-3xl text-ink">Personal styling, on you.</h3>
          <p className="mt-3 text-sm text-ink/70">Book a 30-minute virtual consult with a stylist to curate the perfect piece for your occasion.</p>

          <div className="mt-6 rounded-xl border border-dashed border-gold/40 bg-cream-deep/50 p-10 text-center">
            <CalendarClock className="mx-auto h-8 w-8 text-gold" />
            <p className="mt-3 font-display text-xl text-ink">Cal.com widget</p>
            <p className="mt-1 text-xs text-ink/60">Embeds here once your Cal.com link is added.</p>
          </div>

          <div className="mt-8 space-y-3 border-t border-gold/30 pt-6 text-sm text-ink/80">
            <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-gold" /> hello@ethnoj.in</p>
            <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-gold" /> +91 98765 43210</p>
            <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-gold" /> Studio · Bandra West, Mumbai</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error("Please fill all fields");
    toast.success("Message sent — we'll be in touch within 24 hours.");
    setForm({ name: "", email: "", message: "" });
  };
  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="rounded-2xl bg-card p-7 gold-border"
    >
      <p className="text-xs uppercase tracking-[0.3em] text-gold">Write to us</p>
      <h3 className="mt-2 font-display text-3xl text-ink">Drop a note</h3>
      <div className="mt-6 space-y-5">
        <Field label="Your name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Field label="Message" textarea value={form.message} onChange={(v) => setForm({ ...form, message: v })} />
      </div>
      <button type="submit" className="mt-7 w-full rounded-full bg-maroon py-3 text-sm font-medium text-cream hover:bg-maroon-deep transition">
        Send Message
      </button>
    </motion.form>
  );
}

function Field({ label, value, onChange, type = "text", textarea = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; textarea?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;
  return (
    <div className="relative">
      <label
        className={`pointer-events-none absolute left-3 transition-all ${
          floated ? "top-1 text-[10px] uppercase tracking-widest text-maroon" : "top-1/2 -translate-y-1/2 text-sm text-ink/50"
        }`}
        style={textarea && floated ? { top: 6 } : {}}
      >{label}</label>
      {textarea ? (
        <textarea
          value={value} onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          rows={4}
          className="w-full resize-none rounded-md border border-gold/40 bg-cream/50 px-3 pb-2 pt-5 text-sm outline-none focus:border-maroon"
        />
      ) : (
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full rounded-md border border-gold/40 bg-cream/50 px-3 pb-2 pt-5 text-sm outline-none focus:border-maroon"
        />
      )}
    </div>
  );
}
