'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun } from 'docx';
import { getUserId } from '@/lib/user';
import {
  BookOpen,
  Plus,
  Send,
  Loader2,
  ChevronRight,
  PlayCircle,
  Save,
  Download,
  Settings,
  Sparkles,
  Image as ImageIcon,
  X,
  Trash2,
  Edit2,
  FileText,
  Eraser,
  Wand2,
  Copy,
  Check,
  XCircle,
  CheckCircle,
  Paperclip,
  File,
  Palette,
  Pen,
  MessageSquare,
  Briefcase,
  Mail,
  Globe,
  Target,
  AlertCircle,
  Info,
  Menu,
  PanelLeftClose,
  PanelLeft,
  Minimize2,
  Calculator,
  Volume2,
  VolumeX,
  Pause,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Radio,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Table,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Highlighter,
  MoreHorizontal,
  Undo,
  Redo,
} from 'lucide-react';

type ProjectType = 'memoir' | 'chatbot' | 'image-studio' | 'creative-writing' | 'social-media' | 'professional-docs' | 'emails' | 'translation' | 'prompt-generator' | 'text-minify' | 'word-counter' | 'ai-editor';

interface ProjectTypeInfo {
  id: ProjectType;
  name: string;
  icon: any; // Lucide icon component
  emoji: string;
  description: string;
  color: string;
  features?: string[]; // Optional features list
  gradient?: string; // Optional gradient for UI
}

const PROJECT_TYPES: ProjectTypeInfo[] = [
  {
    id: 'chatbot',
    name: 'Chatbot Général',
    icon: Sparkles,
    emoji: '💬',
    description: 'Assistant IA polyvalent pour toutes vos questions',
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Conversations naturelles', 'Réponses contextuelles', 'Multi-sujets']
  },
  {
    id: 'ai-editor',
    name: 'Éditeur IA (WYSIWYG)',
    icon: Edit2,
    emoji: '📝',
    description: 'Éditeur de texte enrichi avec assistance IA complète',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    features: ['Éditeur WYSIWYG', 'Assistance IA en temps réel', 'Formatage avancé', 'Commandes IA intégrées']
  },
  {
    id: 'memoir',
    name: 'Mémoire Académique',
    icon: BookOpen,
    emoji: '📚',
    description: 'Rédaction de thèses et mémoires universitaires',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Structure académique', 'Citations et références', 'Chapitres organisés']
  },
  {
    id: 'image-studio',
    name: 'Studio d\'Images IA',
    icon: Palette,
    emoji: '🎨',
    description: 'Génération et modification d\'images',
    color: 'pink',
    gradient: 'from-pink-500 to-rose-500',
    features: ['Génération d\'images', 'Modification créative', 'Styles variés']
  },
  {
    id: 'creative-writing',
    name: 'Rédaction Créative',
    icon: Pen,
    emoji: '✍️',
    description: 'Romans, nouvelles et histoires',
    color: 'orange',
    gradient: 'from-orange-500 to-amber-500',
    features: ['Création de personnages', 'Développement d\'intrigues', 'Styles littéraires']
  },
  {
    id: 'social-media',
    name: 'Réseaux Sociaux',
    icon: MessageSquare,
    emoji: '📱',
    description: 'Posts optimisés pour réseaux sociaux',
    color: 'green',
    gradient: 'from-green-500 to-emerald-500',
    features: ['Posts engageants', 'Hashtags optimisés', 'Multi-plateformes']
  },
  {
    id: 'professional-docs',
    name: 'Documents Professionnels',
    icon: Briefcase,
    emoji: '💼',
    description: 'Rapports et présentations',
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-500',
    features: ['Rapports structurés', 'Présentations PowerPoint', 'Documents formels']
  },
  {
    id: 'emails',
    name: 'Emails & Correspondance',
    icon: Mail,
    emoji: '✉️',
    description: 'Rédaction d\'emails professionnels',
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-500',
    features: ['Ton professionnel', 'Réponses rapides', 'Templates personnalisés']
  },
  {
    id: 'translation',
    name: 'Traduction',
    icon: Globe,
    emoji: '🌍',
    description: 'Traduction contextuelle multi-langues',
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-500',
    features: ['Traduction précise', 'Contexte préservé', '50+ langues']
  },
  {
    id: 'prompt-generator',
    name: 'Prompt Generator',
    icon: Target,
    emoji: '🎯',
    description: 'Optimiser vos prompts pour IA',
    color: 'amber',
    gradient: 'from-amber-500 to-yellow-500',
    features: ['Prompts optimisés', 'Instructions claires', 'Meilleurs résultats']
  },
  {
    id: 'text-minify',
    name: 'Minificateur de Texte',
    icon: Minimize2,
    emoji: '📦',
    description: 'Compresser et réduire vos textes',
    color: 'slate',
    gradient: 'from-slate-500 to-gray-500',
    features: ['Compression intelligente', 'Préservation du sens', 'Réduction de taille']
  },
  {
    id: 'word-counter',
    name: 'Compteur de Mots',
    icon: Calculator,
    emoji: '🔢',
    description: 'Analyse complète de vos textes',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
    features: ['Compte mots & caractères', 'Analyse de phrases', 'Statistiques détaillées']
  }
];

interface Project {
  id: number;
  title: string;
  description?: string;
  project_type?: ProjectType;
}

interface Chapter {
  id: number;
  project_id: number;
  title: string;
  order_index: number;
  content: string;
}

interface Message {
  id?: number; // ID de la BDD pour pouvoir supprimer
  role: 'user' | 'assistant';
  content: string;
  images?: string[]; // Base64 des images
}

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface ConfirmDialog {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface InputDialog {
  isOpen: boolean;
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  icon?: string;
}

// Composant pour les blocs de code avec syntax highlighting et bouton copy
const CodeBlock = ({ language, value }: { language?: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      <div className="flex items-center justify-between bg-slate-800 px-4 py-2 rounded-t-lg border-b border-white/10">
        <span className="text-xs text-purple-300 font-mono uppercase tracking-wide">
          {language || 'code'}
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-2 py-1 text-xs bg-white/5 hover:bg-white/10 text-white rounded transition-colors"
          title="Copier le code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Copié!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copier</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: '0.5rem',
          borderBottomRightRadius: '0.5rem',
          fontSize: '0.875rem',
          maxHeight: '600px',
        }}
        showLineNumbers
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, type: string, content: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
    type: 'warning'
  });
  const [inputDialog, setInputDialog] = useState<InputDialog>({
    isOpen: false,
    title: '',
    message: '',
    placeholder: '',
    defaultValue: '',
    onConfirm: () => {},
    onCancel: () => {},
    icon: '✏️'
  });
  const [inputDialogValue, setInputDialogValue] = useState('');
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0); // Vitesse de lecture (0.5 - 2.0)
  const [showSpeechSettings, setShowSpeechSettings] = useState<boolean>(false);
  const [speechButtonRef, setSpeechButtonRef] = useState<HTMLButtonElement | null>(null);
  const speechSettingsRef = useRef<HTMLButtonElement>(null);
  
  // États pour l'appel vocal (Push-to-Talk avec enregistrement audio)
  const [isVoiceCallActive, setIsVoiceCallActive] = useState<boolean>(false);
  const [isPushingToTalk, setIsPushingToTalk] = useState<boolean>(false); // Maintien du bouton
  const [isAISpeaking, setIsAISpeaking] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  
  // État pour l'enregistrement vocal rapide (sans appel)
  const [isQuickRecording, setIsQuickRecording] = useState<boolean>(false);
  
  // États pour l'éditeur WYSIWYG
  const [editorContent, setEditorContent] = useState<string>('');
  const [selectedText, setSelectedText] = useState<string>('');
  const [showAIMenu, setShowAIMenu] = useState<boolean>(false);
  const [aiMenuPosition, setAiMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [customAIPrompt, setCustomAIPrompt] = useState<string>('');
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [showTableModal, setShowTableModal] = useState<boolean>(false);
  const [tableRows, setTableRows] = useState<number>(3);
  const [tableCols, setTableCols] = useState<number>(3);
  // États pour la toolbar de tableau
  const [selectedTable, setSelectedTable] = useState<HTMLTableElement | null>(null);
  const [tableToolbarPos, setTableToolbarPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showTableToolbar, setShowTableToolbar] = useState(false);
  const savedAIRangeRef = useRef<Range | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  
  // Historique pour Undo/Redo
  const historyRef = useRef<string[]>(['<p><br></p>']);
  const historyIndexRef = useRef<number>(0);
  
  // MediaRecorder pour l'enregistrement audio
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const quickRecorderRef = useRef<MediaRecorder | null>(null);
  const quickAudioChunksRef = useRef<Blob[]>([]);
  const quickStreamRef = useRef<MediaStream | null>(null);
  
  // Refs pour garder les valeurs à jour dans les callbacks
  const selectedProjectRef = useRef<Project | null>(null);
  const isAISpeakingRef = useRef<boolean>(false);
  const isVoiceCallActiveRef = useRef<boolean>(false);
  const isPushingToTalkRef = useRef<boolean>(false);
  const isProcessingMessageRef = useRef<boolean>(false); // Flag pour empêcher les envois multiples
  
  // Mettre à jour les refs quand les états changent
  useEffect(() => {
    selectedProjectRef.current = selectedProject;
  }, [selectedProject]);
  
  useEffect(() => {
    isAISpeakingRef.current = isAISpeaking;
  }, [isAISpeaking]);
  
  useEffect(() => {
    isVoiceCallActiveRef.current = isVoiceCallActive;
  }, [isVoiceCallActive]);
  
  useEffect(() => {
    isPushingToTalkRef.current = isPushingToTalk;
  }, [isPushingToTalk]);

  // Charger les projets au démarrage
  useEffect(() => {
    loadProjects();
  }, []);

  // Charger les chapitres et conversations quand un projet est sélectionné
  useEffect(() => {
    if (selectedProject) {
      clearEditor(); // Nettoyer l'éditeur au changement de projet
      loadChapters(selectedProject.id);
      loadConversations(selectedProject.id);
      // Recharger la galerie si elle est ouverte
      if (showGallery) {
        loadGallery(selectedProject.id);
      }
    } else {
      setChapters([]);
      setMessages([]);
    }
  }, [selectedProject]);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Initialiser l'éditeur WYSIWYG
  useEffect(() => {
    if (editorRef.current && selectedProject?.project_type === 'ai-editor') {
      // Activer le formatage HTML et désactiver le mode stylewithcss
      document.execCommand('styleWithCSS', false, 'false');
      document.execCommand('defaultParagraphSeparator', false, 'p');
    }
  }, [selectedProject]);

  // Fermer le panneau de paramètres vocaux quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showSpeechSettings && !target.closest('.speech-settings-panel') && !target.closest('[data-speech-settings-btn]')) {
        setShowSpeechSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSpeechSettings]);

  // Gérer les raccourcis clavier (Undo/Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z ou Cmd+Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl+Y ou Ctrl+Shift+Z ou Cmd+Shift+Z = Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Ajouter les changements de l'éditeur à l'historique
  useEffect(() => {
    if (!editorRef.current) return;

    let changeTimeout: NodeJS.Timeout;

    const handleInputChange = () => {
      // Attendre 500ms avant d'ajouter à l'historique (debounce)
      clearTimeout(changeTimeout);
      changeTimeout = setTimeout(() => {
        addToHistory();
      }, 500);
    };

    // Écouter les changements
    editorRef.current.addEventListener('input', handleInputChange);
    editorRef.current.addEventListener('paste', handleInputChange);
    editorRef.current.addEventListener('drop', handleInputChange);

    return () => {
      if (editorRef.current) {
        editorRef.current.removeEventListener('input', handleInputChange);
        editorRef.current.removeEventListener('paste', handleInputChange);
        editorRef.current.removeEventListener('drop', handleInputChange);
      }
      clearTimeout(changeTimeout);
    };
  }, []);

  // Nettoyer l'éditeur au refresh/fermeture de la page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (editorRef.current) {
        editorRef.current.innerHTML = '<p><br></p>';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Système de pagination automatique pour l'éditeur A4
  useEffect(() => {
    if (!editorRef.current || selectedProject?.project_type !== 'ai-editor') return;

    // Dimensions A4 en pixels (basé sur 96 DPI)
    const A4_HEIGHT_CM = 29.7;
    const CM_TO_PX = 37.795275591; // 1cm = 37.795px à 96 DPI
    const A4_HEIGHT_PX = A4_HEIGHT_CM * CM_TO_PX; // ~1122px
    
    // Padding en pixels
    const TOP_PADDING_CM = 2.5;
    const BOTTOM_PADDING_CM = 2;
    const TOTAL_PADDING_PX = (TOP_PADDING_CM + BOTTOM_PADDING_CM) * CM_TO_PX; // ~170px
    
    // Hauteur de contenu utilisable par page
    const MAX_CONTENT_PER_PAGE = A4_HEIGHT_PX - TOTAL_PADDING_PX; // ~952px
    const TRIGGER_THRESHOLD = MAX_CONTENT_PER_PAGE * 0.95; // Déclencher à 95% de la page

    let lastHeight = 0;

    const checkContentOverflow = () => {
      if (!editorRef.current) return;

      const currentHeight = editorRef.current.scrollHeight;
      
      // Ne vérifier que si la hauteur a changé
      if (currentHeight === lastHeight) return;
      lastHeight = currentHeight;

      // Compter le nombre de pages actuelles
      const pageBreaks = editorRef.current.querySelectorAll('.page-break');
      const currentPageCount = pageBreaks.length + 1;
      
      // Hauteur maximale autorisée pour ce nombre de pages
      const maxAllowedHeight = TRIGGER_THRESHOLD * currentPageCount;
      
      console.log(`📊 Hauteur: ${currentHeight}px / Max: ${maxAllowedHeight.toFixed(0)}px (Page ${currentPageCount})`);
      
      // Si le contenu dépasse le seuil
      if (currentHeight > maxAllowedHeight) {
        console.log(`🔥 DÉPASSEMENT ! Création page ${currentPageCount + 1}`);
        
        // Vérifier que le dernier élément n'est pas déjà un page-break
        const lastChild = editorRef.current.lastElementChild;
        if (lastChild?.classList.contains('page-break')) {
          return; // Déjà un page-break à la fin
        }
        
        // Créer le saut de page
        const pageBreakDiv = document.createElement('div');
        pageBreakDiv.className = 'page-break';
        pageBreakDiv.contentEditable = 'false';
        pageBreakDiv.style.pageBreakAfter = 'always';
        pageBreakDiv.textContent = `📄 PAGE ${currentPageCount + 1}`;
        
        // Ajouter à l'éditeur
        editorRef.current.appendChild(pageBreakDiv);
        
        // Ajouter un paragraphe vide pour continuer à écrire
        const newParagraph = document.createElement('p');
        newParagraph.innerHTML = '<br>';
        editorRef.current.appendChild(newParagraph);
        
        // Scroll vers la nouvelle page avec animation
        setTimeout(() => {
          // Trouver le conteneur avec scroll (le parent de l'éditeur)
          const scrollContainer = editorRef.current?.parentElement;
          if (scrollContainer) {
            // Calculer la position du pageBreakDiv
            const pageBreakRect = pageBreakDiv.getBoundingClientRect();
            const containerRect = scrollContainer.getBoundingClientRect();
            const scrollTop = scrollContainer.scrollTop;
            const targetScroll = scrollTop + (pageBreakRect.top - containerRect.top) - (containerRect.height / 2);
            
            // Scroll smooth vers la nouvelle page
            scrollContainer.scrollTo({
              top: targetScroll,
              behavior: 'smooth'
            });
            
            console.log(`⬇️ Scroll vers position: ${targetScroll}px`);
          }
          
          // Focus sur le nouveau paragraphe
          setTimeout(() => {
            newParagraph.focus();
            
            // Placer le curseur dans le paragraphe
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(newParagraph);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }, 400);
        }, 100);
        
        showToast('info', `📄 Page ${currentPageCount + 1} créée`);
      }
    };

    const handleEditorChange = () => {
      // Vérifier à chaque frappe
      checkContentOverflow();
    };

    // Écouter TOUS les types de changements
    editorRef.current.addEventListener('input', handleEditorChange);
    editorRef.current.addEventListener('paste', handleEditorChange);
    editorRef.current.addEventListener('keyup', handleEditorChange);

    return () => {
      if (editorRef.current) {
        editorRef.current.removeEventListener('input', handleEditorChange);
        editorRef.current.removeEventListener('paste', handleEditorChange);
        editorRef.current.removeEventListener('keyup', handleEditorChange);
      }
    };
  }, [selectedProject?.project_type]);

  // Fonction pour afficher un toast
  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    
    // Auto-suppression après 4 secondes
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  // Fonction pour afficher une confirmation moderne
  const showConfirm = (
    title: string, 
    message: string, 
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' = 'warning',
    confirmText: string = 'Confirmer',
    cancelText: string = 'Annuler'
  ) => {
    return new Promise<boolean>((resolve) => {
      setConfirmDialog({
        isOpen: true,
        title,
        message,
        onConfirm: () => {
          onConfirm();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        },
        confirmText,
        cancelText,
        type
      });
    });
  };

  // Fonction pour afficher un input moderne
  const showInput = (
    title: string,
    message: string = '',
    defaultValue: string = '',
    placeholder: string = '',
    icon: string = '✏️',
    confirmText: string = 'OK',
    cancelText: string = 'Annuler'
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      setInputDialogValue(defaultValue);
      setInputDialog({
        isOpen: true,
        title,
        message,
        placeholder,
        defaultValue,
        icon,
        onConfirm: (value) => {
          setInputDialog(prev => ({ ...prev, isOpen: false }));
          resolve(value);
        },
        onCancel: () => {
          setInputDialog(prev => ({ ...prev, isOpen: false }));
          resolve(null);
        },
        confirmText,
        cancelText
      });
    });
  };

  // Fonction pour détecter si le texte contient de l'arabe
  const isArabicText = (text: string): boolean => {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  };

  // Initialiser Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  // Nettoyer la synthèse vocale quand on quitte
  useEffect(() => {
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, [speechSynthesis]);

  // Fonction pour lire un message à haute voix
  const speakMessage = (text: string, messageIndex: number) => {
    if (!speechSynthesis) {
      showToast('error', 'La lecture vocale n\'est pas disponible sur ce navigateur');
      return;
    }

    // Si on est déjà en train de lire ce message, on arrête
    if (speakingMessageIndex === messageIndex) {
      speechSynthesis.cancel();
      setSpeakingMessageIndex(null);
      return;
    }

    // Arrêter toute lecture en cours
    speechSynthesis.cancel();

    // Nettoyer le texte markdown pour la lecture
    const cleanText = text
      .replace(/[#*_`~\[\]()]/g, '') // Retirer les caractères markdown
      .replace(/\n\n+/g, '. ') // Remplacer les doubles sauts de ligne par des points
      .replace(/\n/g, ' ') // Remplacer les simples sauts de ligne par des espaces
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Détecter la langue et ajuster la voix
    if (isArabicText(text)) {
      utterance.lang = 'ar-SA'; // Arabe
    } else if (/[\u0400-\u04FF]/.test(text)) {
      utterance.lang = 'ru-RU'; // Russe
    } else if (/[\u4E00-\u9FFF]/.test(text)) {
      utterance.lang = 'zh-CN'; // Chinois
    } else if (/[àâäéèêëïîôùûüÿœæ]/i.test(text)) {
      utterance.lang = 'fr-FR'; // Français
    } else {
      utterance.lang = 'en-US'; // Anglais par défaut
    }

    // Paramètres de la voix
    utterance.rate = speechRate; // Vitesse personnalisable
    utterance.pitch = 1.0; // Tonalité normale
    utterance.volume = 1.0; // Volume maximum

    // Événements
    utterance.onstart = () => {
      setSpeakingMessageIndex(messageIndex);
    };

    utterance.onend = () => {
      setSpeakingMessageIndex(null);
    };

    utterance.onerror = (event) => {
      console.error('Erreur de lecture vocale:', event);
      setSpeakingMessageIndex(null);
      showToast('error', 'Erreur lors de la lecture vocale');
    };

    // Lancer la lecture
    speechSynthesis.speak(utterance);
  };

  // Initialiser le système d'enregistrement audio (remplace reconnaissance vocale)
  // Pas besoin de useEffect - on initialise le MediaRecorder à la demande

  // Gérer l'envoi du message vocal à l'IA
  const handleVoiceMessage = async (transcript: string) => {
    console.log('🎤 handleVoiceMessage appelé avec:', transcript);
    console.log('🔍 selectedProjectRef.current dans handleVoiceMessage:', selectedProjectRef.current);
    
    // Utiliser la ref pour avoir la valeur actuelle
    const currentProject = selectedProjectRef.current;
    
    if (!transcript || !currentProject) {
      console.log('❌ Pas de transcript ou projet:', { transcript, currentProject });
      return;
    }
    
    // Vérifier si on est déjà en train de traiter un message
    if (isProcessingMessageRef.current) {
      console.log('⚠️ Déjà en train de traiter un message, ignoré:', transcript);
      return;
    }
    
    // Marquer qu'on commence le traitement
    isProcessingMessageRef.current = true;
    console.log('🔒 Flag de traitement activé');
    
    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      role: 'user',
      content: transcript,
      images: []
    };
    
    setMessages(prev => [...prev, userMessage]);
    console.log('📝 Message utilisateur ajouté');
    
    try {
      setIsAISpeaking(true);
      console.log('🔊 IA en train de parler (état activé)');
      
      // Envoyer à l'API avec streaming
      console.log('📤 Envoi à l\'API:', {
        message: transcript,
        projectId: currentProject.id,
        chapterId: selectedChapter?.id,
      });
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transcript,
          projectId: currentProject.id,
          chapterId: selectedChapter?.id,
        }),
      });
      
      console.log('📥 Réponse API reçue, status:', res.status);
      
      // Lire le stream de réponse
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      
      if (reader) {
        console.log('📖 Lecture du stream...');
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('✅ Stream terminé');
            break;
          }
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              
              try {
                const parsed = JSON.parse(data);
                fullContent += parsed.content;
              } catch (e) {
                // Ignorer les erreurs de parsing
              }
            }
          }
        }
      }
      
      console.log('💬 Contenu complet reçu:', fullContent.substring(0, 100) + '...');
      console.log('📏 Longueur du contenu:', fullContent.length);
      
      // Ajouter la réponse complète
      const aiMessage: Message = {
        role: 'assistant',
        content: fullContent,
        images: []
      };
      
      setMessages(prev => [...prev, aiMessage]);
      console.log('📝 Message IA ajouté');
      
      // Sauvegarder les messages
      if (currentProject) {
        try {
          await fetch('/api/save-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: currentProject.id,
              role: 'user',
              content: transcript,
              chapterId: selectedChapter?.id,
            }),
          });
          
          await fetch('/api/save-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: currentProject.id,
              role: 'assistant',
              content: fullContent,
              chapterId: selectedChapter?.id,
            }),
          });
          console.log('💾 Messages sauvegardés');
        } catch (saveError) {
          console.error('❌ Erreur sauvegarde:', saveError);
        }
      }
      
      // Lire la réponse à haute voix
      // Utiliser window.speechSynthesis directement et les refs pour les états
      const hasSpeechSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window;
      const isCallActive = isVoiceCallActiveRef.current;
      const isArabic = isArabicText(fullContent);
      
      // Vérifier si on a une voix locale arabe disponible
      let hasLocalArabicVoice = false;
      if (isArabic && hasSpeechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        hasLocalArabicVoice = voices.some(v => v.lang.startsWith('ar') && v.localService && !v.name.includes('Online'));
        console.log('🔍 Voix arabe locale disponible:', hasLocalArabicVoice);
      }
      
      // Si c'est de l'arabe SANS voix locale, ne pas essayer de lire
      const shouldSkipSpeech = isArabic && !hasLocalArabicVoice;
      
      console.log('🔍 Vérification conditions speech:', {
        hasSpeechSynthesis,
        isCallActive,
        hasContent: !!fullContent,
        contentLength: fullContent.length,
        isArabic,
        hasLocalArabicVoice,
        shouldSkipSpeech
      });
      
      if (hasSpeechSynthesis && isCallActive && fullContent && !shouldSkipSpeech) {
        const cleanText = fullContent
          .replace(/[#*_`~\[\]()]/g, '')
          .replace(/\n\n+/g, '. ')
          .replace(/\n/g, ' ')
          .trim();
        
        console.log('🧹 Texte nettoyé:', cleanText.substring(0, 100) + '...');
        console.log('📏 Longueur texte nettoyé:', cleanText.length);
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        const isArabic = isArabicText(fullContent);
        utterance.rate = speechRate;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Sélectionner la MEILLEURE voix pour la langue
        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;
        
        if (voices.length > 0) {
          if (isArabic) {
            // Chercher une voix arabe LOCALE (plus fiable que les voix Online)
            // Éviter les voix "Online" qui échouent souvent
            selectedVoice = voices.find(v => v.lang.startsWith('ar') && v.localService && !v.name.includes('Online'))
              || voices.find(v => v.lang.startsWith('ar') && v.localService)
              || voices.find(v => v.lang.startsWith('ar') && !v.name.includes('Online'));
            
            if (selectedVoice) {
              console.log('✅ Voix arabe sélectionnée:', selectedVoice.name, '|', selectedVoice.lang);
            } else {
              console.log('⚠️ Aucune voix arabe locale trouvée, pas de voix assignée (fallback automatique)');
              // Ne pas assigner de voix - laisser le navigateur utiliser sa voix par défaut
            }
          } else {
            // Chercher la MEILLEURE voix française LOCALE
            // Prioriser : Locales > Google > Microsoft
            selectedVoice = voices.find(v => v.lang === 'fr-FR' && v.localService && v.name.includes('Google'))
              || voices.find(v => v.lang === 'fr-FR' && v.localService && v.name.includes('Microsoft'))
              || voices.find(v => v.lang === 'fr-FR' && v.localService)
              || voices.find(v => v.lang === 'fr-FR' && v.name.includes('Google'))
              || voices.find(v => v.lang.startsWith('fr-') && v.localService)
              || voices.find(v => v.lang.startsWith('fr'));
            
            if (selectedVoice) {
              console.log('✅ Voix française sélectionnée:', selectedVoice.name, '|', selectedVoice.lang);
            } else {
              console.log('⚠️ Aucune voix française trouvée, utilisation voix par défaut');
            }
          }
          
          // N'assigner la voix QUE si on en a trouvé une fiable
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
        }
        
        utterance.lang = isArabic ? 'ar-SA' : 'fr-FR';
        
        console.log('🗣️ Configuration utterance:', {
          lang: utterance.lang,
          rate: utterance.rate,
          textLength: cleanText.length,
          voiceName: utterance.voice?.name || 'default',
          voiceLang: utterance.voice?.lang || 'none'
        });
        
        utterance.onstart = () => {
          console.log('▶️ Speech synthesis démarrée');
        };
        
        utterance.onend = () => {
          console.log('⏹️ Speech synthesis terminée');
          setIsAISpeaking(false);
          
          // IMPORTANT : Libérer le flag de traitement
          isProcessingMessageRef.current = false;
          console.log('🔓 Flag de traitement désactivé');
          
          // Mode Push-to-Talk : Ne PAS redémarrer automatiquement le recognition
          // L'utilisateur devra maintenir le bouton pour parler à nouveau
        };
        
        utterance.onerror = (e) => {
          console.error('❌ Erreur speech synthesis:', e);
          
          // FALLBACK : Si la voix spécifique échoue, essayer sans voix (voix par défaut)
          if (e.error === 'synthesis-failed') {
            console.log('🔄 Tentative avec voix par défaut...');
            
            const fallbackUtterance = new SpeechSynthesisUtterance(cleanText);
            fallbackUtterance.lang = isArabic ? 'ar-SA' : 'fr-FR';
            fallbackUtterance.rate = speechRate;
            fallbackUtterance.pitch = 1.0;
            fallbackUtterance.volume = 1.0;
            // Ne pas assigner de voix - laisser le navigateur choisir par défaut
            
            fallbackUtterance.onend = () => {
              console.log('⏹️ Speech synthesis terminée (fallback)');
              setIsAISpeaking(false);
              isProcessingMessageRef.current = false;
              console.log('🔓 Flag de traitement désactivé');
            };
            
            fallbackUtterance.onerror = (e2) => {
              console.error('❌ Erreur fallback:', e2);
              showToast('info', '📝 La lecture vocale n\'est pas disponible, mais la réponse est affichée');
              setIsAISpeaking(false);
              isProcessingMessageRef.current = false;
              console.log('🔓 Flag de traitement désactivé (fallback error)');
            };
            
            // Essayer avec le fallback
            try {
              window.speechSynthesis.cancel(); // Annuler l'essai précédent
              window.speechSynthesis.speak(fallbackUtterance);
              console.log('✅ Fallback lancé avec voix par défaut');
            } catch (error) {
              console.error('❌ Impossible de lancer le fallback:', error);
              setIsAISpeaking(false);
              isProcessingMessageRef.current = false;
            }
            return; // Ne pas continuer avec le code ci-dessous
          }
          
          // Pour les autres erreurs
          setIsAISpeaking(false);
          isProcessingMessageRef.current = false;
          console.log('🔓 Flag de traitement désactivé (erreur)');
        };
        
        console.log('🚀 Lancement de speechSynthesis.speak()...');
        
        // S'assurer que les voix sont chargées avant de parler
        const speakWithVoices = () => {
          const availableVoices = window.speechSynthesis.getVoices();
          if (availableVoices.length > 0 && !utterance.voice) {
            // Re-sélectionner la meilleure voix maintenant que la liste est chargée
            const isArabic = isArabicText(fullContent);
            const bestVoice = isArabic
              ? availableVoices.find(v => v.lang.startsWith('ar') && v.localService) || availableVoices.find(v => v.lang.startsWith('ar'))
              : availableVoices.find(v => v.lang === 'fr-FR' && v.name.includes('Google'))
                || availableVoices.find(v => v.lang === 'fr-FR' && v.name.includes('Microsoft'))
                || availableVoices.find(v => v.lang === 'fr-FR' && v.localService)
                || availableVoices.find(v => v.lang.startsWith('fr'));
            
            if (bestVoice) {
              utterance.voice = bestVoice;
              console.log('✅ Voix re-sélectionnée après chargement:', bestVoice.name);
            }
          }
          window.speechSynthesis.speak(utterance);
        };
        
        if (window.speechSynthesis.getVoices().length === 0) {
          console.log('⏳ En attente du chargement des voix...');
          window.speechSynthesis.addEventListener('voiceschanged', speakWithVoices, { once: true });
        } else {
          speakWithVoices();
        }
        
        console.log('✅ speechSynthesis.speak() appelé');
      } else {
        console.log('⚠️ Conditions non remplies pour speech synthesis');
        if (!hasSpeechSynthesis) console.log('  - speechSynthesis non disponible dans le navigateur');
        if (!isCallActive) console.log('  - isCallActive = false (ref value)');
        if (!fullContent) console.log('  - fullContent vide');
        if (shouldSkipSpeech) {
          console.log('  - Lecture arabe ignorée (pas de voix locale disponible)');
          showToast('info', '📝 Réponse en arabe affichée (voix arabe non disponible sur votre système)');
        }
        
        setIsAISpeaking(false);
        
        // IMPORTANT : Libérer le flag de traitement
        isProcessingMessageRef.current = false;
        console.log('🔓 Flag de traitement désactivé (pas de speech)');
        
        // Mode Push-to-Talk : Ne PAS redémarrer automatiquement
      }
    } catch (error) {
      console.error('❌ Erreur dans handleVoiceMessage:', error);
      showToast('error', 'Erreur lors de l\'envoi du message vocal');
      setIsAISpeaking(false);
      
      // IMPORTANT : Libérer le flag de traitement en cas d'erreur
      isProcessingMessageRef.current = false;
      console.log('🔓 Flag de traitement désactivé (catch)');
      
      // Mode Push-to-Talk : Ne PAS redémarrer automatiquement
    }
  };

  // Démarrer l'appel vocal
  const startVoiceCall = async () => {
    console.log('📞 startVoiceCall appelé');
    
    if (!selectedProject) {
      showToast('warning', 'Veuillez sélectionner un projet d\'abord');
      return;
    }
    
    // Demander la permission du microphone
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      console.log('✅ Permission microphone accordée');
      
      // Afficher les voix disponibles pour debug
      const voices = window.speechSynthesis.getVoices();
      console.log('🗣️ Voix disponibles sur ce système:', voices.length);
      voices.forEach((voice, i) => {
        console.log(`  ${i + 1}. ${voice.name} (${voice.lang}) ${voice.localService ? '🏠 Local' : '☁️ Remote'} ${voice.default ? '⭐ Défaut' : ''}`);
      });
      
      console.log('✅ Démarrage de l\'appel vocal...');
      setIsVoiceCallActive(true);
      
      showToast('success', '🎙️ Appel vocal prêt - Maintenez le bouton pour enregistrer !');
    } catch (error) {
      console.error('❌ Permission microphone refusée:', error);
      showToast('error', '🎤 Veuillez autoriser l\'accès au microphone');
    }
  };

  // Arrêter l'appel vocal
  const endVoiceCall = () => {
    console.log('📞 endVoiceCall appelé - Arrêt de l\'appel');
    
    setIsVoiceCallActive(false);
    setIsPushingToTalk(false);
    setIsAISpeaking(false);
    setVoiceTranscript('');
    setIsTranscribing(false);
    
    // Arrêter l'enregistrement si en cours
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Libérer le stream du microphone
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    showToast('info', '📞 Appel vocal terminé');
  };

  // Push-to-Talk : Démarrer l'enregistrement audio quand on appuie
  const startPushToTalk = () => {
    console.log('🎙️ Push-to-Talk : START - Début enregistrement');
    
    // IMPORTANT : Si l'IA parle, l'interrompre immédiatement !
    if (isAISpeaking) {
      console.log('🛑 Interruption de l\'IA en cours de parole');
      setIsAISpeaking(false);
      
      // Arrêter la synthèse vocale immédiatement
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        console.log('🔇 Speech synthesis annulé');
      }
      
      // Libérer le flag de traitement
      isProcessingMessageRef.current = false;
      console.log('🔓 Flag de traitement libéré (interruption)');
    }
    
    setIsPushingToTalk(true);
    setVoiceTranscript('');
    audioChunksRef.current = [];
    
    // Créer un nouveau MediaRecorder
    if (mediaStreamRef.current) {
      try {
        const mediaRecorder = new MediaRecorder(mediaStreamRef.current, {
          mimeType: 'audio/webm;codecs=opus'
        });
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            console.log('🎤 Chunk audio capturé:', event.data.size, 'bytes');
          }
        };
        
        mediaRecorder.start(100); // Enregistrer des chunks toutes les 100ms
        mediaRecorderRef.current = mediaRecorder;
        console.log('✅ Enregistrement audio démarré');
      } catch (error) {
        console.error('❌ Erreur démarrage MediaRecorder:', error);
        showToast('error', 'Erreur d\'enregistrement audio');
      }
    }
  };

  // Push-to-Talk : Arrêter l'enregistrement et transcrire quand on relâche
  const stopPushToTalk = async () => {
    console.log('🎙️ Push-to-Talk : STOP - Fin enregistrement');
    setIsPushingToTalk(false);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      // Attendre que tous les chunks soient collectés
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (audioChunksRef.current.length === 0) {
        console.log('❌ Aucun audio enregistré');
        showToast('warning', 'Aucun audio détecté');
        return;
      }
      
      console.log('� Total chunks collectés:', audioChunksRef.current.length);
      
      // Créer un blob audio
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      console.log('🎵 Blob audio créé:', audioBlob.size, 'bytes');
      
      // Afficher "Transcription en cours..."
      setIsTranscribing(true);
      setVoiceTranscript('Transcription en cours...');
      
      // Envoyer à l'API de transcription
      try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        
        console.log('📤 Envoi audio pour transcription...');
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        if (result.success && result.transcription) {
          console.log('✅ Transcription reçue:', result.transcription);
          setVoiceTranscript(result.transcription);
          setIsTranscribing(false);
          
          // Envoyer à l'IA
          handleVoiceMessage(result.transcription);
        } else {
          console.error('❌ Erreur transcription:', result.error);
          setIsTranscribing(false);
          setVoiceTranscript('');
          showToast('error', 'Erreur de transcription');
        }
      } catch (error) {
        console.error('❌ Erreur envoi audio:', error);
        setIsTranscribing(false);
        setVoiceTranscript('');
        showToast('error', 'Erreur d\'envoi audio');
      }
    }
  };

  // Enregistrement vocal rapide (sans mode appel)
  const startQuickRecording = async () => {
    console.log('🎙️ Enregistrement vocal rapide démarré');
    
    try {
      // Demander l'accès au microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      quickStreamRef.current = stream;
      
      setIsQuickRecording(true);
      quickAudioChunksRef.current = [];
      
      // Créer un nouveau MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          quickAudioChunksRef.current.push(event.data);
          console.log('🎤 Chunk audio rapide capturé:', event.data.size, 'bytes');
        }
      };
      
      mediaRecorder.start(100);
      quickRecorderRef.current = mediaRecorder;
      console.log('✅ Enregistrement vocal rapide actif');
      showToast('info', '🎤 Enregistrement en cours...');
    } catch (error) {
      console.error('❌ Erreur accès microphone:', error);
      showToast('error', 'Impossible d\'accéder au microphone');
    }
  };

  const stopQuickRecording = async () => {
    console.log('🎙️ Arrêt enregistrement vocal rapide');
    setIsQuickRecording(false);
    
    if (quickRecorderRef.current && quickRecorderRef.current.state !== 'inactive') {
      quickRecorderRef.current.stop();
      
      // Libérer le stream
      if (quickStreamRef.current) {
        quickStreamRef.current.getTracks().forEach(track => track.stop());
        quickStreamRef.current = null;
      }
      
      // Attendre que tous les chunks soient collectés
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (quickAudioChunksRef.current.length === 0) {
        console.log('❌ Aucun audio enregistré');
        showToast('warning', 'Aucun audio détecté');
        return;
      }
      
      console.log('📦 Total chunks collectés:', quickAudioChunksRef.current.length);
      
      // Créer un blob audio
      const audioBlob = new Blob(quickAudioChunksRef.current, { type: 'audio/webm' });
      console.log('🎵 Blob audio créé:', audioBlob.size, 'bytes');
      
      // Afficher "Transcription en cours..."
      setIsTranscribing(true);
      
      try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'quick-recording.webm');
        
        console.log('📤 Envoi audio pour transcription...');
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        if (result.success && result.transcription) {
          console.log('✅ Transcription reçue:', result.transcription);
          setIsTranscribing(false);
          
          // Mettre le texte transcrit dans l'input
          setInputMessage(result.transcription);
          showToast('success', '✅ Transcription ajoutée');
        } else {
          console.error('❌ Erreur transcription:', result.error);
          setIsTranscribing(false);
          showToast('error', 'Erreur de transcription');
        }
      } catch (error) {
        console.error('❌ Erreur envoi audio:', error);
        setIsTranscribing(false);
        showToast('error', 'Erreur d\'envoi audio');
      }
    }
  };

  // Fonctions pour l'éditeur WYSIWYG
  const applyFormatting = (command: string, value?: string) => {
    // S'assurer que l'éditeur a le focus
    if (editorRef.current) {
      editorRef.current.focus();
    }
    
    // Obtenir la sélection actuelle
    const selection = window.getSelection();
    
    // Si pas de texte sélectionné, montrer un message
    if (!selection || selection.toString().length === 0) {
      showToast('warning', '⚠️ Sélectionnez du texte d\'abord');
      return;
    }
    
    // Appliquer la commande
    try {
      document.execCommand(command, false, value);
    } catch (error) {
      console.error('Erreur lors de l\'application du formatage:', error);
      showToast('error', '❌ Erreur lors du formatage');
    }
  };

  // Fonction pour convertir markdown en HTML
  const markdownToHtml = (markdown: string): string => {
    let html = markdown;
    
    // Titres (gérer tous les niveaux de # à ######)
    html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Gras et italique
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Listes à puces
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Listes numérotées
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    
    // Retours à la ligne
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    
    // Envelopper dans des paragraphes si pas déjà fait
    if (!html.startsWith('<')) {
      html = `<p>${html}</p>`;
    }
    
    return html;
  };

  const insertTable = () => {
    if (!editorRef.current) return;
    
    // Créer le HTML du tableau simplifié (sans redimensionnement UI)
    let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #333;">';
    
    for (let i = 0; i < tableRows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < tableCols; j++) {
        const tag = i === 0 ? 'th' : 'td';
        tableHTML += `<${tag} style="border: 1px solid #333; padding: 8px; text-align: left; ${i === 0 ? 'background-color: #f2f2f2; font-weight: bold;' : ''}">`;
        tableHTML += i === 0 ? `Colonne ${j + 1}` : '&nbsp;';
        tableHTML += `</${tag}>`;
      }
      tableHTML += '</tr>';
    }
    
    tableHTML += '</table><p><br></p>'; // Ajouter un paragraphe après le tableau
    
    // Insérer le tableau en mettant le focus d'abord
    editorRef.current.focus();
    
    // Utiliser insertHTML avec focus
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const fragment = range.createContextualFragment(tableHTML);
      range.insertNode(fragment);
      
      // Déplacer le curseur après le tableau
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    setShowTableModal(false);
    showToast('success', '✅ Tableau inséré');
  };

  // Fonction pour insérer une image dans l'éditeur
  const insertImage = (file: File) => {
    if (!editorRef.current) return;
    
    // Vérifier que c'est bien une image
    if (!file.type.startsWith('image/')) {
      showToast('error', '❌ Le fichier doit être une image');
      return;
    }
    
    // Convertir l'image en base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      
      // Insérer l'image dans l'éditeur
      editorRef.current?.focus();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Créer l'élément image avec styles
        const imgHTML = `<img src="${imageUrl}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" alt="Image insérée" />`;
        const fragment = range.createContextualFragment(imgHTML);
        range.insertNode(fragment);
        
        // Déplacer le curseur après l'image
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      showToast('success', '✅ Image insérée');
    };
    
    reader.onerror = () => {
      showToast('error', '❌ Erreur lors de la lecture de l\'image');
    };
    
    reader.readAsDataURL(file);
  };

  const addNewPage = () => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    // Compter le nombre de pages existantes
    const pageBreaks = editorRef.current.querySelectorAll('.page-break');
    const nextPageNumber = pageBreaks.length + 2;
    
    // Créer un élément div pour le saut de page avec style professionnel
    const pageBreak = document.createElement('div');
    pageBreak.className = 'page-break';
    pageBreak.contentEditable = 'false';
    pageBreak.style.pageBreakAfter = 'always';
    pageBreak.textContent = `📄 Page ${nextPageNumber}`;
    
    // Créer un paragraphe vide après le saut de page pour continuer à écrire
    const newParagraph = document.createElement('p');
    newParagraph.innerHTML = '<br>';
    
    // Insérer les éléments à la position du curseur
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.insertNode(newParagraph);
      range.insertNode(pageBreak);
      
      // Placer le curseur dans le nouveau paragraphe
      range.setStart(newParagraph, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Scroll automatiquement vers la nouvelle page
      setTimeout(() => {
        const scrollContainer = editorRef.current?.parentElement;
        if (scrollContainer && pageBreak) {
          const pageBreakRect = pageBreak.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();
          const scrollTop = scrollContainer.scrollTop;
          const targetScroll = scrollTop + (pageBreakRect.top - containerRect.top) - (containerRect.height / 2);
          
          scrollContainer.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          });
        }
        
        setTimeout(() => {
          newParagraph.focus();
          const sel = window.getSelection();
          const rng = document.createRange();
          rng.selectNodeContents(newParagraph);
          rng.collapse(false);
          sel?.removeAllRanges();
          sel?.addRange(rng);
        }, 400);
      }, 100);
    } else {
      // Si pas de sélection, ajouter à la fin
      editorRef.current.appendChild(pageBreak);
      editorRef.current.appendChild(newParagraph);
      
      // Scroll automatiquement vers la fin
      setTimeout(() => {
        const scrollContainer = editorRef.current?.parentElement;
        if (scrollContainer && pageBreak) {
          const pageBreakRect = pageBreak.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();
          const scrollTop = scrollContainer.scrollTop;
          const targetScroll = scrollTop + (pageBreakRect.top - containerRect.top) - (containerRect.height / 2);
          
          scrollContainer.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          });
        }
        
        setTimeout(() => {
          newParagraph.focus();
          const sel = window.getSelection();
          const rng = document.createRange();
          rng.selectNodeContents(newParagraph);
          rng.collapse(false);
          sel?.removeAllRanges();
          sel?.addRange(rng);
        }, 400);
      }, 100);
    }
    
    showToast('success', `📄 Page ${nextPageNumber} ajoutée`);
  };

  // Fonction pour effacer complètement l'éditeur
  const clearEditor = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '<p><br></p>';
      setSelectedText('');
      setShowAIMenu(false);
      setCustomAIPrompt('');
    }
  };

  // Fonction pour ajouter à l'historique
  const addToHistory = () => {
    if (editorRef.current) {
      // Supprimer tout ce qui vient après l'index actuel
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      
      // Ajouter le nouvel état
      historyRef.current.push(editorRef.current.innerHTML);
      historyIndexRef.current++;
      
      // Limiter la taille de l'historique à 50 entrées
      if (historyRef.current.length > 50) {
        historyRef.current.shift();
        historyIndexRef.current--;
      }
    }
  };

  // Fonction Undo
  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      if (editorRef.current) {
        editorRef.current.innerHTML = historyRef.current[historyIndexRef.current];
        showToast('info', '↶ Undo');
      }
    }
  };

  // Fonction Redo
  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      if (editorRef.current) {
        editorRef.current.innerHTML = historyRef.current[historyIndexRef.current];
        showToast('info', '↷ Redo');
      }
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString() || '';
    
    if (text && text.trim().length > 0) {
      setSelectedText(text);
      setCustomAIPrompt(''); // Réinitialiser le champ custom à chaque nouvelle sélection
      
      // IMPORTANT: Sauvegarder le range dans un Ref pour le conserver
      if (selection && selection.rangeCount > 0) {
        savedAIRangeRef.current = selection.getRangeAt(0).cloneRange();
      }
      
      // Obtenir la position de la sélection
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();
      
      if (rect) {
        // Ajuster la position pour que le menu reste dans l'écran
        const menuWidth = 450; // Largeur estimée du menu
        const menuHeight = 400; // Hauteur estimée du menu
        
        let x = rect.left + rect.width / 2;
        let y = rect.top - 10;
        
        // Vérifier les bords horizontaux
        if (x + menuWidth / 2 > window.innerWidth) {
          x = window.innerWidth - menuWidth / 2 - 20;
        }
        if (x - menuWidth / 2 < 0) {
          x = menuWidth / 2 + 20;
        }
        
        // Vérifier les bords verticaux
        if (y - menuHeight < 0) {
          // Si pas assez d'espace en haut, afficher en dessous
          y = rect.bottom + 10;
        }
        
        setAiMenuPosition({ x, y });
        setShowAIMenu(true);
      }
    } else {
      setShowAIMenu(false);
      setCustomAIPrompt(''); // Réinitialiser aussi quand on désélectionne
    }
  };

  const handleAICommand = async (command: string) => {
    if (!selectedText) return;
    
    setShowAIMenu(false);
    setIsGenerating(true);
    
    let prompt = '';
    
    switch (command) {
      case 'improve':
        prompt = `Améliore ce texte en le rendant plus clair et professionnel :\n\n"${selectedText}"`;
        break;
      case 'shorter':
        prompt = `Rends ce texte plus concis tout en gardant l'essentiel :\n\n"${selectedText}"`;
        break;
      case 'longer':
        prompt = `Développe et enrichis ce texte avec plus de détails :\n\n"${selectedText}"`;
        break;
      case 'simplify':
        prompt = `Simplifie ce texte pour le rendre plus accessible :\n\n"${selectedText}"`;
        break;
      case 'professional':
        prompt = `Reformule ce texte dans un ton plus professionnel :\n\n"${selectedText}"`;
        break;
      case 'casual':
        prompt = `Reformule ce texte dans un ton plus décontracté :\n\n"${selectedText}"`;
        break;
      case 'fix':
        prompt = `Corrige l'orthographe et la grammaire de ce texte :\n\n"${selectedText}"`;
        break;
      case 'translate-en':
        prompt = `Traduis ce texte en anglais :\n\n"${selectedText}"`;
        break;
      case 'translate-fr':
        prompt = `Traduis ce texte en français :\n\n"${selectedText}"`;
        break;
      case 'continue':
        prompt = `Continue ce texte de manière cohérente :\n\n"${selectedText}"`;
        break;
      case 'custom':
        // Commande personnalisée
        if (!customAIPrompt.trim()) return;
        prompt = `${customAIPrompt}\n\nTexte à traiter :\n\n"${selectedText}"`;
        break;
      default:
        return;
    }
    
    setIsProcessingAI(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject?.id,
          chapterId: selectedChapter?.id,
          message: prompt,
          images: [],
          files: []
        })
      });
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';
      
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                aiResponse += parsed.content;
              }
            } catch (e) {}
          }
        }
      }
      
      // Remplacer le texte sélectionné par la réponse de l'IA
      if (aiResponse && savedAIRangeRef.current) {
        // Convertir le markdown en HTML
        const htmlContent = markdownToHtml(aiResponse);
        
        // Déterminer si c'est une commande d'insertion ou de remplacement
        const isInsertionCommand = command === 'custom' && 
          (customAIPrompt.toLowerCase().includes('ajoute') ||
           customAIPrompt.toLowerCase().includes('crée') ||
           customAIPrompt.toLowerCase().includes('ajouter') ||
           customAIPrompt.toLowerCase().includes('créer') ||
           customAIPrompt.toLowerCase().includes('insère') ||
           customAIPrompt.toLowerCase().includes('insérer') ||
           customAIPrompt.toLowerCase().includes('génère') ||
           customAIPrompt.toLowerCase().includes('générer'));
        
        // Restaurer le focus à l'éditeur AVANT de modifier
        if (editorRef.current) {
          editorRef.current.focus();
        }
        
        if (isInsertionCommand) {
          // Mode INSERTION : insérer AVANT le texte sélectionné sans le supprimer
          const fragment = savedAIRangeRef.current.createContextualFragment(htmlContent);
          savedAIRangeRef.current.insertNode(fragment);
          
          // Ajouter un saut de ligne après le contenu inséré
          const brElement = document.createElement('br');
          savedAIRangeRef.current.insertNode(brElement);
          
          // Repositionner après le contenu inséré
          savedAIRangeRef.current.collapse(false);
        } else {
          // Mode REMPLACEMENT : supprimer et remplacer le texte sélectionné
          savedAIRangeRef.current.deleteContents();
          const fragment = savedAIRangeRef.current.createContextualFragment(htmlContent);
          savedAIRangeRef.current.insertNode(fragment);
          savedAIRangeRef.current.collapse(false);
        }
        
        // Restaurer la sélection
        const newSelection = window.getSelection();
        if (newSelection) {
          newSelection.removeAllRanges();
          newSelection.addRange(savedAIRangeRef.current);
        }
        
        // Nettoyer le range sauvegardé
        savedAIRangeRef.current = null;
        
        showToast('success', '✨ Texte modifié par l\'IA');
      } else if (!savedAIRangeRef.current) {
        showToast('error', 'Veuillez sélectionner du texte avant d\'utiliser l\'IA');
      }
      
    } catch (error) {
      console.error('Erreur IA:', error);
      showToast('error', 'Erreur lors de la modification');
    } finally {
      setIsGenerating(false);
      setIsProcessingAI(false);
      setCustomAIPrompt(''); // Réinitialiser le prompt personnalisé
    }
  };

  // Fonction pour exporter le contenu de l'éditeur
  const exportEditorContent = (format: 'pdf' | 'docx' | 'html' | 'txt') => {
    const content = editorRef.current?.innerHTML || '';
    const textContent = editorRef.current?.innerText || '';
    
    switch (format) {
      case 'html':
        const htmlBlob = new Blob([content], { type: 'text/html' });
        const htmlUrl = URL.createObjectURL(htmlBlob);
        const htmlLink = document.createElement('a');
        htmlLink.href = htmlUrl;
        htmlLink.download = `document-${Date.now()}.html`;
        htmlLink.click();
        showToast('success', '📄 Exporté en HTML');
        break;
        
      case 'txt':
        const txtBlob = new Blob([textContent], { type: 'text/plain' });
        const txtUrl = URL.createObjectURL(txtBlob);
        const txtLink = document.createElement('a');
        txtLink.href = txtUrl;
        txtLink.download = `document-${Date.now()}.txt`;
        txtLink.click();
        showToast('success', '📄 Exporté en TXT');
        break;
        
      case 'pdf':
        // Export PDF professionnel avec respect strict des dimensions A4
        const pdf = new jsPDF({
          unit: 'mm',
          format: 'a4',
          compress: true
        });
        
        const pageWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const margin = 15;
        const contentWidth = pageWidth - 2 * margin;
        const maxYContent = pageHeight - margin; // Zone de contenu max
        
        // Analyser le HTML pour extraire le formatage
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        let yPosition = margin;
        let currentPageNumber = 1;
        
        // Fonction pour ajouter une nouvelle page
        const addNewPDFPage = () => {
          pdf.addPage();
          yPosition = margin;
          currentPageNumber++;
        };
        
        // Fonction pour nettoyer le markdown brut du texte
        const cleanMarkdown = (text: string): string => {
          text = text.replace(/^#+\s+/gm, '');
          text = text.replace(/^[-*+]\s+/gm, '');
          text = text.replace(/^\d+\.\s+/gm, '');
          return text.trim();
        };
        
        // Fonction pour obtenir le texte pur d'un élément
        const getCleanText = (element: Element): string => {
          // Si c'est un élément page-break, ignorer complètement
          if (element.className && element.className.includes('page-break')) {
            return '';
          }
          
          let text = '';
          for (let i = 0; i < element.childNodes.length; i++) {
            const node = element.childNodes[i];
            if (node.nodeType === Node.TEXT_NODE) {
              const nodeText = node.textContent || '';
              // Ignorer les marqueurs de saut de page
              if (!nodeText.includes('📄 Page') && 
                  !nodeText.includes('--- Saut de page ---')) {
                text += nodeText;
              }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const child = node as Element;
              // Ignorer complètement les éléments page-break
              if (child.className && (
                  child.className.includes('hidden') || 
                  child.className.includes('toolbar') ||
                  child.className.includes('page-break'))) {
                continue;
              }
              text += getCleanText(child);
            }
          }
          return cleanMarkdown(text).trim();
        };
        
        // Fonction pour calculer la hauteur requise d'un élément
        const calculateElementHeight = (element: Element): number => {
          const tagName = element.tagName.toLowerCase();
          
          if (tagName === 'img') {
            return 60; // Hauteur estimée pour images
          }
          
          if (tagName === 'table') {
            const rows = element.querySelectorAll('tr');
            return rows.length * 15 + 10; // Estimation hauteur tableau
          }
          
          const text = getCleanText(element);
          if (!text) return 0;
          
          let fontSize = 11;
          if (tagName === 'h1') fontSize = 22;
          else if (tagName === 'h2') fontSize = 18;
          else if (tagName === 'h3') fontSize = 16;
          else if (tagName === 'h4') fontSize = 14;
          else if (tagName === 'h5') fontSize = 12;
          else if (tagName === 'h6') fontSize = 11;
          
          pdf.setFontSize(fontSize);
          const lines = pdf.splitTextToSize(text, contentWidth);
          const lineHeight = fontSize * 0.35 + 2;
          
          return lines.length * lineHeight + 5;
        };
        
        // Parcourir tous les éléments et les ajouter au PDF
        const processElements = (container: Element) => {
          const children = container.children;
          
          for (let i = 0; i < children.length; i++) {
            const element = children[i];
            const tagName = element.tagName.toLowerCase();
            
            // IMPORTANT : Détecter les sauts de page et créer une nouvelle page PDF
            if (element.className.includes('page-break')) {
              console.log('🔄 Saut de page détecté → Nouvelle page PDF');
              addNewPDFPage();
              continue; // Ne pas traiter ce div, juste créer une nouvelle page
            }
            
            // Ignorer les éléments de UI
            if (element.className.includes('toolbar') || 
                element.className.includes('hidden')) {
              continue;
            }
            
            // TRAITER LES IMAGES
            if (tagName === 'img') {
              const imgElement = element as HTMLImageElement;
              const imgHeight = 50;
              const imgWidth = contentWidth;
              
              // Vérifier l'espace disponible
              if (yPosition + imgHeight > maxYContent) {
                addNewPDFPage();
              }
              
              try {
                pdf.addImage(imgElement.src, 'PNG', margin, yPosition, imgWidth, imgHeight);
                yPosition += imgHeight + 5;
              } catch (e) {
                console.error('Erreur insertion image:', e);
              }
              continue;
            }
            
            // TRAITER LES TABLEAUX
            if (tagName === 'table') {
              const rows = element.querySelectorAll('tr');
              if (rows.length === 0) continue;
              
              // Vérifier l'espace initial
              if (yPosition + 20 > maxYContent) {
                addNewPDFPage();
              }
              
              const cells = rows[0].querySelectorAll('td, th');
              const colCount = cells.length;
              const cellWidth = contentWidth / colCount;
              
              pdf.setFontSize(10);
              
              rows.forEach((row, rowIdx) => {
                const rowCells = row.querySelectorAll('td, th');
                let rowHeight = 10;
                
                // Calculer la hauteur max de la ligne
                rowCells.forEach(cell => {
                  let cellText = '';
                  for (let j = 0; j < cell.childNodes.length; j++) {
                    const node = cell.childNodes[j];
                    if (node.nodeType === Node.TEXT_NODE) {
                      cellText += (node.textContent || '').trim();
                    }
                  }
                  const lines = pdf.splitTextToSize(cellText, cellWidth - 2);
                  rowHeight = Math.max(rowHeight, lines.length * 4 + 4);
                });
                
                // Vérifier l'espace pour cette ligne
                if (yPosition + rowHeight > maxYContent) {
                  addNewPDFPage();
                }
                
                // Dessiner les cellules
                const isHeaderRow = row.querySelector('th') !== null;
                let cellX = margin;
                
                rowCells.forEach((cell, colIdx) => {
                  let cellText = '';
                  for (let j = 0; j < cell.childNodes.length; j++) {
                    const node = cell.childNodes[j];
                    if (node.nodeType === Node.TEXT_NODE) {
                      cellText += (node.textContent || '').trim();
                    }
                  }
                  
                  // Dessiner le rectangle
                  pdf.setDrawColor(100);
                  pdf.rect(cellX, yPosition, cellWidth, rowHeight);
                  
                  // Remplir en-têtes
                  if (isHeaderRow) {
                    pdf.setFillColor(220, 220, 220);
                    pdf.rect(cellX, yPosition, cellWidth, rowHeight, 'F');
                    pdf.setFont('helvetica', 'bold');
                  } else {
                    pdf.setFont('helvetica', 'normal');
                  }
                  
                  // Écrire le texte
                  const lines = pdf.splitTextToSize(cellText, cellWidth - 2);
                  let textY = yPosition + 2;
                  lines.forEach((line: string) => {
                    pdf.text(line, cellX + 1, textY);
                    textY += 4;
                  });
                  
                  cellX += cellWidth;
                });
                
                yPosition += rowHeight;
              });
              
              yPosition += 5; // Espacement après tableau
              continue;
            }
            
            // TRAITER LE TEXTE
            // Extraire le texte ET détecter si l'élément contient du bold/italic
            let hasStrongChild = false;
            let hasEmChild = false;
            
            const checkForStyles = (el: Element) => {
              if (el.querySelector('strong, b')) hasStrongChild = true;
              if (el.querySelector('em, i')) hasEmChild = true;
            };
            checkForStyles(element);
            
            const text = getCleanText(element);
            if (!text || text.length === 0) continue;
            
            // Déterminer le style selon le tag
            let fontSize = 11;
            let isBold = false;
            let isItalic = false;
            let spacing = 4;
            
            if (tagName === 'h1') { fontSize = 22; isBold = true; spacing = 8; }
            else if (tagName === 'h2') { fontSize = 18; isBold = true; spacing = 6; }
            else if (tagName === 'h3') { fontSize = 16; isBold = true; spacing = 5; }
            else if (tagName === 'h4') { fontSize = 14; isBold = true; spacing = 4; }
            else if (tagName === 'h5') { fontSize = 12; isBold = true; spacing = 4; }
            else if (tagName === 'h6') { fontSize = 11; isBold = true; spacing = 3; }
            else if (tagName === 'li') { spacing = 3; }
            else if (tagName === 'strong' || tagName === 'b') { isBold = true; }
            else if (tagName === 'em' || tagName === 'i') { isItalic = true; }
            
            // Si le paragraphe contient des strong/em, traiter mot par mot
            if ((tagName === 'p' || tagName === 'div') && (hasStrongChild || hasEmChild)) {
              pdf.setFontSize(fontSize);
              const lineHeight = fontSize * 0.35 + 2;
              const xPos = margin;
              
              // Fonction récursive pour traiter chaque nœud
              const renderNode = (node: Node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                  const textContent = cleanMarkdown(node.textContent || '');
                  if (!textContent) return;
                  
                  // Déterminer le style en remontant la hiérarchie des parents
                  let fontStyle: 'normal' | 'bold' | 'italic' | 'bolditalic' = 'normal';
                  let currentElement = node.parentElement;
                  let isBold = false;
                  let isItalic = false;
                  
                  // Remonter jusqu'à trouver un style ou atteindre l'élément racine
                  while (currentElement && currentElement !== element) {
                    const tagName = currentElement.tagName;
                    const styles = window.getComputedStyle(currentElement);
                    
                    // Vérifier le gras
                    if (tagName === 'STRONG' || 
                        tagName === 'B' || 
                        styles.fontWeight === 'bold' || 
                        styles.fontWeight === '700' ||
                        styles.fontWeight === '600') {
                      isBold = true;
                    }
                    
                    // Vérifier l'italique
                    if (tagName === 'EM' || 
                        tagName === 'I' || 
                        styles.fontStyle === 'italic') {
                      isItalic = true;
                    }
                    
                    currentElement = currentElement.parentElement;
                  }
                  
                  // Déterminer le style final
                  if (isBold && isItalic) {
                    fontStyle = 'bolditalic';
                  } else if (isBold) {
                    fontStyle = 'bold';
                  } else if (isItalic) {
                    fontStyle = 'italic';
                  }
                  
                  pdf.setFont('helvetica', fontStyle);
                  
                  // Ajouter le texte ligne par ligne avec vérification de page
                  const lines = pdf.splitTextToSize(textContent, contentWidth);
                  lines.forEach((line: string) => {
                    // Vérifier AVANT d'écrire chaque ligne si on dépasse
                    if (yPosition + lineHeight > maxYContent) {
                      addNewPDFPage();
                      // Après addNewPDFPage, yPosition est réinitialisé à marginTop
                    }
                    pdf.text(line, xPos, yPosition);
                    yPosition += lineHeight;
                  });
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                  const elem = node as Element;
                  if (elem.classList.contains('page-break')) return;
                  
                  // Traiter récursivement les enfants
                  elem.childNodes.forEach(child => renderNode(child));
                }
              };
              
              // Traiter tous les enfants de l'élément
              element.childNodes.forEach(child => renderNode(child));
              yPosition += spacing;
            } else {
              // Traitement simple pour les éléments sans styles mixtes
              pdf.setFontSize(fontSize);
              
              let fontStyle = 'normal';
              if (isBold) fontStyle = 'bold';
              else if (isItalic) fontStyle = 'italic';
              
              pdf.setFont('helvetica', fontStyle);
              
              // Découper le texte et l'ajouter au PDF
              const lines = pdf.splitTextToSize(text, contentWidth);
              const lineHeight = fontSize * 0.35 + 2;
              
              lines.forEach((line: string) => {
                // Vérifier l'espace AVANT d'ajouter chaque ligne
                if (yPosition + lineHeight > maxYContent) {
                  addNewPDFPage();
                }
                
                const xPos = tagName === 'li' ? margin + 5 : margin;
                pdf.text(line, xPos, yPosition);
                yPosition += lineHeight;
              });
              
              // Espacement après l'élément
              yPosition += spacing;
            }
          }
        };
        
        // Traiter tous les éléments du contenu
        processElements(tempDiv);
        
        pdf.save(`document-${Date.now()}.pdf`);
        showToast('success', '📄 Exporté en PDF - Pages A4 respectées');
        break;
        
      case 'docx':
        // Utiliser docx pour générer le DOCX
        const doc = new Document({
          sections: [{
            properties: {},
            children: textContent.split('\n').map(line => 
              new Paragraph({
                children: [new TextRun(line)]
              })
            )
          }]
        });
        
        Packer.toBlob(doc).then(blob => {
          const docxUrl = URL.createObjectURL(blob);
          const docxLink = document.createElement('a');
          docxLink.href = docxUrl;
          docxLink.download = `document-${Date.now()}.docx`;
          docxLink.click();
          showToast('success', '📄 Exporté en DOCX');
        });
        break;
    }
  };

  const loadProjects = async () => {
    try {
      const userId = getUserId();
      const res = await fetch('/api/projects', {
        headers: {
          'x-user-id': userId
        }
      });
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const loadGallery = async (projectId?: number) => {
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      
      // Filtrer par projet si un projectId est fourni
      if (projectId) {
        const filteredData = data.filter((item: any) => item.projectId === projectId);
        setGalleryImages(filteredData);
      } else {
        setGalleryImages(data);
      }
    } catch (error) {
      console.error('Erreur chargement galerie:', error);
    }
  };

  const loadChapters = async (projectId: number) => {
    try {
      const res = await fetch(`/api/chapters?projectId=${projectId}`);
      const data = await res.json();
      setChapters(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const loadConversations = async (projectId: number) => {
    try {
      const res = await fetch(`/api/chat?projectId=${projectId}`);
      const data = await res.json();
      if (data && data.length > 0) {
        // Reconstruire les messages depuis les conversations
        const loadedMessages: Message[] = [];
        data.forEach((conv: any) => {
          const message: Message = {
            id: conv.id, // Inclure l'ID de la BDD
            role: conv.role as 'user' | 'assistant',
            content: conv.content
          };
          
          // Charger les images si elles existent
          if (conv.images) {
            try {
              message.images = JSON.parse(conv.images);
            } catch (e) {
              console.error('Erreur parse images:', e);
            }
          }
          
          loadedMessages.push(message);
        });
        setMessages(loadedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      setMessages([]);
    }
  };

  const createNewProject = async (title: string, description: string, projectType: ProjectType = 'chatbot') => {
    try {
      const userId = getUserId();
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ title, description, projectType }),
      });
      const newProject = await res.json();
      setProjects([...projects, newProject]);
      setSelectedProject(newProject);
      setShowNewProjectModal(false);
      showToast('success', `✅ Projet "${title}" créé avec succès !`);
    } catch (error) {
      console.error('Erreur:', error);
      showToast('error', '❌ Erreur lors de la création du projet');
    }
  };

  const deleteProject = async (projectId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la sélection du projet
    
    showConfirm(
      '🗑️ Supprimer le projet',
      'Êtes-vous sûr de vouloir supprimer ce projet et tous ses chapitres ? Cette action est irréversible.',
      async () => {
        try {
          await fetch(`/api/projects?id=${projectId}`, {
            method: 'DELETE',
          });
          
          setProjects(projects.filter(p => p.id !== projectId));
          if (selectedProject?.id === projectId) {
            setSelectedProject(null);
            setChapters([]);
            setMessages([]);
          }
          showToast('success', '✅ Projet supprimé avec succès');
        } catch (error) {
          console.error('Erreur:', error);
          showToast('error', '❌ Erreur lors de la suppression du projet');
        }
      },
      'danger',
      'Supprimer',
      'Annuler'
    );
  };

  const updateProjectName = async (projectId: number, newTitle: string) => {
    try {
      await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, title: newTitle }),
      });
      
      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, title: newTitle } : p
      ));
      
      if (selectedProject?.id === projectId) {
        setSelectedProject({ ...selectedProject, title: newTitle });
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const startEditProjectName = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = await showInput(
      '✏️ Renommer le projet',
      'Entrez le nouveau nom du projet',
      project.title,
      'Nom du projet...',
      '✏️',
      'Renommer',
      'Annuler'
    );
    
    if (newName && newName.trim() !== '') {
      updateProjectName(project.id, newName.trim());
      showToast('success', '✅ Projet renommé avec succès');
    }
  };

  const createNewChapter = async (title: string) => {
    if (!selectedProject) return;
    
    try {
      const orderIndex = chapters.length + 1;
      const res = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          title,
          orderIndex,
        }),
      });
      await loadChapters(selectedProject.id);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string);
            if (newImages.length === files.length) {
              setUploadedImages([...uploadedImages, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Fonction pour gérer le collage d'images
  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    let hasImages = false;
    const newImages: string[] = [];
    let processedCount = 0;
    let totalImages = 0;
    
    // Compter d'abord le nombre d'images
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        totalImages++;
      }
    }
    
    if (totalImages === 0) return; // Pas d'images, laisser le comportement par défaut
    
    e.preventDefault(); // Empêcher le collage du texte par défaut seulement si on a des images
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Vérifier si c'est une image
      if (item.type.startsWith('image/')) {
        hasImages = true;
        const file = item.getAsFile();
        
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              newImages.push(event.target.result as string);
              processedCount++;
              
              // Mettre à jour seulement quand toutes les images sont traitées
              if (processedCount === totalImages) {
                setUploadedImages(prev => [...prev, ...newImages]);
                const message = totalImages === 1 
                  ? '📷 Image collée avec succès !' 
                  : `📷 ${totalImages} images collées avec succès !`;
                showToast('success', message);
              }
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  // Fonction pour gérer l'upload de fichiers PDF et autres documents
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: {name: string, type: string, content: string}[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = file.type;
      
      // Gérer les PDFs
      if (fileType === 'application/pdf') {
        showToast('info', `📄 Extraction du texte du PDF "${file.name}" en cours...`);
        
        try {
          // Créer un FormData pour envoyer le PDF à l'API
          const formData = new FormData();
          formData.append('file', file);
          
          // Appeler l'API pour extraire le texte
          const response = await fetch('/api/parse-pdf', {
            method: 'POST',
            body: formData
          });
          
          const result = await response.json();
          
          if (result.success && result.text) {
            // Vérifier si le texte extrait est de mauvaise qualité (trop de caractères bizarres)
            const strangeCharsRatio = (result.text.match(/[^\w\sàâäéèêëïîôùûçÀÂÄÉÈÊËÏÎÔÙÛÇ€%.,;:!?()\-'"]/g) || []).length / result.text.length;
            
            if (strangeCharsRatio > 0.3 || result.text.trim().length < 100) {
              // Extraction de mauvaise qualité
              const pdfInfo = `📄 DOCUMENT PDF: ${file.name}
Taille: ${Math.round(file.size / 1024)} KB
Nombre de pages: ${result.numPages}

⚠️ **ATTENTION**: Ce PDF utilise des polices personnalisées qui rendent l'extraction de texte impossible.

**Solutions possibles:**
1. Convertir le PDF en format texte standard (File > Export as Text depuis un lecteur PDF)
2. Utiliser un service OCR en ligne (si c'est un PDF scanné)
3. Copier-coller manuellement le texte depuis le PDF

**Ce que je peux faire:**
- Répondre à des questions générales sur le marketing digital
- T'aider à reformuler du contenu que tu me fournis
- Créer du contenu similaire si tu me décris le sujet

Désolé pour ce désagrément ! Les PDFs avec polices personnalisées sont très difficiles à lire automatiquement. 😔`;
              
              newFiles.push({
                name: file.name,
                type: 'pdf',
                content: pdfInfo
              });
              setUploadedFiles(prev => [...prev, ...newFiles]);
              showToast('warning', `⚠️ PDF "${file.name}": Extraction impossible (polices personnalisées)`);
            } else {
              // Texte extrait avec succès
              const pdfContent = `📄 DOCUMENT PDF: ${file.name}
Taille: ${Math.round(file.size / 1024)} KB
Nombre de pages: ${result.numPages}

══════════════════════════════════════════════════════════════
CONTENU COMPLET DU PDF:
══════════════════════════════════════════════════════════════

${result.text}

══════════════════════════════════════════════════════════════

Ce document PDF a été analysé et son contenu textuel complet est ci-dessus. L'utilisateur veut que tu l'analyses. Réponds directement à sa question concernant ce document.`;
              
              newFiles.push({
                name: file.name,
                type: 'pdf',
                content: pdfContent
              });
              setUploadedFiles(prev => [...prev, ...newFiles]);
              showToast('success', `✅ PDF "${file.name}" lu avec succès ! ${result.numPages} page(s) extraite(s).`);
            }
          } else {
            // Échec de l'extraction, fallback sur les métadonnées
            const pdfInfo = `📄 DOCUMENT PDF: ${file.name}\nTaille: ${Math.round(file.size / 1024)} KB\n\n⚠️ Le texte n'a pas pu être extrait de ce PDF. Il pourrait s'agir d'un PDF image, protégé, ou avec des polices personnalisées.`;
            
            newFiles.push({
              name: file.name,
              type: 'pdf',
              content: pdfInfo
            });
            setUploadedFiles(prev => [...prev, ...newFiles]);
            showToast('warning', `⚠️ PDF "${file.name}" ajouté mais le texte n'a pas pu être extrait.`);
          }
        } catch (error) {
          console.error('Erreur extraction PDF:', error);
          showToast('error', `❌ Erreur lors de l'extraction du PDF`);
        }
      }
      // Gérer les fichiers texte
      else if (fileType === 'text/plain' || fileType === 'text/markdown' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newFiles.push({
              name: file.name,
              type: 'text',
              content: event.target.result as string
            });
            setUploadedFiles(prev => [...prev, ...newFiles]);
            showToast('success', `📝 Fichier "${file.name}" lu avec succès !`);
          }
        };
        reader.readAsText(file);
      }
      // Images (utiliser la fonction existante)
      else if (fileType.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && event.target.result) {
            setUploadedImages(prev => [...prev, event.target!.result as string]);
            showToast('success', `🖼️ Image "${file.name}" ajoutée !`);
          }
        };
        reader.readAsDataURL(file);
      }
      else {
        showToast('warning', `⚠️ Type de fichier non supporté: ${file.name}`);
      }
    }
    
    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const deleteMessage = async (index: number) => {
    const messageToDelete = messages[index];
    
    showConfirm(
      '🗑️ Supprimer le message',
      'Êtes-vous sûr de vouloir supprimer ce message ?',
      async () => {
        // Supprimer de l'interface
        setMessages(messages.filter((_, i) => i !== index));
        
        // Supprimer de la BDD si le message a un ID
        if (messageToDelete.id) {
          try {
            await fetch(`/api/delete-message?id=${messageToDelete.id}`, {
              method: 'DELETE',
            });
            showToast('success', '✅ Message supprimé définitivement');
          } catch (error) {
            console.error('Erreur suppression BDD:', error);
            showToast('warning', '⚠️ Message supprimé de l\'interface uniquement');
          }
        } else {
          showToast('success', '✅ Message supprimé');
        }
      },
      'danger',
      'Supprimer',
      'Annuler'
    );
  };

  const startEditMessage = (index: number) => {
    setEditingMessageIndex(index);
    setEditedContent(messages[index].content);
  };

  const adjustTextareaHeight = () => {
    if (editTextareaRef.current) {
      // Réinitialiser d'abord pour obtenir la vraie hauteur
      editTextareaRef.current.style.height = 'auto';
      // Calculer la nouvelle hauteur basée sur le scrollHeight
      const newHeight = Math.max(60, editTextareaRef.current.scrollHeight);
      editTextareaRef.current.style.height = `${newHeight}px`;
    }
  };

  // UseEffect pour ajuster la hauteur du textarea quand on entre en mode édition
  useEffect(() => {
    if (editingMessageIndex !== null && editTextareaRef.current) {
      // Attendre que le DOM soit complètement mis à jour
      requestAnimationFrame(() => {
        adjustTextareaHeight();
        
        // Double vérification après un court délai
        setTimeout(() => {
          adjustTextareaHeight();
        }, 50);
      });
    }
  }, [editingMessageIndex]);

  const saveEditMessage = async () => {
    if (editingMessageIndex !== null) {
      const updatedMessages = [...messages];
      const editedMessage = updatedMessages[editingMessageIndex];
      editedMessage.content = editedContent;
      setMessages(updatedMessages);
      setEditingMessageIndex(null);
      setEditedContent('');
      
      // Si c'était un message utilisateur de demande d'image, on régénère
      if (editedMessage.role === 'user') {
        const imageGenerationPatterns = [
          /g[eé]n[eè]re[-\s]*(moi|nous)?\s*(une?)?\s*image/i,
          /cr[eé][eé][-\s]*(moi|nous)?\s*(une?)?\s*image/i,
          /fais[-\s]*(moi|nous)?\s*(une?)?\s*image/i,
          /dessine[-\s]*(moi|nous)?/i,
          /illustr(e|ation)/i,
          /produis[-\s]*(une?)?\s*image/i
        ];
        
        const imageModificationPatterns = [
          /^(je veux|j'aimerais) qu(e|')il (porte|ait|soit)/i,
          /^habille[-\s]*(le|la|lui)?/i,
          /^donne[-\s]*(lui|y)?/i,
          /^ajoute[-\s]*(lui|y|ses)?\s*(un|une|des|le|la|les)?/i,
          /^mets[-\s]*(le|la|lui)?\s+(dans|sur|à|en|au|aux|un|une|des)/i, // Changement de lieu ET vêtement
          /^enlève[-\s]*(lui|y)?/i,
          /^retire[-\s]*(lui|y)?/i,
          /^remplace[-\s]/i,
          /^avec (un|une|des)/i,
          /^modifie[-\s]/i,
          /^change[-\s]/i,
          /^mais avec/i,
          /^plutôt avec/i,
          /^refais[-\s]*(le|la|les)?(\s+avec)?/i,
        ];
        
        const isDirectImageRequest = imageGenerationPatterns.some(pattern => pattern.test(editedContent));
        const isModificationRequest = imageModificationPatterns.some(pattern => pattern.test(editedContent));
        
        if (isDirectImageRequest || isModificationRequest) {
          // Régénérer l'image avec le nouveau contenu
          showToast('info', '🎨 Régénération de l\'image...');
          
          // Extraire le prompt avec la même logique que handleSend
          let imagePromptExtracted = '';
          
          if (isModificationRequest) {
            // Chercher l'image précédente dans l'historique
            let previousPrompt = '';
            for (let i = editingMessageIndex - 1; i >= 0; i--) {
              const msg = updatedMessages[i];
              if (msg.role === 'assistant' && msg.images && msg.images.length > 0) {
                if (i > 0 && updatedMessages[i - 1].role === 'user') {
                  previousPrompt = updatedMessages[i - 1].content;
                  console.log('🔍 [Edit] Trouvé prompt précédent à index', i - 1, ':', previousPrompt);
                  break;
                }
              }
            }
            
            if (!previousPrompt) {
              console.warn('⚠️ [Edit] Prompt précédent introuvable');
              previousPrompt = editedContent;
            }
            
            // Nettoyer le prompt précédent
            const cleanPreviousPrompt = previousPrompt
              .replace(/g[eé]n[eè]re[-\s]*(moi|nous)?\s*(une?)?\s*image\s*(de|du|d')?/gi, '')
              .replace(/cr[eé][eé][-\s]*(moi|nous)?\s*(une?)?\s*image\s*(de|du|d')?/gi, '')
              .replace(/fais[-\s]*(moi|nous)?\s*(une?)?\s*image\s*(de|du|d')?/gi, '')
              .replace(/dessine[-\s]*(moi|nous)?\s*/gi, '')
              .trim();
            
            // Détecter le type de modification
            const isLocationChange = /^(mets|met)[-\s]*(le|la|lui)?\s+(dans|sur|à|en|au|aux)/i.test(editedContent);
            const isClothingChange = /^(habille|donne|ajoute|mets)[-\s]*(le|la|lui)?\s+(un|une|des)/i.test(editedContent);
            
            if (isLocationChange) {
              const cleanModification = editedContent.replace(/^(mets|met)[-\s]*(le|la|lui)?\s+/i, '').trim();
              const locationMatch = cleanPreviousPrompt.match(/^(.+?)\s+(dans|sur|à|en|au|aux|devant|derrière|entre)\s+/i);
              const baseSubject = locationMatch ? locationMatch[1] : cleanPreviousPrompt;
              imagePromptExtracted = `${baseSubject} ${cleanModification}`.trim();
              console.log('🔍 [Edit] CHANGEMENT DE LIEU:', imagePromptExtracted);
            } else if (isClothingChange) {
              const cleanModification = editedContent.replace(/^(habille|donne|ajoute|mets)[-\s]*(le|la|lui)?\s*/i, 'portant ').trim();
              imagePromptExtracted = `${cleanPreviousPrompt}, ${cleanModification}`.trim();
              console.log('🔍 [Edit] CHANGEMENT DE VÊTEMENT:', imagePromptExtracted);
            } else {
              imagePromptExtracted = `${cleanPreviousPrompt}, ${editedContent}`.trim();
              console.log('🔍 [Edit] AUTRE MODIFICATION:', imagePromptExtracted);
            }
          } else {
            // Demande directe
            imagePromptExtracted = editedContent
              .replace(/g[eé]n[eè]re[-\s]*(moi|nous)?\s*(une?)?\s*image\s*(de|du|d')?/gi, '')
              .replace(/cr[eé][eé][-\s]*(moi|nous)?\s*(une?)?\s*image\s*(de|du|d')?/gi, '')
              .replace(/fais[-\s]*(moi|nous)?\s*(une?)?\s*image\s*(de|du|d')?/gi, '')
              .replace(/dessine[-\s]*(moi|nous)?\s*/gi, '')
              .trim();
            
            if (!imagePromptExtracted) {
              imagePromptExtracted = editedContent;
            }
            console.log('🔍 [Edit] GÉNÉRATION DIRECTE:', imagePromptExtracted);
          }
          
          setIsGeneratingImage(true);
          
          try {
            const response = await fetch('/api/generate-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                prompt: imagePromptExtracted,
                seed: Math.floor(Math.random() * 10000)
              }),
            });

            const data = await response.json();

            if (data.success && data.imageUrl) {
              // Récupérer les messages actuels à jour
              setMessages(currentMessages => {
                const newMessages = [...currentMessages];
                const editIndex = newMessages.findIndex(msg => msg.content === editedContent && msg.role === 'user');
                const nextMessageIndex = editIndex + 1;
                
                if (nextMessageIndex < newMessages.length && newMessages[nextMessageIndex].role === 'assistant') {
                  // Remplacer l'image du message assistant suivant
                  newMessages[nextMessageIndex] = {
                    ...newMessages[nextMessageIndex],
                    images: [data.imageUrl],
                    content: `🎨 Voici l'image régénérée !`
                  };
                } else {
                  // Ajouter un nouveau message assistant avec l'image
                  newMessages.splice(nextMessageIndex, 0, {
                    role: 'assistant',
                    content: `🎨 Voici l'image régénérée !`,
                    images: [data.imageUrl]
                  });
                }
                
                return newMessages;
              });
              
              // Sauvegarder en BDD
              if (selectedProject) {
                await fetch('/api/save-message', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    projectId: selectedProject.id,
                    role: 'assistant',
                    content: `🎨 Voici l'image régénérée !`,
                    chapterId: selectedChapter?.id,
                    images: [data.imageUrl]
                  }),
                });
              }
              
              showToast('success', '✨ Image régénérée !');
            }
          } catch (error) {
            console.error('Erreur:', error);
            showToast('error', 'Erreur lors de la régénération');
          } finally {
            setIsGeneratingImage(false);
          }
        }
      }
    }
  };

  const cancelEditMessage = () => {
    setEditingMessageIndex(null);
    setEditedContent('');
  };

  const clearConversation = async () => {
    showConfirm(
      '🗑️ Vider la conversation',
      'Êtes-vous sûr de vouloir supprimer toute la conversation de la base de données ? Cette action est irréversible.',
      async () => {
        if (!selectedProject) {
          console.log('❌ Pas de projet sélectionné');
          setMessages([]);
          setUploadedImages([]);
          showToast('success', '✅ Conversation effacée de l\'interface');
          return;
        }

        try {
          console.log('🗑️ Suppression de tous les messages du projet', selectedProject.id);
          
          // Méthode 1 : Supprimer les messages avec ID connus
          const messagesToDelete = messages.filter(msg => msg.id);
          console.log('� Messages avec ID dans l\'interface:', messagesToDelete.length);
          
          if (messagesToDelete.length > 0) {
            console.log('🗑️ Suppression des messages avec ID...');
            const deletePromises = messagesToDelete.map(msg => 
              fetch(`/api/delete-message?id=${msg.id}`, { method: 'DELETE' })
                .then(res => {
                  console.log(`✅ Message ${msg.id} supprimé`);
                  return res;
                })
                .catch(err => {
                  console.error(`❌ Erreur suppression message ${msg.id}:`, err);
                  return null;
                })
            );
            
            await Promise.all(deletePromises);
          }
          
          // Méthode 2 : Recharger les conversations pour s'assurer que tout est supprimé
          // (au cas où il y aurait des messages dans la BDD qui ne sont pas dans l'interface)
          console.log('🔄 Rechargement des conversations pour vérification...');
          const response = await fetch(`/api/chat?projectId=${selectedProject.id}`);
          if (response.ok) {
            const data = await response.json();
            console.log('📊 Messages trouvés dans la BDD:', data.length);
            
            if (data.length > 0) {
              console.log('🗑️ Suppression des messages restants dans la BDD...');
              const additionalDeletes = data.map((msg: any) => 
                fetch(`/api/delete-message?id=${msg.id}`, { method: 'DELETE' })
                  .then(res => {
                    console.log(`✅ Message BDD ${msg.id} supprimé`);
                    return res;
                  })
                  .catch(err => {
                    console.error(`❌ Erreur suppression BDD ${msg.id}:`, err);
                    return null;
                  })
              );
              
              await Promise.all(additionalDeletes);
            }
          }
          
          console.log('✅ Suppression terminée avec succès');
          
          // Vider l'interface
          setMessages([]);
          setUploadedImages([]);
          showToast('success', '✅ Conversation effacée définitivement de la base de données');
          
        } catch (error) {
          console.error('❌ Erreur lors de la suppression:', error);
          showToast('error', '❌ Erreur lors de la suppression');
        }
      },
      'danger',
      'Vider définitivement',
      'Annuler'
    );
  };

  const copyMessageToClipboard = async (content: string, index: number) => {
    try {
      // Convertir le Markdown en HTML simple pour préserver le formatage
      const htmlContent = content
        // Titres
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Gras
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italique
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Code inline
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Code blocks
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        // Listes à puces
        .replace(/^\* (.+)$/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        // Listes numérotées
        .replace(/^\d+\. (.+)$/gim, '<li>$1</li>')
        // Liens
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        // Sauts de ligne
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

      // Wrapper HTML complet
      const htmlWrapped = `<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6;"><p>${htmlContent}</p></div>`;

      // Copier à la fois le texte brut ET le HTML formaté
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([htmlWrapped], { type: 'text/html' }),
        'text/plain': new Blob([content], { type: 'text/plain' })
      });

      await navigator.clipboard.write([clipboardItem]);
      
      setCopiedMessageIndex(index);
      setTimeout(() => setCopiedMessageIndex(null), 2000);
    } catch (error) {
      console.error('Erreur de copie:', error);
      // Fallback: copier uniquement le texte brut
      navigator.clipboard.writeText(content);
      setCopiedMessageIndex(index);
      setTimeout(() => setCopiedMessageIndex(null), 2000);
    }
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  };

  const generateImage = async (prompt?: string) => {
    const finalPrompt = prompt || imagePrompt;
    
    if (!finalPrompt.trim()) {
      showToast('warning', 'Veuillez saisir une description pour l\'image');
      return;
    }

    setIsGeneratingImage(true);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: finalPrompt,
          seed: Math.floor(Math.random() * 10000)
        }),
      });

      const data = await response.json();

      if (data.success && data.imageUrl) {
        // Ajouter l'image générée aux images uploadées
        setUploadedImages([...uploadedImages, data.imageUrl]);
        setImagePrompt('');
        
        // Sauvegarder automatiquement un message avec l'image dans la BDD
        if (selectedProject) {
          const imageMessage: Message = {
            role: 'assistant',
            content: `J'ai généré cette illustration basée sur : "${finalPrompt}"`,
            images: [data.imageUrl]
          };
          setMessages([...messages, imageMessage]);
          
          // Sauvegarder dans la BDD
          try {
            console.log('💾 Sauvegarde image dans BDD:', data.imageUrl);
            const saveResponse = await fetch('/api/save-message', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                projectId: selectedProject.id,
                role: 'assistant',
                content: imageMessage.content,
                chapterId: selectedChapter?.id,
                images: [data.imageUrl]
              }),
            });
            const saveData = await saveResponse.json();
            console.log('✅ Image sauvegardée avec ID:', saveData.id);
            showToast('success', '✨ Image générée et sauvegardée avec succès !');
          } catch (error) {
            console.error('❌ Erreur sauvegarde image:', error);
            showToast('error', 'Image générée mais erreur de sauvegarde');
          }
        }
      } else {
        showToast('error', 'Erreur lors de la génération de l\'image');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showToast('error', 'Erreur lors de la génération de l\'image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Fonction pour nettoyer et formater le texte pour PDF
  const cleanTextForPDF = (text: string): string => {
    return text
      // Enlever les emojis et caractères Unicode spéciaux
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Emojis
      .replace(/[\u{2600}-\u{26FF}]/gu, '') // Symboles divers
      .replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '') // Variation selectors
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Emojis supplémentaires
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Drapeaux
      // Nettoyer les symboles spéciaux problématiques
      .replace(/[^\x20-\x7E\xA0-\xFF\u0100-\u017F\u0180-\u024F]/g, '')
      // Normaliser les espaces
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Fonction pour formater le texte avec structure (titres, listes, paragraphes)
  const formatTextForPDF = (doc: any, text: string, startY: number, maxWidth: number = 170): number => {
    let y = startY;
    const lines = text.split('\n');
    
    lines.forEach((line) => {
      // Nettoyer d'abord la ligne
      let cleanedLine = cleanTextForPDF(line).trim();
      if (!cleanedLine) {
        y += 3; // Saut de ligne vide
        return;
      }

      // Détecter et traiter les titres (en enlevant TOUS les # au début)
      const headerMatch = cleanedLine.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const titleText = headerMatch[2].trim();
        
        if (y > 265) { doc.addPage(); y = 20; }
        
        // Taille selon le niveau
        if (level === 1) {
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text(titleText, 20, y);
          y += 12;
        } else if (level === 2) {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(titleText, 20, y);
          y += 10;
        } else if (level === 3) {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(titleText, 20, y);
          y += 8;
        } else {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(titleText, 20, y);
          y += 7;
        }
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        return;
      }

      // Listes à puces (enlever *, - du début)
      const bulletMatch = cleanedLine.match(/^\s*[\*\-•]\s+(.+)$/);
      if (bulletMatch) {
        let bulletText = bulletMatch[1].trim();
        // Enlever les ** du texte de la puce
        bulletText = bulletText.replace(/\*\*(.+?)\*\*/g, '$1');
        
        if (y > 275) { doc.addPage(); y = 20; }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('•', 25, y);
        
        const wrappedLines = doc.splitTextToSize(bulletText, maxWidth - 15);
        wrappedLines.forEach((wLine: string) => {
          if (y > 280) { doc.addPage(); y = 20; doc.text('•', 25, y); }
          doc.text(wLine, 32, y);
          y += 5;
        });
        y += 1;
        return;
      }

      // Enlever TOUS les ** du texte (markdown gras)
      cleanedLine = cleanedLine.replace(/\*\*/g, '');

      // Paragraphe normal
      if (y > 275) { doc.addPage(); y = 20; }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const wrappedLines = doc.splitTextToSize(cleanedLine, maxWidth);
      wrappedLines.forEach((wLine: string) => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(wLine, 20, y);
        y += 5;
      });
      y += 2; // Petit espacement entre paragraphes
    });

    return y;
  };

  const exportToPDF = async () => {
    if (!selectedProject) return;
    
    try {
      // Utiliser jsPDF pour générer un PDF
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.text(cleanTextForPDF(selectedProject.title), 20, 20);
      
      if (selectedProject.description) {
        doc.setFontSize(12);
        doc.text(cleanTextForPDF(selectedProject.description), 20, 30);
      }
      
      let y = 50;
      
      // Exporter les chapitres s'ils existent
      if (chapters.length > 0) {
        for (const chapter of chapters) {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text(cleanTextForPDF(`${chapter.order_index}. ${chapter.title}`), 20, y);
          doc.setFont('helvetica', 'normal');
          y += 12;
          
          if (chapter.content) {
            y = formatTextForPDF(doc, chapter.content, y);
          }
          y += 10;
        }
      }
      
      // Sinon, exporter la conversation
      if (chapters.length === 0 && messages.length > 0) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Conversation', 20, y);
        doc.setFont('helvetica', 'normal');
        y += 15;
        
        for (const msg of messages) {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          
          // En-tête du message
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(msg.role === 'user' ? 'Vous :' : 'Assistant :', 20, y);
          doc.setFont('helvetica', 'normal');
          y += 8;
          
          // Contenu formaté
          y = formatTextForPDF(doc, msg.content, y);
          
          // Ajouter les images si présentes
          if (msg.images && msg.images.length > 0) {
            for (const imageData of msg.images) {
              if (y > 220) { // Laisser de l'espace pour l'image
                doc.addPage();
                y = 20;
              }
              
              try {
                // Ajouter l'image (base64 ou URL)
                const imgWidth = 170;
                const imgHeight = 100;
                doc.addImage(imageData, 'JPEG', 20, y, imgWidth, imgHeight);
                y += imgHeight + 10;
              } catch (imgError) {
                console.error('Erreur ajout image PDF:', imgError);
                doc.setFontSize(9);
                doc.setTextColor(150, 150, 150);
                doc.text('[Image non disponible]', 20, y);
                doc.setTextColor(0, 0, 0);
                y += 6;
              }
            }
          }
          
          y += 12; // Espacement entre messages
        }
      }
      
      // Nettoyer le nom de fichier
      const fileName = selectedProject.title.replace(/[^a-z0-9]/gi, '_');
      doc.save(`${fileName}.pdf`);
      
      // Feedback utilisateur
      showToast('success', '✅ PDF exporté avec succès !');
    } catch (error) {
      console.error('Erreur export PDF:', error);
      showToast('error', '❌ Erreur lors de l\'export PDF');
    }
  };

  // Fonction pour convertir le texte formaté en paragraphes Word
  const formatTextForWord = (text: string): any[] => {
    const paragraphs: any[] = [];
    const lines = text.split('\n');
    
    lines.forEach((line) => {
      let cleanedLine = cleanTextForPDF(line).trim();
      if (!cleanedLine) {
        paragraphs.push(new Paragraph({ text: '', spacing: { after: 100 } }));
        return;
      }

      // Détecter les titres (avec regex pour capturer TOUS les #)
      const headerMatch = cleanedLine.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const titleText = headerMatch[2].trim();
        
  let headingLevel: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1;
        let spacing = { before: 400, after: 200 };
        
        if (level === 1) {
          headingLevel = HeadingLevel.HEADING_1;
          spacing = { before: 400, after: 200 };
        } else if (level === 2) {
          headingLevel = HeadingLevel.HEADING_2;
          spacing = { before: 300, after: 150 };
        } else if (level === 3) {
          headingLevel = HeadingLevel.HEADING_3;
          spacing = { before: 200, after: 100 };
        } else {
          headingLevel = HeadingLevel.HEADING_3;
          spacing = { before: 150, after: 80 };
        }
        
        paragraphs.push(new Paragraph({
          text: titleText,
          heading: headingLevel,
          spacing: spacing,
        }));
        return;
      }

      // Listes à puces (capturer le texte sans * ou -)
      const bulletMatch = cleanedLine.match(/^\s*[\*\-•]\s+(.+)$/);
      if (bulletMatch) {
        let bulletText = bulletMatch[1].trim();
        
        // Gérer le gras dans les puces
        if (bulletText.includes('**')) {
          const parts = bulletText.split(/(\*\*.*?\*\*)/g);
          const runs: any[] = [];
          parts.forEach((part) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              runs.push(new TextRun({ text: part.replace(/\*\*/g, ''), bold: true }));
            } else if (part) {
              runs.push(new TextRun(part));
            }
          });
          paragraphs.push(new Paragraph({
            children: runs,
            bullet: { level: 0 },
            spacing: { after: 100 },
          }));
        } else {
          paragraphs.push(new Paragraph({
            text: bulletText,
            bullet: { level: 0 },
            spacing: { after: 100 },
          }));
        }
        return;
      }

      // Enlever les ** mais garder le formatage gras dans paragraphes normaux
      if (cleanedLine.includes('**')) {
        const parts = cleanedLine.split(/(\*\*.*?\*\*)/g);
        const runs: any[] = [];
        parts.forEach((part) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            runs.push(new TextRun({ text: part.replace(/\*\*/g, ''), bold: true }));
          } else if (part) {
            runs.push(new TextRun(part));
          }
        });
        if (runs.length > 0) {
          paragraphs.push(new Paragraph({ children: runs, spacing: { after: 150 } }));
        }
        return;
      }

      // Paragraphe normal (sans **)
      paragraphs.push(new Paragraph({
        text: cleanedLine,
        spacing: { after: 150 },
      }));
    });
    
    return paragraphs;
  };

  const exportToWord = async () => {
    if (!selectedProject) return;
    
    try {
      const sections: any[] = [
        new Paragraph({
          text: cleanTextForPDF(selectedProject.title),
          heading: HeadingLevel.TITLE,
        }),
      ];
      
      if (selectedProject.description) {
        sections.push(
          new Paragraph({
            text: cleanTextForPDF(selectedProject.description),
            spacing: { after: 200 },
          })
        );
      }
      
      // Exporter les chapitres s'ils existent
      if (chapters.length > 0) {
        for (const chapter of chapters) {
          sections.push(
            new Paragraph({
              text: cleanTextForPDF(`${chapter.order_index}. ${chapter.title}`),
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 },
            })
          );
          
          if (chapter.content) {
            const formattedParagraphs = formatTextForWord(chapter.content);
            sections.push(...formattedParagraphs);
          }
        }
      }
      
      // Sinon, exporter la conversation
      if (chapters.length === 0 && messages.length > 0) {
        sections.push(
          new Paragraph({
            text: 'Conversation',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          })
        );
        
        for (const msg of messages) {
          // En-tête du message
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: msg.role === 'user' ? 'Vous : ' : 'Assistant : ',
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { before: 200, after: 100 },
            })
          );
          
          // Contenu formaté
          const formattedParagraphs = formatTextForWord(msg.content);
          sections.push(...formattedParagraphs);
          
          // Ajouter les images si présentes
          if (msg.images && msg.images.length > 0) {
            for (const imageData of msg.images) {
              try {
                // Convertir base64 en buffer pour Word
                const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
                const imageBuffer = Buffer.from(base64Data, 'base64');
                
                sections.push(
                  new Paragraph({
                    children: [
                      new ImageRun({
                        type: 'jpg',
                        data: imageBuffer,
                        transformation: {
                          width: 500,
                          height: 300,
                        },
                      }),
                    ],
                    spacing: { before: 100, after: 200 },
                  })
                );
              } catch (imgError) {
                console.error('Erreur ajout image Word:', imgError);
                sections.push(
                  new Paragraph({
                    children: [
                      new TextRun({ text: '[Image non disponible]', italics: true }),
                    ],
                    spacing: { after: 100 },
                  })
                );
              }
            }
          }
        }
      }
      
      const doc = new Document({
        sections: [{ children: sections }],
      });
      
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedProject.title.replace(/[^a-z0-9]/gi, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Feedback utilisateur
      showToast('success', '✅ Document Word exporté avec succès !');
    } catch (error) {
      console.error('Erreur export Word:', error);
      showToast('error', '❌ Erreur lors de l\'export Word');
    }
  };

  const sendMessage = async () => {
    if ((!inputMessage.trim() && uploadedImages.length === 0 && uploadedFiles.length === 0) || !selectedProject || isGenerating) return;

    // Préparer le message avec le contenu des fichiers
    let finalMessage = inputMessage;
    if (uploadedFiles.length > 0) {
      const filesContent = uploadedFiles.map(file => {
        if (file.type === 'pdf') {
          return `\n\n📄 **${file.content}**\n\n**Question de l'utilisateur concernant ce document:** ${inputMessage}`;
        } else if (file.type === 'image') {
          return `\n\n🖼️ **Image: ${file.name}**\n${file.content}`;
        } else {
          return `\n\n📄 **Fichier: ${file.name}**\n\`\`\`\n${file.content}\n\`\`\``;
        }
      }).join('\n');
      
      // Pour les PDFs, le message utilisateur est déjà inclus dans filesContent
      if (uploadedFiles.some(f => f.type === 'pdf')) {
        finalMessage = filesContent;
      } else {
        finalMessage = `${inputMessage}${filesContent}`;
      }
    }

    // 🎨 Détecter automatiquement les demandes de génération d'images
    const imageGenerationPatterns = [
      /g[eé]n[eè]re[-\s]*(moi|nous)?\s*(une?)?\s*image/i,
      /cr[eé][eé][-\s]*(moi|nous)?\s*(une?)?\s*image/i,
      /fais[-\s]*(moi|nous)?\s*(une?)?\s*image/i,
      /dessine[-\s]*(moi|nous)?/i,
      /illustr(e|ation)/i,
      /produis[-\s]*(une?)?\s*image/i
    ];

    // Patterns de modification d'image (suite à une génération) - TRÈS SPÉCIFIQUES
    const imageModificationPatterns = [
      /^(je veux|j'aimerais) qu(e|')il (porte|ait|soit)/i, // "je veux qu'il porte"
      /^habille[-\s]*(le|la|lui)?/i, // "habille-lui", "habille le"
      /^donne[-\s]*(lui|y)?/i, // "donne-lui des lunettes"
      /^ajoute[-\s]*(lui|y)?\s*(un|une|des)/i, // "ajoute-lui des lunettes"
      /^modifie[-\s]/i, // "modifie..."
      /^change[-\s]/i, // "change..."
      /^mets[-\s]*(lui|y)?\s*(un|une|des)/i, // "mets-lui des lunettes"
      /^enlève[-\s]*(lui|y)?/i, // "enlève-lui..."
      /^retire[-\s]*(lui|y)?/i, // "retire..."
      /^remplace[-\s]/i, // "remplace..."
      /^mais avec/i, // "mais avec..."
      /^plutôt avec/i, // "plutôt avec..."
      /^avec (un|une|des)/i, // "avec un costume"
      /^refais[-\s]*(le|la|les)?(\s+avec)?/i, // "refais-le avec..."
      /^maintenant avec/i, // "maintenant avec..."
      /^(un|une|des)\s+\w+\s+(de plus|en plus|aussi)/i // "des lunettes en plus"
    ];

    // Vérifier si le dernier message de l'assistant était une génération d'image
    const lastAssistantMessage = messages.length > 0 && messages[messages.length - 1].role === 'assistant' 
      ? messages[messages.length - 1] 
      : null;
    const wasLastMessageAnImage = lastAssistantMessage && lastAssistantMessage.images && lastAssistantMessage.images.length > 0;

    // Détection : demande directe OU modification TRÈS SPÉCIFIQUE après une image
    const isDirectImageRequest = imageGenerationPatterns.some(pattern => pattern.test(inputMessage));
    
    // Pour la modification : le message doit être COURT (< 100 caractères) et commencer par un pattern de modification
    const isShortMessage = inputMessage.length < 100;
    const matchesModificationPattern = imageModificationPatterns.some(pattern => pattern.test(inputMessage));
    const isImageModification = wasLastMessageAnImage && isShortMessage && matchesModificationPattern;
    
    const isImageRequest = isDirectImageRequest || isImageModification;

    if (isImageRequest && uploadedImages.length === 0) {
      // C'est une demande de génération d'image !
      const userMessage: Message = { 
        role: 'user', 
        content: inputMessage
      };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInputMessage('');
      
      // Sauvegarder le message utilisateur dans la BDD
      if (selectedProject) {
        try {
          await fetch('/api/save-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: selectedProject.id,
              role: 'user',
              content: inputMessage,
              chapterId: selectedChapter?.id
            }),
          });
        } catch (error) {
          console.error('❌ Erreur sauvegarde message utilisateur:', error);
        }
      }
      
      // Extraire le prompt de l'image
      let imagePromptExtracted = '';
      
      if (isImageModification && wasLastMessageAnImage) {
        // C'est une modification : on récupère le DERNIER PROMPT d'image utilisé
        // Le dernier message est celui de l'assistant avec l'image (messages[length-1])
        // Le prompt est dans le message utilisateur juste avant (messages[length-2])
        let previousPrompt = '';
        
        if (messages.length >= 2) {
          // Chercher en partant de la fin
          for (let i = messages.length - 1; i >= 0; i--) {
            const msg = messages[i];
            // Trouver un message assistant avec une image
            if (msg.role === 'assistant' && msg.images && msg.images.length > 0) {
              // Le prompt est dans le message utilisateur juste avant
              if (i > 0 && messages[i - 1].role === 'user') {
                previousPrompt = messages[i - 1].content;
                console.log('🔍 Trouvé prompt précédent à index', i - 1, ':', previousPrompt);
                break;
              }
            }
          }
        }
        
        // Si pas trouvé, erreur
        if (!previousPrompt) {
          console.warn('⚠️ Impossible de trouver le prompt précédent, utilisation du message actuel');
          previousPrompt = inputMessage;
        }
        
        // Nettoyer le prompt précédent des mots-clés
        const cleanPreviousPrompt = previousPrompt
          .replace(/g[eé]n[eè]re[-\s]*(moi|nous)?\s*(une?)?\s*image\s*(de|du|d')?/gi, '')
          .replace(/cr[eé][eé][-\s]*(moi|nous)?\s*(une?)?\s*image\s*(de|du|d')?/gi, '')
          .replace(/fais[-\s]*(moi|nous)?\s*(une?)?\s*image\s*(de|du|d')?/gi, '')
          .replace(/dessine[-\s]*(moi|nous)?\s*/gi, '')
          .trim();
        
        // Détecter le type de modification
        const isLocationChange = /^(mets|met)[-\s]*(le|la|lui)?\s+(dans|sur|à|en|au|aux)/i.test(inputMessage);
        const isClothingChange = /^(habille|donne|ajoute|mets)[-\s]*(le|la|lui)?\s+(un|une|des)/i.test(inputMessage);
        
        console.log('🔍 Type de modification détecté:');
        console.log('  - isLocationChange:', isLocationChange);
        console.log('  - isClothingChange:', isClothingChange);
        
        let cleanModification = '';
        
        if (isLocationChange) {
          // Changement de lieu : extraire le nouveau lieu
          cleanModification = inputMessage
            .replace(/^(mets|met)[-\s]*(le|la|lui)?\s+/i, '')
            .trim();
          
          console.log('  - cleanPreviousPrompt:', cleanPreviousPrompt);
          
          // Extraire le sujet principal (tout avant le premier marqueur de lieu)
          let baseSubject = cleanPreviousPrompt;
          const locationMatch = cleanPreviousPrompt.match(/^(.+?)\s+(dans|sur|à|en|au|aux|devant|derrière|entre)\s+/i);
          
          console.log('  - locationMatch:', locationMatch);
          
          if (locationMatch) {
            baseSubject = locationMatch[1]; // Ex: "batman" de "batman dans le jardin"
            console.log('  - Sujet extrait via regex:', baseSubject);
          } else {
            // Pas de marqueur de lieu trouvé, prendre tout le prompt
            baseSubject = cleanPreviousPrompt;
            console.log('  - Aucun marqueur de lieu, utilisation du prompt complet:', baseSubject);
          }
          
          console.log('  - cleanModification:', cleanModification);
          
          // IMPORTANT : Forcer la cohérence en ajoutant des descripteurs
          imagePromptExtracted = `${baseSubject} ${cleanModification}, same character, same person, photorealistic, high quality, detailed`.trim();
          console.log('  - ✅ Prompt final pour changement de lieu:', imagePromptExtracted);
        } else if (isClothingChange) {
          // Changement de vêtement/accessoire : on garde tout le contexte
          cleanModification = inputMessage
            .replace(/^(habille|donne|ajoute|mets)[-\s]*(le|la|lui)?\s*/i, 'wearing ')
            .trim();
          imagePromptExtracted = `${cleanPreviousPrompt}, ${cleanModification}, same character, same face, same person, photorealistic`.trim();
          console.log('  - ✅ Prompt final pour changement de vêtement:', imagePromptExtracted);
        } else {
          // Autre modification : on combine intelligemment
          cleanModification = inputMessage.trim();
          imagePromptExtracted = `${cleanPreviousPrompt}, ${cleanModification}, same character, consistent style`.trim();
          console.log('  - ✅ Prompt final (autre):', imagePromptExtracted);
        }
      } else {
        // Demande directe : extraire le prompt après les mots-clés
        console.log('🔍 Génération directe (pas de modification)');
        imagePromptExtracted = inputMessage
          .replace(/g[eé]n[eè]re[-\s]*(moi|nous)?\s*(une?)?\s*image\s*(de|du|d')?/gi, '')
          .replace(/cr[eé][eé][-\s]*(moi|nous)?\s*(une?)?\s*image\s*(de|du|d')?/gi, '')
          .replace(/fais[-\s]*(moi|nous)?\s*(une?)?\s*image\s*(de|du|d')?/gi, '')
          .replace(/dessine[-\s]*(moi|nous)?\s*/gi, '')
          .replace(/illustr(e|ation)\s*/gi, '')
          .replace(/produis[-\s]*(une?)?\s*image\s*(de|du|d')?/gi, '')
          .trim();
      }

      // Si le prompt extrait est vide, utiliser le message complet
      if (!imagePromptExtracted) {
        imagePromptExtracted = inputMessage;
      }

      console.log('🚀 ====== ENVOI À L\'API ======');
      console.log('📤 Prompt final envoyé:', imagePromptExtracted);
      console.log('🎲 Seed:', Math.floor(Math.random() * 10000));
      
      setIsGeneratingImage(true);
      showToast('info', '🎨 Génération de l\'image en cours...');
      
      // Ajouter un message temporaire "Génération en cours..."
      const generatingMessage: Message = {
        role: 'assistant',
        content: '🎨 Génération de l\'image en cours...'
      };
      setMessages([...updatedMessages, generatingMessage]);
      
      // Choisir l'API selon le type de demande
      try {
        let response;
        let data;
        const seed = Math.floor(Math.random() * 10000);
        
        // Si c'est une modification ET qu'on a l'image précédente, utiliser l'API de modification
        if (isImageModification && messages.length > 0) {
          // Trouver la dernière image
          let lastImage: string | null = null;
          for (let i = messages.length - 1; i >= 0; i--) {
            const imgs = messages[i]?.images;
            if (Array.isArray(imgs) && imgs.length > 0) {
              lastImage = imgs[0] ?? null;
              console.log('🖼️ Image de base trouvée pour modification');
              break;
            }
          }
          
          // Essayer l'API de modification si l'image existe
          if (lastImage) {
            console.log('🔄 Tentative de modification via Cloudflare img2img...');
            response = await fetch('/api/modify-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: imagePromptExtracted,
                imageBase64: lastImage
              }),
            });
            
            data = await response.json();
            
            // Si Cloudflare n'est pas configuré ou échoue, fallback sur génération
            if (!data.success || data.useFallback) {
              console.log('⚠️ Fallback sur génération simple...');
              response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  prompt: imagePromptExtracted,
                  seed: seed
                }),
              });
              data = await response.json();
            }
          } else {
            // Pas d'image trouvée, génération normale
            console.log('⚠️ Aucune image précédente, génération normale');
            response = await fetch('/api/generate-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                prompt: imagePromptExtracted,
                seed: seed
              }),
            });
            data = await response.json();
          }
        } else {
          // Génération normale (pas une modification)
          response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt: imagePromptExtracted,
              seed: seed
            }),
          });
          data = await response.json();
        }
        
        console.log('📥 Réponse API génération:', data);

        if (data.success && data.imageUrl) {
          console.log('✅ Image générée avec succès:', data.imageUrl.substring(0, 100) + '...');
          
          const imageMessage: Message = {
            role: 'assistant',
            content: isImageModification 
              ? `🎨 Image modifiée selon votre demande !`
              : `🎨 Voici l'image générée !`,
            images: [data.imageUrl]
          };
          
          console.log('💬 Message image créé:', {
            role: imageMessage.role,
            content: imageMessage.content,
            hasImages: !!imageMessage.images,
            imageCount: imageMessage.images?.length,
            imagePreview: imageMessage.images?.[0]?.substring(0, 50) + '...'
          });
          
          // Remplacer le message "en cours" par l'image finale
          const newMessages = [...updatedMessages, imageMessage];
          console.log('� Nombre total de messages après ajout:', newMessages.length);
          setMessages(newMessages);
          
          // Sauvegarder la réponse avec l'image dans la BDD
          if (selectedProject) {
            try {
              await fetch('/api/save-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  projectId: selectedProject.id,
                  role: 'assistant',
                  content: imageMessage.content,
                  chapterId: selectedChapter?.id,
                  images: [data.imageUrl]
                }),
              });
              showToast('success', '✨ Image générée avec succès !');
            } catch (error) {
              console.error('❌ Erreur sauvegarde image:', error);
              showToast('warning', 'Image générée mais non sauvegardée');
            }
          }
        } else {
          console.error('❌ Échec génération:', data);
          showToast('error', 'Erreur lors de la génération: ' + (data.error || 'Raison inconnue'));
          // Supprimer le message "en cours..."
          setMessages(updatedMessages);
        }
      } catch (error) {
        console.error('❌ Erreur génération:', error);
        showToast('error', 'Erreur lors de la génération');
        // Supprimer le message "en cours..."
        setMessages(updatedMessages);
      } finally {
        setIsGeneratingImage(false);
      }
      
      return;
    }

    const userMessage: Message = { 
      role: 'user', 
      content: finalMessage || inputMessage || "Analyse cette image",
      images: uploadedImages.length > 0 ? [...uploadedImages] : undefined
    };
    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsGenerating(true);
    setStreamingContent('');

    // Créer un nouveau AbortController pour cette requête
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          message: finalMessage || inputMessage || "Analyse cette image",
          chapterId: selectedChapter?.id,
          images: uploadedImages.length > 0 ? uploadedImages : undefined,
        }),
        signal: controller.signal,
      });
      
      setUploadedImages([]); // Clear images after sending
      setUploadedFiles([]); // Clear files after sending

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(data);
                fullContent += parsed.content;
                setStreamingContent(fullContent);
              } catch (e) {
                // Ignorer les erreurs de parsing
              }
            }
          }
        }
      }

      setMessages([...messages, userMessage, { role: 'assistant', content: fullContent }]);
      setStreamingContent('');
      
      // 🎨 AUTO-GÉNÉRATION : Si l'IA répond avec "🎨 Génération de l'image en cours...", générer automatiquement
      if (fullContent.includes('🎨 Génération de l\'image en cours...') || 
          fullContent.includes('🎨 Generation de l\'image en cours...')) {
        
        // Extraire le prompt de la demande utilisateur
        const userPrompt = userMessage.content || '';
        
        // Générer l'image automatiquement
        setIsGeneratingImage(true);
        showToast('info', '🎨 Génération automatique de l\'image...');
        
        try {
          const imageResponse = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt: userPrompt,
              seed: Math.floor(Math.random() * 10000)
            }),
          });

          const imageData = await imageResponse.json();

          if (imageData.success && imageData.imageUrl) {
            // Remplacer le message de l'assistant par un message avec l'image
            const imageMessage: Message = {
              role: 'assistant',
              content: `🎨 Voici l'image générée !`,
              images: [imageData.imageUrl]
            };
            setMessages([...messages, userMessage, imageMessage]);
            
            // Sauvegarder l'image dans la BDD
            if (selectedProject) {
              try {
                await fetch('/api/save-message', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    projectId: selectedProject.id,
                    role: 'assistant',
                    content: imageMessage.content,
                    chapterId: selectedChapter?.id,
                    images: [imageData.imageUrl]
                  }),
                });
                showToast('success', '✨ Image générée automatiquement !');
              } catch (error) {
                console.error('❌ Erreur sauvegarde image:', error);
              }
            }
          }
        } catch (error) {
          console.error('Erreur génération auto:', error);
          showToast('error', 'Erreur lors de la génération automatique');
        } finally {
          setIsGeneratingImage(false);
        }
      }
      
      // Recharger les chapitres si nécessaire
      if (selectedChapter) {
        loadChapters(selectedProject.id);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // La génération a été interrompue par l'utilisateur
        console.log('Génération interrompue par l\'utilisateur');
        
        // Sauvegarder le contenu partiel s'il existe
        if (streamingContent) {
          const partialMessage: Message = { 
            role: 'assistant', 
            content: streamingContent + '\n\n[⏸️ *Génération interrompue*]'
          };
          setMessages([...messages, userMessage, partialMessage]);
        }
        setStreamingContent('');
      } else {
        console.error('Erreur:', error);
      }
    } finally {
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  const continueChapter = async () => {
    if (!selectedProject || !selectedChapter || isGenerating) return;

    setIsGenerating(true);
    setStreamingContent('');

    try {
      const response = await fetch('/api/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          chapterId: selectedChapter.id,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(data);
                fullContent += parsed.content;
                setStreamingContent(fullContent);
              } catch (e) {
                // Ignorer
              }
            }
          }
        }
      }

      setStreamingContent('');
      loadChapters(selectedProject.id);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" style={{ paddingBottom: '40px' }}>
      {/* Sidebar - Projets et Chapitres */}
      <motion.div 
        initial={false}
        animate={{ 
          width: sidebarOpen ? 320 : 0,
          opacity: sidebarOpen ? 1 : 0,
          x: sidebarOpen ? 0 : -320
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-slate-800/50 backdrop-blur-xl border-r border-white/10 flex flex-col overflow-hidden flex-shrink-0 absolute md:relative z-50 h-full md:z-auto"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <span className="text-2xl">🤖</span>
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">MemoGenie</h1>
          </div>
          
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Nouveau Projet
          </button>
        </div>

        {/* Liste des projets */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedProject(project)}
              className={`p-4 rounded-lg cursor-pointer transition-all relative group ${
                selectedProject?.id === project.id
                  ? 'bg-purple-500/20 border-2 border-purple-500'
                  : 'bg-white/5 hover:bg-white/10 border-2 border-transparent'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate mb-1.5">{project.title}</h3>
                  
                  {/* Badge Type de Projet - En dessous du titre */}
                  {(() => {
                    const projectTypeInfo = PROJECT_TYPES.find(t => t.id === (project.project_type || 'chatbot'));
                    if (!projectTypeInfo) return null;
                    
                    const Icon = projectTypeInfo.icon;
                    const colorClasses = {
                      blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                      purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                      violet: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
                      pink: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
                      orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
                      green: 'bg-green-500/20 text-green-300 border-green-500/30',
                      indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
                      cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
                      teal: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
                      amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                    };
                    
                    return (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border rounded-full ${colorClasses[projectTypeInfo.color as keyof typeof colorClasses]}`}>
                        <span className="text-xs">{projectTypeInfo.emoji}</span>
                        <span>{projectTypeInfo.name}</span>
                      </span>
                    );
                  })()}
                  
                  {project.description && (
                    <p className="text-gray-400 text-sm mt-1.5 line-clamp-2">{project.description}</p>
                  )}
                </div>
                
                {/* Boutons d'action */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <button
                    onClick={(e) => startEditProjectName(project, e)}
                    className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    title="Renommer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => deleteProject(project.id, e)}
                    className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chapitres */}
        {selectedProject && (
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold">Chapitres</h2>
              <button
                onClick={async () => {
                  const title = await showInput(
                    '📚 Nouveau Chapitre',
                    'Entrez le titre du chapitre',
                    '',
                    'Ex: Introduction, Conclusion...',
                    '📚',
                    'Créer',
                    'Annuler'
                  );
                  if (title && title.trim()) {
                    createNewChapter(title.trim());
                    showToast('success', '✅ Chapitre créé avec succès');
                  }
                }}
                className="p-1 hover:bg-white/10 rounded"
              >
                <Plus className="w-4 h-4 text-gray-700" />
              </button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  onClick={() => setSelectedChapter(chapter)}
                  className={`p-2 rounded cursor-pointer text-sm ${
                    selectedChapter?.id === chapter.id
                      ? 'bg-purple-500/20 text-white'
                      : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  {chapter.order_index}. {chapter.title}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Overlay mobile pour fermer la sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Zone principale */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
        {/* Header */}
        <div className="h-16 bg-slate-800/50 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
            {/* Bouton toggle sidebar */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              title={sidebarOpen ? "Fermer la sidebar" : "Ouvrir la sidebar"}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-5 h-5 text-gray-400" />
              ) : (
                <PanelLeft className="w-5 h-5 text-purple-400" />
              )}
            </button>
            
            {selectedProject && (
              <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                <h2 className="text-white font-semibold truncate text-sm md:text-base">{selectedProject.title}</h2>
                {selectedChapter && (
                  <>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 hidden md:block" />
                    <span className="text-gray-300 truncate text-sm md:text-base hidden md:inline">{selectedChapter.title}</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            {/* Cacher ces boutons pour l'éditeur IA */}
            {selectedProject?.project_type !== 'ai-editor' && (
              <>
                {selectedChapter && (
                  <button
                    onClick={continueChapter}
                    disabled={isGenerating}
                    className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors text-sm md:text-base"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span className="hidden md:inline">Continuer</span>
                  </button>
                )}
                {/* Bouton Galerie - Seulement l'icône */}
                {selectedProject && messages.length > 0 && (
                  <button
                    onClick={() => {
                      setShowGallery(!showGallery);
                      if (!showGallery) {
                        loadGallery(selectedProject?.id);
                      }
                    }}
                    className={`p-2 rounded-lg transition-all ${
                      showGallery 
                    ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white' 
                    : 'hover:bg-white/10 text-gray-400 hover:text-white'
                }`}
                title="Galerie d'images"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            )}
            
            {/* Bouton Appel Vocal */}
            <button
              onClick={() => {
                if (!selectedProject) {
                  showToast('warning', '⚠️ Veuillez d\'abord créer ou sélectionner un projet !');
                  return;
                }
                if (isVoiceCallActive) {
                  endVoiceCall();
                } else {
                  startVoiceCall();
                }
              }}
              disabled={!selectedProject && !isVoiceCallActive}
                className={`p-2 rounded-lg transition-all ${
                  !selectedProject && !isVoiceCallActive
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                    : isVoiceCallActive
                    ? 'bg-green-500 hover:bg-green-600 text-white animate-pulse'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                }`}
                title={
                  !selectedProject && !isVoiceCallActive
                    ? "⚠️ Créez ou sélectionnez un projet d'abord"
                    : isVoiceCallActive 
                    ? "Raccrocher" 
                    : "Démarrer un appel vocal avec l'IA"
                }
              >
                {isVoiceCallActive ? (
                  <PhoneOff className="w-5 h-5" />
                ) : (
                  <Phone className="w-5 h-5" />
                )}
              </button>
            
            {messages.length > 0 && speechSynthesis && (
              <button
                ref={speechSettingsRef}
                data-speech-settings-btn
                onClick={() => {
                  setShowSpeechSettings(!showSpeechSettings);
                  setSpeechButtonRef(speechSettingsRef.current);
                }}
                className={`p-2 rounded-lg transition-all ${
                  showSpeechSettings
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'hover:bg-white/10 text-gray-400 hover:text-white'
                }`}
                title="Paramètres de lecture vocale"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
                {messages.length > 0 && (
                  <button
                    onClick={clearConversation}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                    title="Vider la conversation"
                  >
                    <Eraser className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                  </button>
                )}
                <button 
                  onClick={exportToPDF}
                  disabled={!selectedProject || (chapters.length === 0 && messages.length === 0)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
                  title="Exporter en PDF"
                >
                  <FileText className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </button>
                <button 
                  onClick={exportToWord}
                  disabled={!selectedProject || (chapters.length === 0 && messages.length === 0)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
                  title="Exporter en Word"
                >
                  <Download className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Messages et streaming OU Gallery */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4">
          {showGallery ? (
            /* GALERIE D'IMAGES */
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">
                    🎨 Galerie d'Images
                  </h2>
                  {selectedProject && (
                    <p className="text-sm text-gray-400 mt-1">
                      Projet : <span className="text-purple-400 font-semibold">{selectedProject.title}</span>
                      {' '}• {galleryImages.length} image{galleryImages.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowGallery(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-white rounded-lg transition-colors"
                >
                  Retour
                </button>
              </div>
              
              {galleryImages.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Aucune image dans la galerie</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative group cursor-pointer aspect-square rounded-xl overflow-hidden border-2 border-white/10 hover:border-purple-500/50 transition-all"
                      onClick={() => setZoomedImage(item.imageUrl)}
                    >
                      {/* Image */}
                      <img
                        src={item.imageUrl}
                        alt={item.projectTitle}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      
                      {/* Badge Projet (coin supérieur droit) */}
                      <div className="absolute top-2 right-2">
                        <div className={`p-2 rounded-lg backdrop-blur-md ${
                          item.projectType === 'chatbot' 
                            ? 'bg-blue-500/80' 
                            : 'bg-purple-500/80'
                        } shadow-lg`}>
                          {item.projectType === 'chatbot' ? (
                            <Sparkles className="w-4 h-4 text-gray-700" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-gray-700" />
                          )}
                        </div>
                      </div>
                      
                      {/* Overlay avec titre au survol */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-sm font-semibold truncate">{item.projectTitle}</p>
                          <p className="text-gray-300 text-xs truncate">{item.content}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : !selectedProject ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-float" />
                <h2 className="text-2xl font-bold text-white mb-2">
                  Bienvenue sur MemoGenie 🚀
                </h2>
                <p className="text-gray-400">
                  Créez un projet pour commencer ou discutez directement avec l'IA
                </p>
              </div>
            </div>
          ) : selectedProject.project_type === 'ai-editor' ? (
            /* ====== ÉDITEUR WYSIWYG AVEC ASSISTANCE IA ====== */
            <div className="h-full flex flex-col bg-gray-50">
              {/* Barre d'outils de formatage */}
              <div className="bg-white border-b border-gray-200 shadow-sm p-2 sticky top-0 z-10">
                <div className="flex flex-wrap gap-1 items-center">
                  {/* Groupe : Undo/Redo */}
                  <div className="flex gap-0.5 border-r border-gray-300 pr-2">
                    <button
                      onClick={handleUndo}
                      disabled={historyIndexRef.current <= 0}
                      className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Annuler (Ctrl+Z)"
                    >
                      <Undo className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={handleRedo}
                      disabled={historyIndexRef.current >= historyRef.current.length - 1}
                      className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Rétablir (Ctrl+Y)"
                    >
                      <Redo className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  {/* Groupe : Formatage de base */}
                  <div className="flex gap-0.5 border-r border-gray-300 pr-2">
                    <button
                      onClick={() => applyFormatting('bold')}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Gras (Ctrl+B)"
                    >
                      <Bold className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => applyFormatting('italic')}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Italique (Ctrl+I)"
                    >
                      <Italic className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => applyFormatting('underline')}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Souligné (Ctrl+U)"
                    >
                      <Underline className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => applyFormatting('strikeThrough')}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Barré"
                    >
                      <Strikethrough className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  {/* Groupe : Titres */}
                  <div className="flex gap-0.5 border-r border-gray-300 pr-2">
                    <button
                      onClick={() => applyFormatting('formatBlock', '<h1>')}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Titre 1"
                    >
                      <Heading1 className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => applyFormatting('formatBlock', '<h2>')}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Titre 2"
                    >
                      <Heading2 className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => applyFormatting('formatBlock', '<h3>')}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Titre 3"
                    >
                      <Heading3 className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => applyFormatting('formatBlock', '<p>')}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Paragraphe normal"
                    >
                      <Type className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  {/* Groupe : Alignement */}
                  <div className="flex gap-1 border-r border-gray-300 pr-2">
                    <button
                      onClick={() => applyFormatting('justifyLeft')}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Aligner à gauche"
                    >
                      <AlignLeft className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => applyFormatting('justifyCenter')}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Centrer"
                    >
                      <AlignCenter className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => applyFormatting('justifyRight')}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Aligner à droite"
                    >
                      <AlignRight className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => applyFormatting('justifyFull')}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Justifier"
                    >
                      <AlignJustify className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  {/* Groupe : Listes */}
                  <div className="flex gap-1 border-r border-gray-300 pr-2">
                    <button
                      onClick={() => applyFormatting('insertUnorderedList')}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Liste à puces"
                    >
                      <List className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => applyFormatting('insertOrderedList')}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Liste numérotée"
                    >
                      <ListOrdered className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  {/* Groupe : Autres */}
                  <div className="flex gap-1 border-r border-gray-300 pr-2">
                    <button
                      onClick={() => applyFormatting('formatBlock', '<blockquote>')}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Citation"
                    >
                      <Quote className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => applyFormatting('formatBlock', '<pre>')}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Code"
                    >
                      <Code className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => {
                        const url = prompt('Entrez l\'URL du lien:');
                        if (url) applyFormatting('createLink', url);
                      }}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Insérer un lien"
                    >
                      <Link className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  {/* Groupe : Tableaux, Images & Pages */}
                  <div className="flex gap-1 border-r border-gray-300 pr-2">
                    <button
                      onClick={() => setShowTableModal(true)}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Insérer un tableau"
                    >
                      <Table className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Insérer une image"
                    >
                      <ImageIcon className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={addNewPage}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Saut de page"
                    >
                      <FileText className="w-4 h-4 text-gray-700" />
                    </button>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          insertImage(file);
                          // Réinitialiser l'input pour permettre de sélectionner le même fichier à nouveau
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                    />
                  </div>

                  {/* Couleurs avec icônes claires */}
                  <div className="flex gap-1 border-l border-gray-300 pl-2">
                    <div className="relative">
                      <input
                        type="color"
                        id="text-color"
                        onChange={(e) => applyFormatting('foreColor', e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Couleur du texte"
                      />
                      <label htmlFor="text-color" className="flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                        <div className="relative">
                          <Type className="w-4 h-4 text-gray-700" />
                          <div className="absolute -bottom-0.5 left-0 right-0 h-1 bg-red-500 rounded-full"></div>
                        </div>
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="color"
                        id="bg-color"
                        onChange={(e) => applyFormatting('hiliteColor', e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Couleur de fond"
                      />
                      <label htmlFor="bg-color" className="flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                        <Highlighter className="w-4 h-4 text-yellow-400" />
                      </label>
                    </div>
                  </div>

                  {/* Boutons d'export */}
                  <div className="flex gap-1 border-l border-gray-300 pl-2 ml-auto">
                    <div className="relative group">
                      <button
                        className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                        title="Exporter le document"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium">Exporter</span>
                      </button>
                      
                      {/* Menu déroulant */}
                      <div className="absolute right-0 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                        <div className="bg-slate-800 border border-white/20 rounded-lg shadow-xl overflow-hidden min-w-[160px]">
                          <button
                            onClick={() => exportEditorContent('pdf')}
                            className="w-full px-4 py-2.5 flex items-center gap-3 text-white hover:bg-white/10 transition-colors text-left"
                          >
                            <FileText className="w-4 h-4 text-red-400" />
                            <span className="text-sm font-medium">PDF</span>
                          </button>
                          <button
                            onClick={() => exportEditorContent('docx')}
                            className="w-full px-4 py-2.5 flex items-center gap-3 text-white hover:bg-white/10 transition-colors text-left border-t border-white/10"
                          >
                            <FileText className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium">DOCX</span>
                          </button>
                          <button
                            onClick={() => exportEditorContent('html')}
                            className="w-full px-4 py-2.5 flex items-center gap-3 text-white hover:bg-white/10 transition-colors text-left border-t border-white/10"
                          >
                            <Code className="w-4 h-4 text-orange-400" />
                            <span className="text-sm font-medium">HTML</span>
                          </button>
                          <button
                            onClick={() => exportEditorContent('txt')}
                            className="w-full px-4 py-2.5 flex items-center gap-3 text-white hover:bg-white/10 transition-colors text-left border-t border-white/10"
                          >
                            <File className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">TXT</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Indicateur IA */}
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <p className="text-xs text-purple-600 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>💡 Sélectionnez du texte pour afficher les options d'assistance IA</span>
                  </p>
                </div>
              </div>

              {/* Zone d'édition - Style Word avec fond blanc et pages séparées */}
              <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
                <style>{`
                  /* Styles pour les images dans l'éditeur */
                  div[contenteditable] img {
                    max-width: 100%;
                    height: auto;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    margin: 10px 0;
                  }
                  div[contenteditable] img:hover {
                    transform: scale(1.02);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                  }
                  div[contenteditable] img:active {
                    cursor: move;
                  }
                  /* Styles pour les tableaux */
                  div[contenteditable] table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 10px 0;
                  }
                  div[contenteditable] table td,
                  div[contenteditable] table th {
                    border: 1px solid #333;
                    padding: 8px;
                    text-align: left;
                  }
                  div[contenteditable] table th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                  }
                  /* Limitation stricte de la hauteur A4 */
                  div[contenteditable] {
                    overflow-wrap: break-word;
                    word-break: break-word;
                  }
                  /* Style pour les sauts de page - Séparation claire entre pages */
                  div[contenteditable] .page-break {
                    display: block;
                    margin: 20px -2cm;
                    padding: 12px 0;
                    width: calc(100% + 4cm);
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    text-align: center;
                    color: white;
                    font-weight: 700;
                    font-size: 12px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    box-shadow: 0 8px 16px -4px rgba(102, 126, 234, 0.4);
                    page-break-after: always;
                    user-select: none;
                    border-top: 3px solid rgba(255,255,255,0.3);
                    border-bottom: 3px solid rgba(0,0,0,0.2);
                  }
                  /* Espacement après saut de page pour simuler nouvelle page */
                  div[contenteditable] .page-break + * {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px dashed #e0e0e0;
                  }
                  /* Conteneur d'éditeur avec pages multiples simulées */
                  .editor-pages-container {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                  }
                  /* Pseudo-élément pour simuler fin de page A4 */
                  div[contenteditable]::after {
                    content: '';
                    display: block;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #667eea, transparent);
                    margin: 20px -2cm 0;
                    width: calc(100% + 4cm);
                    opacity: 0.3;
                  }
                `}</style>
                <div
                  ref={editorRef}
                  contentEditable
                  onMouseUp={handleTextSelection}
                  onKeyUp={handleTextSelection}
                  className="max-w-[21cm] mx-auto bg-white shadow-2xl outline-none border border-gray-200 rounded-sm"
                  style={{
                    minHeight: '29.7cm',
                    height: 'auto',
                    padding: '2.5cm 2cm',
                    fontSize: '12pt',
                    lineHeight: '1.5',
                    color: '#000000',
                    fontFamily: 'Arial, sans-serif',
                    position: 'relative'
                  }}
                  suppressContentEditableWarning
                  onInput={(e) => {
                    // Supprimer le placeholder quand l'utilisateur commence à écrire
                    const target = e.currentTarget;
                    if (target.textContent && target.querySelector('p[style*="color: #999"]')) {
                      target.innerHTML = target.textContent;
                    }
                  }}
                >
                  <p style={{ color: '#999999', margin: 0, pointerEvents: 'none' }}>Commencez à écrire ici...</p>
                </div>
              </div>

              {/* Menu IA contextuel */}
              <AnimatePresence>
                {showAIMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    style={{
                      position: 'fixed',
                      left: aiMenuPosition.x,
                      top: aiMenuPosition.y,
                      transform: 'translate(-50%, -100%)',
                      zIndex: 50
                    }}
                    className="bg-slate-800 border border-purple-500/50 rounded-xl shadow-2xl p-2 min-w-[200px] relative"
                  >
                    {/* Bouton fermer */}
                    <button
                      onClick={() => {
                        setShowAIMenu(false);
                        setCustomAIPrompt('');
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                      title="Fermer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => handleAICommand('improve')}
                        className="px-3 py-2 text-sm text-left hover:bg-purple-500/20 rounded-lg transition-colors text-white flex items-center gap-2"
                      >
                        <Sparkles className="w-3 h-3" /> Améliorer
                      </button>
                      <button
                        onClick={() => handleAICommand('shorter')}
                        className="px-3 py-2 text-sm text-left hover:bg-purple-500/20 rounded-lg transition-colors text-white flex items-center gap-2"
                      >
                        <Minimize2 className="w-3 h-3" /> Réduire
                      </button>
                      <button
                        onClick={() => handleAICommand('longer')}
                        className="px-3 py-2 text-sm text-left hover:bg-purple-500/20 rounded-lg transition-colors text-white flex items-center gap-2"
                      >
                        <MoreHorizontal className="w-3 h-3" /> Développer
                      </button>
                      <button
                        onClick={() => handleAICommand('simplify')}
                        className="px-3 py-2 text-sm text-left hover:bg-purple-500/20 rounded-lg transition-colors text-white flex items-center gap-2"
                      >
                        <Type className="w-3 h-3" /> Simplifier
                      </button>
                      <button
                        onClick={() => handleAICommand('professional')}
                        className="px-3 py-2 text-sm text-left hover:bg-purple-500/20 rounded-lg transition-colors text-white flex items-center gap-2"
                      >
                        <Briefcase className="w-3 h-3" /> Pro
                      </button>
                      <button
                        onClick={() => handleAICommand('casual')}
                        className="px-3 py-2 text-sm text-left hover:bg-purple-500/20 rounded-lg transition-colors text-white flex items-center gap-2"
                      >
                        <MessageSquare className="w-3 h-3" /> Décontracté
                      </button>
                      <button
                        onClick={() => handleAICommand('fix')}
                        className="px-3 py-2 text-sm text-left hover:bg-purple-500/20 rounded-lg transition-colors text-white flex items-center gap-2"
                      >
                        <CheckCircle className="w-3 h-3" /> Corriger
                      </button>
                      <button
                        onClick={() => handleAICommand('continue')}
                        className="px-3 py-2 text-sm text-left hover:bg-purple-500/20 rounded-lg transition-colors text-white flex items-center gap-2"
                      >
                        <PlayCircle className="w-3 h-3" /> Continuer
                      </button>
                      <button
                        onClick={() => handleAICommand('translate-en')}
                        className="px-3 py-2 text-sm text-left hover:bg-purple-500/20 rounded-lg transition-colors text-white flex items-center gap-2"
                      >
                        <Globe className="w-3 h-3" /> 🇬🇧 EN
                      </button>
                      <button
                        onClick={() => handleAICommand('translate-fr')}
                        className="px-3 py-2 text-sm text-left hover:bg-purple-500/20 rounded-lg transition-colors text-white flex items-center gap-2"
                      >
                        <Globe className="w-3 h-3" /> 🇫🇷 FR
                      </button>
                    </div>
                    
                    {/* Commande personnalisée */}
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <p className="text-xs text-purple-300 mb-2 flex items-center gap-1">
                        <Wand2 className="w-3 h-3" />
                        <span>Commande personnalisée :</span>
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customAIPrompt}
                          onChange={(e) => setCustomAIPrompt(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && customAIPrompt.trim()) {
                              handleAICommand('custom');
                            }
                          }}
                          placeholder="Ex: Ajoute un titre, crée un tableau..."
                          className="flex-1 px-2 py-1.5 bg-white/10 border border-white/20 rounded text-white text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          disabled={isProcessingAI}
                          autoComplete="off"
                        />
                        <button
                          onClick={() => handleAICommand('custom')}
                          disabled={!customAIPrompt.trim() || isProcessingAI}
                          className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded text-xs hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1"
                        >
                          {isProcessingAI ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      {isProcessingAI && (
                        <p className="text-xs text-yellow-300 mt-2 animate-pulse">
                          ⚡ En cours...
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setShowAIMenu(false)}
                      className="w-full mt-2 px-3 py-2 text-xs bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors text-red-300"
                    >
                      Fermer
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Modal pour insérer un tableau */}
              <AnimatePresence>
                {showTableModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowTableModal(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Table className="w-5 h-5 text-purple-600" />
                        Insérer un tableau
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre de lignes
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={tableRows}
                            onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black font-semibold"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre de colonnes
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={tableCols}
                            onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black font-semibold"
                          />
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600">
                            📋 Le tableau aura <span className="font-semibold text-purple-600">{tableRows} lignes</span> et <span className="font-semibold text-purple-600">{tableCols} colonnes</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => setShowTableModal(false)}
                          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={insertTable}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                        >
                          Insérer
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : messages.length === 0 ? (
            // Projet sélectionné mais vide - Afficher message d'accueil selon le type
            <div className="flex items-center justify-center h-full">
              <div className="max-w-2xl text-center px-6">
                {(() => {
                  const projectTypeInfo = PROJECT_TYPES.find(t => t.id === (selectedProject.project_type || 'chatbot'));
                  if (!projectTypeInfo) return null;
                  
                  const Icon = projectTypeInfo.icon;
                  
                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${projectTypeInfo.gradient} mb-4`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      
                      <h2 className="text-3xl font-bold text-white">
                        {selectedProject.title}
                      </h2>
                      
                      {selectedProject.description && (
                        <p className="text-lg text-gray-300">
                          {selectedProject.description}
                        </p>
                      )}
                      
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                          <span>{projectTypeInfo.emoji}</span>
                          <span>{projectTypeInfo.name}</span>
                        </h3>
                        <p className="text-gray-300 mb-4">
                          {projectTypeInfo.description}
                        </p>
                        
                        {projectTypeInfo.features && projectTypeInfo.features.length > 0 && (
                          <div className="space-y-2 text-left">
                            <p className="text-sm font-semibold text-purple-300">
                              ✨ Fonctionnalités :
                            </p>
                            <ul className="text-sm text-gray-400 space-y-1">
                              {projectTypeInfo.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-purple-400">•</span>
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-400 text-sm">
                        💬 Commencez à taper votre message ci-dessous pour démarrer !
                      </p>
                    </motion.div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
                >
                  <div className="relative w-full">
                    <div
                      className={`w-full px-6 py-4 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/10 text-white backdrop-blur-xl'
                      }`}
                      dir={isArabicText(msg.content) ? 'rtl' : 'ltr'}
                      style={{ textAlign: isArabicText(msg.content) ? 'right' : 'left' }}
                    >
                      {/* Afficher les images si présentes */}
                      {msg.images && msg.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {msg.images.map((img, imgIdx) => (
                            <img
                              key={imgIdx}
                              src={img}
                              alt="Uploaded"
                              onClick={() => setZoomedImage(img)}
                              className="max-w-xs rounded-lg border border-white/20 cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200"
                              title="Cliquer pour agrandir"
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Mode édition */}
                      {editingMessageIndex === idx ? (
                        <div className="space-y-2">
                          <textarea
                            ref={editTextareaRef}
                            value={editedContent}
                            onChange={(e) => {
                              setEditedContent(e.target.value);
                              adjustTextareaHeight();
                            }}
                            rows={Math.max(3, editedContent.split('\n').length)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white resize-y focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
                            dir={isArabicText(editedContent) ? 'rtl' : 'ltr'}
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={cancelEditMessage}
                              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={saveEditMessage}
                              className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                            >
                              Sauvegarder
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="prose prose-invert max-w-none"
                          style={{ 
                            direction: isArabicText(msg.content) ? 'rtl' : 'ltr',
                            textAlign: isArabicText(msg.content) ? 'right' : 'left',
                            unicodeBidi: 'embed'
                          }}
                        >
                          <ReactMarkdown
                            components={{
                              // Style personnalisé pour les éléments markdown
                              h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 mt-6" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 mt-5" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2 mt-4" {...props} />,
                              h4: ({node, ...props}) => <h4 className="text-base font-bold mb-2 mt-3" {...props} />,
                              p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-bold text-purple-200" {...props} />,
                              em: ({node, ...props}) => <em className="italic text-pink-200" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
                              li: ({node, ...props}) => <li className="ml-4" {...props} />,
                              code: ({node, inline, className, children, ...props}: any) => {
                                const match = /language-(\w+)/.exec(className || '');
                                const language = match ? match[1] : '';
                                const value = String(children).replace(/\n$/, '');
                                
                                return !inline && language ? (
                                  <CodeBlock language={language} value={value} />
                                ) : inline ? (
                                  <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <code className="block bg-slate-800 p-3 rounded-lg my-2 overflow-x-auto font-mono text-sm" {...props}>
                                    {children}
                                  </code>
                                );
                              },
                              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-500 pl-4 italic my-3" {...props} />,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    
                    {/* Boutons d'action (apparaissent au hover) */}
                    {editingMessageIndex !== idx && (
                      <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => speakMessage(msg.content, idx)}
                          className={`p-1.5 ${
                            speakingMessageIndex === idx 
                              ? 'bg-orange-500 hover:bg-orange-600 animate-pulse' 
                              : 'bg-purple-500 hover:bg-purple-600'
                          } text-white rounded-full shadow-lg transition-colors`}
                          title={speakingMessageIndex === idx ? "Arrêter la lecture" : "Lire à haute voix"}
                        >
                          {speakingMessageIndex === idx ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => copyMessageToClipboard(msg.content, idx)}
                          className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-colors"
                          title="Copier le message"
                        >
                          {copiedMessageIndex === idx ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => startEditMessage(idx)}
                          className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors"
                          title="Éditer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteMessage(idx)}
                          className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {/* Indicateur de typing - Trois points animés */}
              {isGenerating && !streamingContent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-start"
                >
                  <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/10 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                        <Sparkles className="w-5 h-5 text-white animate-pulse" />
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="w-2.5 h-2.5 bg-purple-400 rounded-full typing-dot-1 shadow-sm"></span>
                        <span className="w-2.5 h-2.5 bg-purple-400 rounded-full typing-dot-2 shadow-sm"></span>
                        <span className="w-2.5 h-2.5 bg-purple-400 rounded-full typing-dot-3 shadow-sm"></span>
                      </div>
                      <span className="text-xs text-gray-400 font-medium ml-1">L'IA réfléchit...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Streaming en temps réel - Animation de machine à écrire */}
              {streamingContent && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div 
                    className="max-w-3xl px-6 py-4 rounded-2xl bg-white/10 text-white backdrop-blur-xl"
                    dir={isArabicText(streamingContent) ? 'rtl' : 'ltr'}
                    style={{ textAlign: isArabicText(streamingContent) ? 'right' : 'left' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                      <span className="text-sm text-purple-400 font-medium">En train d'écrire...</span>
                    </div>
                    <div 
                      className="prose prose-invert max-w-none"
                      style={{ 
                        direction: isArabicText(streamingContent) ? 'rtl' : 'ltr',
                        textAlign: isArabicText(streamingContent) ? 'right' : 'left',
                        unicodeBidi: 'embed'
                      }}
                    >
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 mt-6" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 mt-5" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2 mt-4" {...props} />,
                          h4: ({node, ...props}) => <h4 className="text-base font-bold mb-2 mt-3" {...props} />,
                          p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-purple-200" {...props} />,
                          em: ({node, ...props}) => <em className="italic text-pink-200" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li className="ml-4" {...props} />,
                          code: ({node, inline, className, children, ...props}: any) => {
                            const match = /language-(\w+)/.exec(className || '');
                            const language = match ? match[1] : '';
                            const value = String(children).replace(/\n$/, '');
                            
                            return !inline && language ? (
                              <CodeBlock language={language} value={value} />
                            ) : inline ? (
                              <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                {children}
                              </code>
                            ) : (
                              <code className="block bg-slate-800 p-3 rounded-lg my-2 overflow-x-auto font-mono text-sm" {...props}>
                                {children}
                              </code>
                            );
                          },
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-500 pl-4 italic my-3" {...props} />,
                        }}
                      >
                        {streamingContent}
                      </ReactMarkdown>
                      <span className="inline-block w-0.5 h-5 bg-purple-400 animate-pulse ml-0.5 align-middle" style={{ animation: 'blink 1s infinite' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        {selectedProject && (
          <div className="p-3 md:p-6 bg-slate-800/50 backdrop-blur-xl border-t border-white/10 flex-shrink-0">
            {/* Prévisualisation des images uploadées */}
            {uploadedImages.length > 0 && (
              <div className="mb-3 md:mb-4 flex flex-wrap gap-2">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img}
                      alt="Preview"
                      onClick={() => setZoomedImage(img)}
                      className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border border-white/20 cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200"
                      title="Cliquer pour agrandir"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Fichiers uploadés (PDF, TXT, etc.) */}
            {uploadedFiles.length > 0 && (
              <div className="mb-3 md:mb-4 flex flex-wrap gap-2">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="relative group">
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors">
                      <File className="w-5 h-5 text-blue-400" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white truncate max-w-[150px]" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {file.type === 'pdf' ? 'PDF' : 'Texte'}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        className="ml-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        title="Retirer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Générateur d'images IA - Visible uniquement pour le Studio d'Images IA */}
            {selectedProject?.project_type === 'image-studio' && (
              <div className="mb-3 flex gap-2">
                <input
                  type="text"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isGeneratingImage && generateImage()}
                  placeholder="🎨 Décrivez l'image à générer..."
                  className="flex-1 px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-0"
                  disabled={isGeneratingImage}
                />
                <button
                  onClick={() => generateImage()}
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                  className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1 flex-shrink-0 min-w-[80px]"
                  title="Générer une image IA"
                >
                  {isGeneratingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                  <span className="text-xs md:text-sm font-medium">Générer</span>
                </button>
              </div>
            )}

            <div className="space-y-2">
              {/* Indicateurs contextuels selon le type de projet */}
              {selectedProject?.project_type === 'social-media' && inputMessage && (
                <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-gray-400">Caractères:</span>
                  <span className={`text-sm font-medium ${inputMessage.length > 280 ? 'text-red-400' : inputMessage.length > 240 ? 'text-orange-400' : 'text-green-400'}`}>
                    {inputMessage.length} / 280 {inputMessage.length > 280 && '(Twitter dépassé)'}
                  </span>
                </div>
              )}
              
              {selectedProject?.project_type === 'image-studio' && (
                <div className="px-3 py-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg border border-pink-500/20">
                  <p className="text-sm text-pink-300 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Mode Studio: Décrivez l'image que vous souhaitez créer ou modifier
                  </p>
                </div>
              )}
              
              {selectedProject?.project_type === 'prompt-generator' && (
                <div className="px-3 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
                  <p className="text-sm text-amber-300 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Collez votre prompt à améliorer ou décrivez ce que vous voulez créer
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                {/* Input caché pour les images */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                {/* Input caché pour les fichiers (PDF, texte, etc.) */}
                <input
                  type="file"
                  ref={pdfInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.txt,.md,text/plain,application/pdf"
                  multiple
                  className="hidden"
                />
                {/* Bouton Clips (remplace images + fichiers) */}
                <div className="relative group">
                  <button
                    disabled={isGenerating}
                    className="px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 disabled:opacity-50 transition-colors flex-shrink-0"
                    title="Ajouter des fichiers"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  {/* Menu déroulant au survol */}
                  <div className="absolute bottom-full left-0 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="bg-slate-800 border border-white/20 rounded-lg shadow-xl overflow-hidden min-w-[180px]">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isGenerating}
                        className="w-full px-4 py-2.5 flex items-center gap-3 text-white hover:bg-white/10 disabled:opacity-50 transition-colors text-left"
                      >
                        <ImageIcon className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium">Images</span>
                      </button>
                      <button
                        onClick={() => pdfInputRef.current?.click()}
                        disabled={isGenerating}
                        className="w-full px-4 py-2.5 flex items-center gap-3 text-white hover:bg-white/10 disabled:opacity-50 transition-colors text-left border-t border-white/10"
                      >
                        <File className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium">PDF / Texte</span>
                      </button>
                    </div>
                  </div>
                </div>
                {/* Bouton d'enregistrement vocal rapide */}
                <button
                  onMouseDown={startQuickRecording}
                  onMouseUp={stopQuickRecording}
                  onMouseLeave={() => isQuickRecording && stopQuickRecording()}
                  onTouchStart={startQuickRecording}
                  onTouchEnd={stopQuickRecording}
                  disabled={isGenerating || isTranscribing}
                  className={`px-3 py-3 border rounded-xl text-white transition-all flex-shrink-0 ${
                    isQuickRecording 
                      ? 'bg-red-500 border-red-400 animate-pulse shadow-lg shadow-red-500/50' 
                      : isTranscribing
                      ? 'bg-yellow-500 border-yellow-400 animate-pulse'
                      : 'bg-white/10 border-white/20 hover:bg-purple-500/20 hover:border-purple-400'
                  } disabled:opacity-50`}
                  title={isQuickRecording ? "Relâchez pour transcrire" : isTranscribing ? "Transcription en cours..." : "Maintenir pour enregistrer un message vocal"}
                >
                  {isTranscribing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Mic className={`w-5 h-5 ${isQuickRecording ? 'animate-pulse' : ''}`} />
                  )}
                </button>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  onPaste={handlePaste}
                  placeholder={
                    selectedProject?.project_type === 'image-studio' ? "Décrivez l'image à créer..." :
                    selectedProject?.project_type === 'social-media' ? "Rédigez votre post (max 280 car.)..." :
                    selectedProject?.project_type === 'emails' ? "Décrivez l'email à rédiger..." :
                    selectedProject?.project_type === 'translation' ? "Texte à traduire..." :
                    selectedProject?.project_type === 'prompt-generator' ? "Collez votre prompt à améliorer..." :
                    "Tapez votre message, collez une image (Ctrl+V) ou ajoutez un PDF..."
                  }
                  className="flex-1 px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm min-w-0"
                  disabled={isGenerating}
                  title="Vous pouvez coller des images directement avec Ctrl+V (ou Cmd+V sur Mac)"
                />
                {isGenerating ? (
                  <button
                    onClick={stopGeneration}
                    className="px-3 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors flex items-center justify-center font-medium flex-shrink-0 min-w-[50px]"
                    title="Arrêter"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() && uploadedImages.length === 0}
                    className="px-3 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center flex-shrink-0 min-w-[50px]"
                    title="Envoyer"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Lightbox pour Zoom d'Image */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setZoomedImage(null)}
            onKeyDown={(e) => e.key === 'Escape' && setZoomedImage(null)}
          >
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
              title="Fermer (Esc)"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={zoomedImage}
                alt="Image agrandie"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Nouveau Projet */}
      <AnimatePresence>
        {showNewProjectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewProjectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 p-4 md:p-6 rounded-2xl w-full max-w-4xl mx-auto max-h-[85vh] overflow-y-auto"
            >
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4">✨ Nouveau Projet</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createNewProject(
                    formData.get('title') as string,
                    formData.get('description') as string,
                    formData.get('projectType') as ProjectType
                  );
                }}
              >
                {/* Sélecteur de type de projet */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Choisissez le type de projet
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-slate-700">
                    {PROJECT_TYPES.map((type) => {
                      const Icon = type.icon;
                      const colorClasses = {
                        blue: 'peer-checked:border-blue-500 peer-checked:bg-blue-500/10 hover:border-blue-400/50',
                        purple: 'peer-checked:border-purple-500 peer-checked:bg-purple-500/10 hover:border-purple-400/50',
                        violet: 'peer-checked:border-violet-500 peer-checked:bg-violet-500/10 hover:border-violet-400/50',
                        pink: 'peer-checked:border-pink-500 peer-checked:bg-pink-500/10 hover:border-pink-400/50',
                        orange: 'peer-checked:border-orange-500 peer-checked:bg-orange-500/10 hover:border-orange-400/50',
                        green: 'peer-checked:border-green-500 peer-checked:bg-green-500/10 hover:border-green-400/50',
                        indigo: 'peer-checked:border-indigo-500 peer-checked:bg-indigo-500/10 hover:border-indigo-400/50',
                        cyan: 'peer-checked:border-cyan-500 peer-checked:bg-cyan-500/10 hover:border-cyan-400/50',
                        teal: 'peer-checked:border-teal-500 peer-checked:bg-teal-500/10 hover:border-teal-400/50',
                        amber: 'peer-checked:border-amber-500 peer-checked:bg-amber-500/10 hover:border-amber-400/50',
                        slate: 'peer-checked:border-slate-500 peer-checked:bg-slate-500/10 hover:border-slate-400/50',
                        emerald: 'peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 hover:border-emerald-400/50',
                      };
                      
                      return (
                        <label key={type.id} className="relative cursor-pointer group">
                          <input
                            type="radio"
                            name="projectType"
                            value={type.id}
                            defaultChecked={type.id === 'chatbot'}
                            className="peer sr-only"
                          />
                          <div className={`p-3 md:p-4 bg-white/5 border-2 border-white/20 rounded-xl transition-all hover:scale-105 ${colorClasses[type.color as keyof typeof colorClasses]}`}>
                            <div className="flex flex-col gap-1 mb-1.5">
                              <span className="text-xl md:text-2xl">{type.emoji}</span>
                              <span className="font-semibold text-white text-xs md:text-sm leading-tight">{type.name}</span>
                            </div>
                            <p className="text-xs text-gray-400 leading-snug line-clamp-2">
                              {type.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <input
                    name="title"
                    type="text"
                    placeholder="Titre du projet"
                    required
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <textarea
                    name="description"
                    placeholder="Description (optionnel)"
                    rows={2}
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewProjectModal(false)}
                    className="flex-1 px-4 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-sm border-t border-white/10 py-2 px-3 md:py-3 md:px-6 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              MemoGenie 🤖
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">© 2025</span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-xs md:text-sm text-gray-400 hidden sm:inline">
              Par <span className="text-purple-400 font-semibold">Ahmad Ahmad</span>
            </span>
            <a
              href="https://github.com/ahmedooo1?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
              title="Voir mes projets GitHub"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span className="text-xs md:text-sm text-gray-400 group-hover:text-white transition-colors hidden md:inline">GitHub</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Confirmation Dialog Modal */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={() => confirmDialog.onCancel()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl shadow-2xl border border-white/10 max-w-md w-full overflow-hidden"
            >
              {/* Header avec couleur selon type */}
              <div className={`p-6 border-b border-white/10 ${
                confirmDialog.type === 'danger' 
                  ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20' 
                  : confirmDialog.type === 'warning'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20'
                  : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20'
              }`}>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  {confirmDialog.title}
                </h3>
              </div>
              
              {/* Body */}
              <div className="p-6">
                <p className="text-gray-300 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
              
              {/* Footer avec boutons */}
              <div className="p-6 bg-slate-900/50 border-t border-white/10 flex gap-3">
                <button
                  onClick={confirmDialog.onCancel}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-white rounded-lg transition-colors font-medium"
                >
                  {confirmDialog.cancelText || 'Annuler'}
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className={`flex-1 px-4 py-3 text-white rounded-lg transition-opacity font-medium ${
                    confirmDialog.type === 'danger'
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90'
                      : confirmDialog.type === 'warning'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90'
                  }`}
                >
                  {confirmDialog.confirmText || 'Confirmer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Dialog Modal */}
      <AnimatePresence>
        {inputDialog.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={() => inputDialog.onCancel()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl shadow-2xl border border-white/10 max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  {inputDialog.title}
                </h3>
                {inputDialog.message && (
                  <p className="text-gray-300 text-sm mt-2">{inputDialog.message}</p>
                )}
              </div>
              
              {/* Body avec Input */}
              <div className="p-6">
                <input
                  type="text"
                  value={inputDialogValue}
                  onChange={(e) => setInputDialogValue(e.target.value)}
                  placeholder={inputDialog.placeholder}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputDialogValue.trim()) {
                      inputDialog.onConfirm(inputDialogValue.trim());
                    } else if (e.key === 'Escape') {
                      inputDialog.onCancel();
                    }
                  }}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              
              {/* Footer avec boutons */}
              <div className="p-6 bg-slate-900/50 border-t border-white/10 flex gap-3">
                <button
                  onClick={inputDialog.onCancel}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-white rounded-lg transition-colors font-medium"
                >
                  {inputDialog.cancelText || 'Annuler'}
                </button>
                <button
                  onClick={() => {
                    if (inputDialogValue.trim()) {
                      inputDialog.onConfirm(inputDialogValue.trim());
                    }
                  }}
                  disabled={!inputDialogValue.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg transition-opacity font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {inputDialog.confirmText || 'OK'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.8 }}
              className={`
                flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl backdrop-blur-xl border
                min-w-[320px] max-w-md
                ${toast.type === 'success' 
                  ? 'bg-emerald-500/90 border-emerald-400/50 text-white' 
                  : toast.type === 'error'
                  ? 'bg-red-500/90 border-red-400/50 text-white'
                  : toast.type === 'warning'
                  ? 'bg-amber-500/90 border-amber-400/50 text-white'
                  : 'bg-blue-500/90 border-blue-400/50 text-white'
                }
              `}
            >
              <div className="flex-shrink-0">
                {toast.type === 'success' && <CheckCircle className="w-6 h-6" />}
                {toast.type === 'error' && <XCircle className="w-6 h-6" />}
                {toast.type === 'warning' && <AlertCircle className="w-6 h-6" />}
                {toast.type === 'info' && <Info className="w-6 h-6" />}
              </div>
              <p className="flex-1 font-medium text-sm leading-snug">{toast.message}</p>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Overlay Appel Vocal */}
      <AnimatePresence>
        {isVoiceCallActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center"
            onClick={(e) => {
              // Ne rien faire si on clique sur le fond
              // (éviter de fermer accidentellement l'appel)
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Titre */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Appel Vocal</h2>
                <p className="text-gray-300 text-sm">Conversation en temps réel avec l'IA</p>
              </div>

              {/* Animation du micro / ondes sonores */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  {/* Cercle principal */}
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isPushingToTalk 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse shadow-lg shadow-green-500/50' 
                      : isAISpeaking 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse shadow-lg shadow-purple-500/50'
                      : 'bg-gradient-to-r from-gray-600 to-gray-700'
                  }`}>
                    {isPushingToTalk ? (
                      <Mic className="w-16 h-16 text-white" />
                    ) : isAISpeaking ? (
                      <Radio className="w-16 h-16 text-white animate-spin" />
                    ) : (
                      <MicOff className="w-16 h-16 text-white" />
                    )}
                  </div>

                  {/* Ondes sonores animées */}
                  {isPushingToTalk && (
                    <>
                      <div className="absolute inset-0 rounded-full border-4 border-green-400 opacity-75 animate-ping"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-green-300 opacity-50 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                    </>
                  )}
                  
                  {isAISpeaking && (
                    <>
                      <div className="absolute inset-0 rounded-full border-4 border-purple-400 opacity-75 animate-ping"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-pink-300 opacity-50 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                    </>
                  )}
                </div>
              </div>

              {/* Statut */}
              <div className="text-center mb-8">
                <p className="text-white text-xl font-bold mb-2">
                  {isAISpeaking 
                    ? '🤖 L\'IA parle... (Appuyez pour interrompre)' 
                    : isTranscribing 
                    ? '🔄 Transcription en cours...'
                    : isPushingToTalk 
                    ? '🎤 Enregistrement...' 
                    : '✋ Prêt à parler'}
                </p>
                {voiceTranscript && !isTranscribing && (
                  <p className="text-purple-300 text-sm mt-2 italic">"{voiceTranscript}"</p>
                )}
              </div>

              {/* Bouton Push-to-Talk GÉANT au centre */}
              <div className="flex flex-col items-center gap-6 mb-8">
                <button
                  onMouseDown={startPushToTalk}
                  onMouseUp={stopPushToTalk}
                  onTouchStart={startPushToTalk}
                  onTouchEnd={stopPushToTalk}
                  disabled={isTranscribing}
                  className={`relative w-40 h-40 rounded-full transition-all duration-200 shadow-2xl cursor-pointer active:scale-90 ${
                    isTranscribing
                      ? 'bg-gradient-to-br from-yellow-500 to-orange-500 animate-pulse cursor-wait'
                      : isPushingToTalk
                      ? 'bg-gradient-to-br from-red-500 to-pink-600 scale-95'
                      : isAISpeaking
                      ? 'bg-gradient-to-br from-orange-500 to-red-600 hover:scale-105 animate-pulse'
                      : 'bg-gradient-to-br from-purple-500 to-blue-600 hover:scale-105'
                  }`}
                  title={
                    isTranscribing 
                      ? "Transcription en cours..." 
                      : isAISpeaking 
                      ? "Appuyez pour interrompre l'IA" 
                      : "Maintenez pour enregistrer"
                  }
                >
                  {isTranscribing ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-white font-bold text-sm mt-2">Analyse...</p>
                    </div>
                  ) : isPushingToTalk ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Mic className="w-16 h-16 text-white animate-pulse" />
                      <p className="text-white font-bold text-sm mt-2">Relâchez</p>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Mic className="w-16 h-16 text-white" />
                      <p className="text-white font-bold text-sm mt-2">Appuyez</p>
                    </div>
                  )}
                </button>

                <p className="text-gray-300 text-center max-w-xs">
                  {isAISpeaking 
                    ? "� Appuyez sur le bouton pour interrompre et parler !"
                    : "👆 Maintenez le bouton et parlez, relâchez pour envoyer"
                  }
                </p>
              </div>

              {/* Bouton Raccrocher en bas */}
              <div className="flex justify-center">
                <button
                  onClick={endVoiceCall}
                  className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-all shadow-lg flex items-center gap-2"
                  title="Terminer l'appel"
                >
                  <PhoneOff className="w-5 h-5" />
                  Raccrocher
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panneau de paramètres de lecture vocale - Rendu avec portail */}
      {showSpeechSettings && speechButtonRef && typeof window !== 'undefined' && createPortal(
        <div 
          className="speech-settings-panel fixed bg-slate-800 border border-white/20 rounded-xl shadow-2xl p-4 z-[9999]"
          style={{
            top: `${(speechButtonRef?.getBoundingClientRect().bottom || 0) + 8}px`,
            right: `${window.innerWidth - (speechButtonRef?.getBoundingClientRect().right || 0)}px`,
            width: '288px'
          }}
        >
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Paramètres vocaux
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center justify-between text-sm text-gray-300 mb-2">
                <span>Vitesse de lecture</span>
                <span className="text-purple-400 font-medium">{speechRate.toFixed(1)}x</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Lent</span>
                <span>Normal</span>
                <span>Rapide</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setSpeechRate(0.75)}
                className="flex-1 px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                0.75x
              </button>
              <button
                onClick={() => setSpeechRate(1.0)}
                className="flex-1 px-3 py-1.5 text-xs bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors text-purple-400 font-medium"
              >
                1.0x
              </button>
              <button
                onClick={() => setSpeechRate(1.25)}
                className="flex-1 px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                1.25x
              </button>
              <button
                onClick={() => setSpeechRate(1.5)}
                className="flex-1 px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                1.5x
              </button>
            </div>
            
            <div className="pt-3 border-t border-white/10">
              <p className="text-xs text-gray-400">
                💡 Astuce : Utilisez des vitesses plus lentes pour l'apprentissage ou des vitesses plus rapides pour gagner du temps.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
