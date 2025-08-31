"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Settings, Sun, Moon, Download, Trash2, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { useChat } from "@/hooks/use-chat"
import { Separator } from "@/components/ui/separator"
import useLocalStorage from "@/hooks/use-local-storage"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export function SettingsDialog() {
  const { setTheme, theme } = useTheme()
  const { clearChat, exportChat } = useChat()
  const [, setMessages] = useLocalStorage("athena-ai-chat", [])
  const [, setThemeStorage] = useLocalStorage("theme", "system")

  const handleClearAll = () => {
    setMessages([])
    setThemeStorage("system")
    window.location.reload()
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Customize your experience with Athena AI.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
            <div className="space-y-2">
                <h3 className="font-medium">Appearance</h3>
                 <div className="flex items-center justify-between p-2 rounded-lg border">
                    <p className="text-sm">Theme</p>
                    <div className="flex items-center gap-2">
                        <Button variant={theme === 'light' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTheme("light")} className="h-8 w-8">
                            <Sun className="h-4 w-4" />
                        </Button>
                        <Button variant={theme === 'dark' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTheme("dark")} className="h-8 w-8">
                            <Moon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <Separator />
            
            <div className="space-y-2">
                <h3 className="font-medium">Chat Data</h3>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={exportChat}>
                    <Download className="h-4 w-4" />
                    <span>Export Chat History</span>
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Trash2 className="h-4 w-4" />
                      <span>Clear Chat History</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your current chat history. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={clearChat}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
            
            <Separator />

            <div className="space-y-2">
              <h3 className="font-medium text-destructive">Danger Zone</h3>
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full justify-start gap-2">
                        <LogOut className="h-4 w-4" />
                        <span>Clear All Data & Reset</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your data, including chat history and preferences, and reset the app. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearAll} className="bg-destructive hover:bg-destructive/90">Reset App</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
