'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun } from 'docx';
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
  AlertCircle,
  Info,
  Menu,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description?: string;
}

interface Chapter {
  id: number;
  project_id: number;
  title: string;
  order_index: number;
  content: string;
}

interface Message {
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
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Charger les projets au démarrage
  useEffect(() => {
    loadProjects();
  }, []);

  // Charger les chapitres et conversations quand un projet est sélectionné
  useEffect(() => {
    if (selectedProject) {
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

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects');
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

  const createNewProject = async (title: string, description: string, projectType: 'memoir' | 'chatbot' = 'memoir') => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, projectType }),
      });
      const newProject = await res.json();
      setProjects([...projects, newProject]);
      setSelectedProject(newProject);
      setShowNewProjectModal(false);
    } catch (error) {
      console.error('Erreur:', error);
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

  const deleteMessage = (index: number) => {
    showConfirm(
      '🗑️ Supprimer le message',
      'Êtes-vous sûr de vouloir supprimer ce message ?',
      () => {
        setMessages(messages.filter((_, i) => i !== index));
        showToast('success', '✅ Message supprimé');
      },
      'danger',
      'Supprimer',
      'Annuler'
    );
  };

  const startEditMessage = (index: number) => {
    setEditingMessageIndex(index);
    setEditedContent(messages[index].content);
    
    // Ajuster la hauteur du textarea après le rendu
    setTimeout(() => {
      if (editTextareaRef.current) {
        editTextareaRef.current.style.height = 'auto';
        editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;
      }
    }, 0);
  };

  const adjustTextareaHeight = () => {
    if (editTextareaRef.current) {
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;
    }
  };

  const saveEditMessage = () => {
    if (editingMessageIndex !== null) {
      const updatedMessages = [...messages];
      updatedMessages[editingMessageIndex].content = editedContent;
      setMessages(updatedMessages);
      setEditingMessageIndex(null);
      setEditedContent('');
    }
  };

  const cancelEditMessage = () => {
    setEditingMessageIndex(null);
    setEditedContent('');
  };

  const clearConversation = () => {
    showConfirm(
      '🗑️ Vider la conversation',
      'Êtes-vous sûr de vouloir supprimer toute la conversation ? Cette action est irréversible.',
      () => {
        setMessages([]);
        setUploadedImages([]);
        showToast('success', '✅ Conversation effacée');
      },
      'danger',
      'Vider',
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
        
        let headingLevel = HeadingLevel.HEADING_1;
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
                    text: '[Image non disponible]',
                    italics: true,
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
    if ((!inputMessage.trim() && uploadedImages.length === 0) || !selectedProject || isGenerating) return;

    const userMessage: Message = { 
      role: 'user', 
      content: inputMessage || "Analyse cette image",
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
          message: inputMessage || "Analyse cette image",
          chapterId: selectedChapter?.id,
          images: uploadedImages.length > 0 ? uploadedImages : undefined,
        }),
        signal: controller.signal,
      });
      
      setUploadedImages([]); // Clear images after sending

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
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-12">
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
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">{project.title}</h3>
                    {/* Badge Type de Projet */}
                    {project.project_type === 'chatbot' ? (
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Chatbot
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Mémoire
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-gray-400 text-sm mt-1">{project.description}</p>
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
                <Plus className="w-4 h-4 text-white" />
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
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
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
                            <Sparkles className="w-4 h-4 text-white" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-white" />
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
                  Bienvenue dans votre Assistant Mémoire IA
                </h2>
                <p className="text-gray-400">
                  Créez un projet pour commencer la rédaction
                </p>
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
                  <div className="relative">
                    <div
                      className={`max-w-3xl px-6 py-4 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/10 text-white backdrop-blur-xl'
                      }`}
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
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
                            style={{ minHeight: '100px' }}
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={cancelEditMessage}
                              className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
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
                        <div className="prose prose-invert max-w-none">
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
                  <div className="max-w-3xl px-6 py-4 rounded-2xl bg-white/10 text-white backdrop-blur-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                      <span className="text-sm text-purple-400 font-medium">En train d'écrire...</span>
                    </div>
                    <div className="prose prose-invert max-w-none">
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
            
            {/* Générateur d'images IA */}
            <div className="mb-3 flex gap-2">
              <input
                type="text"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isGeneratingImage && generateImage()}
                placeholder="🎨 Image IA..."
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

            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isGenerating}
                className="px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 disabled:opacity-50 transition-colors flex-shrink-0"
                title="Ajouter des images"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                onPaste={handlePaste}
                placeholder="Tapez votre message ou collez une image (Ctrl+V)..."
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
              className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowNewProjectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 p-8 rounded-2xl max-w-md w-full mx-4"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Nouveau Projet</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createNewProject(
                    formData.get('title') as string,
                    formData.get('description') as string,
                    formData.get('projectType') as 'memoir' | 'chatbot'
                  );
                }}
              >
                {/* Sélecteur de type de projet */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Type de projet
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="projectType"
                        value="memoir"
                        defaultChecked
                        className="peer sr-only"
                      />
                      <div className="p-4 bg-white/5 border-2 border-white/20 rounded-lg hover:bg-white/10 transition-all peer-checked:border-purple-500 peer-checked:bg-purple-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-5 h-5 text-purple-400" />
                          <span className="font-semibold text-white">Mémoire</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Assistant académique pour rédiger un mémoire structuré et cohérent
                        </p>
                      </div>
                    </label>
                    
                    <label className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="projectType"
                        value="chatbot"
                        className="peer sr-only"
                      />
                      <div className="p-4 bg-white/5 border-2 border-white/20 rounded-lg hover:bg-white/10 transition-all peer-checked:border-blue-500 peer-checked:bg-blue-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5 text-blue-400" />
                          <span className="font-semibold text-white">Chatbot</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Assistant général pour répondre à toutes vos questions
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <input
                  name="title"
                  type="text"
                  placeholder="Titre du projet"
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                />
                <textarea
                  name="description"
                  placeholder="Description (optionnel)"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-6 resize-none"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewProjectModal(false)}
                    className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
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
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
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
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
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
    </div>
  );
}
