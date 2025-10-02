import { SettingsDialog } from "@/components/settings/settings-dialog";
import { BrainCircuit } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function ChatHeader() {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-foreground">KATTAPA AI</h1>
      </div>
      <SettingsDialog />
    </header>
  );
}
