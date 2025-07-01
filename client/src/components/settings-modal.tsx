import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Key, Save, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { ApiSettings } from "@shared/schema";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ApiSettings;
  onSave: (settings: ApiSettings) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [formData, setFormData] = useState<ApiSettings>(settings);
  const [showKeys, setShowKeys] = useState({
    openai: false,
    openrouter: false,
    claude: false,
  });
  const { toast } = useToast();

  const handleSave = () => {
    onSave(formData);
    toast({
      title: "Settings saved",
      description: "Your AI provider settings have been updated.",
    });
    onClose();
  };

  const toggleKeyVisibility = (provider: keyof typeof showKeys) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const maskKey = (key?: string) => {
    if (!key) return "";
    if (key.length <= 8) return "*".repeat(key.length);
    return key.slice(0, 4) + "*".repeat(key.length - 8) + key.slice(-4);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>AI Provider Settings</span>
          </DialogTitle>
        </DialogHeader>

        <motion.div
          className="space-y-6 py-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Preferred Provider */}
          <div className="space-y-2">
            <Label htmlFor="provider">Preferred AI Provider</Label>
            <Select
              value={formData.preferredProvider}
              onValueChange={(value: "openai" | "openrouter" | "claude") =>
                setFormData(prev => ({ ...prev, preferredProvider: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
                <SelectItem value="claude">Claude (Anthropic)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* OpenAI API Key */}
          <div className="space-y-2">
            <Label htmlFor="openai-key" className="flex items-center space-x-2">
              <Key className="w-4 h-4" />
              <span>OpenAI API Key</span>
            </Label>
            <div className="flex space-x-2">
              <Input
                id="openai-key"
                type={showKeys.openai ? "text" : "password"}
                value={showKeys.openai ? formData.openaiKey || "" : maskKey(formData.openaiKey)}
                onChange={(e) => setFormData(prev => ({ ...prev, openaiKey: e.target.value }))}
                placeholder="sk-..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => toggleKeyVisibility("openai")}
              >
                {showKeys.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* OpenRouter API Key */}
          <div className="space-y-2">
            <Label htmlFor="openrouter-key" className="flex items-center space-x-2">
              <Key className="w-4 h-4" />
              <span>OpenRouter API Key</span>
            </Label>
            <div className="flex space-x-2">
              <Input
                id="openrouter-key"
                type={showKeys.openrouter ? "text" : "password"}
                value={showKeys.openrouter ? formData.openrouterKey || "" : maskKey(formData.openrouterKey)}
                onChange={(e) => setFormData(prev => ({ ...prev, openrouterKey: e.target.value }))}
                placeholder="sk-or-..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => toggleKeyVisibility("openrouter")}
              >
                {showKeys.openrouter ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Claude API Key */}
          <div className="space-y-2">
            <Label htmlFor="claude-key" className="flex items-center space-x-2">
              <Key className="w-4 h-4" />
              <span>Claude API Key</span>
            </Label>
            <div className="flex space-x-2">
              <Input
                id="claude-key"
                type={showKeys.claude ? "text" : "password"}
                value={showKeys.claude ? formData.claudeKey || "" : maskKey(formData.claudeKey)}
                onChange={(e) => setFormData(prev => ({ ...prev, claudeKey: e.target.value }))}
                placeholder="sk-ant-..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => toggleKeyVisibility("claude")}
              >
                {showKeys.claude ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Help Text */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> API keys are stored locally in your browser and never sent to our servers. 
              They are only used to make direct API calls to your chosen AI provider.
            </p>
          </div>
        </motion.div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}