import React from "react";
import { 
  Settings, 
  Layers, 
  Folder, 
  Trash2, 
  Plus, 
  Pin, 
  PinOff,
  Search,
  Grid,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Check,
  X,
  AlertTriangle,
  Info,
  Edit2,
  Share2,
  Download,
  Upload,
  RefreshCw,
  Merge,
  ChevronDown,
  CheckCircle2,
  Circle,
  Box,
  HardDrive,
  FolderHeart,
  Save,
  Key,
  ExternalLink,
  Keyboard,
  LayoutGrid,
  Database,
  RotateCcw,
  Palette,
  LucideProps
} from "lucide-react";

// 1. Semantic Action Names
export type IconAction = 
  | "settings" 
  | "library" 
  | "folder" 
  | "delete" 
  | "add"
  | "pin"
  | "unpin"
  | "search"
  | "grid"
  | "maximize"
  | "prev"
  | "next"
  | "more"
  | "check"
  | "close"
  | "alert"
  | "info"
  | "edit"
  | "share"
  | "download"
  | "upload"
  | "refresh"
  | "smart_tags"
  | "chevron_down"
  | "check_circle"
  | "circle"
  | "box"
  | "hard_drive"
  | "folder_heart"
  | "save"
  | "key"
  | "external_link"
  | "keyboard"
  | "layout_grid"
  | "database"
  | "reset"
  | "palette";

// 2. Mapping Registry
const iconMap: Record<IconAction, React.FC<LucideProps>> = {
  settings: Settings,
  library: Layers,
  folder: Folder,
  delete: Trash2,
  add: Plus,
  pin: Pin,
  unpin: PinOff,
  search: Search,
  grid: Grid,
  maximize: Maximize2,
  prev: ChevronLeft,
  next: ChevronRight,
  more: MoreVertical,
  check: Check,
  close: X,
  alert: AlertTriangle,
  info: Info,
  edit: Edit2,
  share: Share2,
  download: Download,
  upload: Upload,
  refresh: RefreshCw,
  smart_tags: Merge,
  chevron_down: ChevronDown,
  check_circle: CheckCircle2,
  circle: Circle,
  box: Box,
  hard_drive: HardDrive,
  folder_heart: FolderHeart,
  save: Save,
  key: Key,
  external_link: ExternalLink,
  keyboard: Keyboard,
  layout_grid: LayoutGrid,
  database: Database,
  reset: RotateCcw,
  palette: Palette,
};

interface IconProps extends LucideProps {
  action: IconAction;
}

export const Icon: React.FC<IconProps> = ({ action, className, ...props }) => {
  const IconComponent = iconMap[action];
  
  if (!IconComponent) {
    console.warn(`Icon action "${action}" not found in registry.`);
    return null;
  }

  // Future hook for global style overrides
  // const { iconStyle } = useTheme();

  return (
    <IconComponent 
      className={className} 
      strokeWidth={props.strokeWidth || 2} // Default consistent stroke
      {...props} 
    />
  );
};
