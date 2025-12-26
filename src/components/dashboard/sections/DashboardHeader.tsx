import { motion } from "framer-motion";
import Link from "next/link";
import { Plus } from "lucide-react";
import TextType from "@/components/TextType";

export function DashboardHeader() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <TextType
            text={["Welcome back, Admin", "Here's what's happening with your church today"]}
            typingSpeed={50}
            deletingSpeed={30}
            pauseDuration={2000}
            loop
            showCursor
            className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
            cursorCharacter="_"
            cursorClassName="text-primary"
            variableSpeed={undefined}
            onSentenceComplete={undefined}
          />
          <p className="mt-1.5 text-sm text-muted-foreground">Stay updated with key metrics & activities</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/events/create"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-black shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <Plus className="mr-2 h-4 w-4 text-black" />
            New Event
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
