import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Section({ title, subtitle, icon, children }: { title: string; subtitle?: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <motion.main initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-start gap-3">
        {icon && <span className="bg-brand grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-primary-foreground">{icon}</span>}
        <div>
          <h1 className="text-2xl font-extrabold md:text-4xl">{title}</h1>
          {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.main>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }} className={`glass p-5 ${className}`}>
      {children}
    </motion.div>
  );
}
