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
  // NEW: Extended icon set
  Briefcase,
  Package,
  Archive,
  Inbox,
  BookOpen,
  FolderOpen,
  FolderClosed,
  FileBox,
  Files,
  Heart,
  Star,
  Bookmark,
  Tag,
  Tags,
  Image,
  Camera,
  Film,
  Video,
  Sparkles,
  Zap,
  Flame,
  Trophy,
  Target,
  Rocket,
  Flag,
  Crown,
  Award,
  Globe,
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
  | "palette"
  // NEW: Extended icons
  | "briefcase"
  | "package"
  | "archive"
  | "inbox"
  | "book_open"
  | "folder_open"
  | "folder_closed"
  | "file_box"
  | "files"
  | "heart"
  | "star"
  | "bookmark"
  | "tag"
  | "tags"
  | "image"
  | "camera"
  | "film"
  | "video"
  | "sparkles"
  | "zap"
  | "flame"
  | "trophy"
  | "target"
  | "rocket"
  | "flag"
  | "crown"
  | "award"
  | "globe";

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
  // NEW: Extended mappings
  briefcase: Briefcase,
  package: Package,
  archive: Archive,
  inbox: Inbox,
  book_open: BookOpen,
  folder_open: FolderOpen,
  folder_closed: FolderClosed,
  file_box: FileBox,
  files: Files,
  heart: Heart,
  star: Star,
  bookmark: Bookmark,
  tag: Tag,
  tags: Tags,
  image: Image,
  camera: Camera,
  film: Film,
  video: Video,
  sparkles: Sparkles,
  zap: Zap,
  flame: Flame,
  trophy: Trophy,
  target: Target,
  rocket: Rocket,
  flag: Flag,
  crown: Crown,
  award: Award,
  globe: Globe,
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
