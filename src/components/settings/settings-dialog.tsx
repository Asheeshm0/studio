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
import { Settings, Sun, Moon, Download, Trash2, LogOut, Info, FileText, Users } from "lucide-react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { VoiceOption } from "../chat/chat-provider"


export function SettingsDialog() {
  const { setTheme, theme } = useTheme()
  const { clearChat, exportChat, voice, setVoice } = useChat()
  const [, setChats] = useLocalStorage("kattapa-ai-chats", [])

  const handleClearAll = () => {
    setChats([])
    setTheme("system")
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
            Customize your experience with KATTAPA AI.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
            <div className="space-y-2">
                <h3 className="font-medium">Appearance</h3>
                 <div className="p-2 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
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
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Voice</p>
                      <RadioGroup
                        value={voice}
                        onValueChange={(value) => setVoice(value as VoiceOption)}
                        className="flex items-center gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female-voice" />
                          <Label htmlFor="female-voice" className="text-sm">Female</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male-voice" />
                          <Label htmlFor="male-voice" className="text-sm">Male</Label>
                        </div>
                      </RadioGroup>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="space-y-2">
                <h3 className="font-medium">About</h3>
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full justify-start gap-2">
                            <FileText className="h-4 w-4" />
                            <span>Terms & Conditions</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Terms & Conditions</DialogTitle>
                        <DialogDescription>
                            By using KATTAPA AI, you agree to the following terms and conditions.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 text-sm text-muted-foreground">
                            <p><strong>1. Data Privacy:</strong> Your chat history and preferences are stored locally in your browser's storage. We do not collect, see, or use your data. It remains entirely on your device.</p>
                            <p><strong>2. Data Deletion:</strong> You have full control over your data. You can clear your current chat or all of your data at any time through the settings panel. This action is irreversible.</p>
                            <p><strong>3. Service Use:</strong> You are responsible for the content you generate using the AI. Please do not use the service for any illegal or harmful activities.</p>
                        </div>
                    </DialogContent>
                </Dialog>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full justify-start gap-2">
                            <Users className="h-4 w-4" />
                            <span>About Developers</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>About KATTAPA DEVELOPERS</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 text-sm text-muted-foreground">
                            <p>KATTAPA AI was created by KATTAPA DEVELOPERS, a team of talented and innovative developers passionate about creating smart, user-friendly AI applications.</p>
                            <p>Our mission is to build powerful and accessible AI tools that can help people in their daily lives, work, and creative endeavors.</p>
                        </div>
                    </DialogContent>
                </Dialog>
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
                      <span>Clear Current Chat</span>
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
                        This will permanently delete all your data, including all chat history and preferences, and reset the app. This action cannot be undone.
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
