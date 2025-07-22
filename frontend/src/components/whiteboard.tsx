import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import api from '../api';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import garland1 from '../assets/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcGYtczYyLXBvbS0wNzMxLXRlZGR5LWpvZHMucG5n-removebg-preview.png';
import marigoldGarland from '../assets/transparent-flower-arrangement-symmetrical-marigold-garland-on-dark-background6607c6f2040c06.15089414-removebg-preview.png';
import table1 from '../assets/5e053f7cb0da2910351bb80178095857-removebg-preview.png';
import table2 from '../assets/images-removebg-preview.png';
import table3 from '../assets/WhatsApp_Image_2025-07-09_at_11.17.18-removebg-preview.png';
import candle from '../assets/candle.png';
import deep1 from '../assets/deep1.png';
import deep2 from '../assets/deep2.png';
import FramesSection from './FramesSection';
import ShareModal from './ShareModal';
import { FaSignOutAlt, FaShareAlt, FaArrowUp, FaTachometerAlt, FaEdit, FaTrash } from 'react-icons/fa';

// Helper to get absolute avatar URL
const getAvatarUrl = (avatar: string | null | undefined): string => {
  if (!avatar) return '';
  if (avatar.startsWith('http')) return avatar;
  return `http://localhost:5001/${avatar.replace(/^\/+/, '')}`;
};

interface ImageItem {
  id: number;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape?: 'rectangle' | 'circle';
}

interface Board {
  _id: string;
  name: string;
  content: any;
  user: string; // Add this line to fix linter errors for board.user
}

const API_URL = 'http://localhost:5001/api';

// Preloaded decor images
const PRELOADED_DECORS = [
  { src: '/src/assets/react.svg', name: 'React Logo' },
  // Add more preloaded PNG/WebP paths here
];

// Add default decors 
const DEFAULT_DECORS = [
  { src: garland1, name: 'Flower Garland 1' },
  { src: marigoldGarland, name: 'Marigold Garland' },
  { src: table1, name: 'Table 1' },
  { src: table2, name: 'Table 2' },
  { src: table3, name: 'Table 3' },
  { src: candle, name: 'Candle' },
  { src: deep1, name: 'Deep 1' },
  { src: deep2, name: 'Deep 2' },
];

// Frame type for board
interface CanvasFrame {
  id: number;
  frameSrc: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageSrc?: string;
}

// Add explicit types for SettingsModal props
interface SettingsModalProps {
  settingsOpen: boolean;
  settingsUsername: string;
  setSettingsUsername: (v: string) => void;
  settingsPassword: string;
  setSettingsPassword: (v: string) => void;
  settingsAvatarPreview: string | null;
  setSettingsAvatarPreview: (v: string | null) => void;
  userAvatar: string | null;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  settingsError: string;
  settingsSuccess: string;
  settingsChanged: boolean;
  setSettingsChanged: (v: boolean) => void;
  settingsLoading: boolean;
  handleSaveSettings: (e: React.FormEvent) => void;
  passwordInputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  showPasswordInput: boolean;
  setShowPasswordInput: (v: boolean) => void;
  plan: string;
  setSettingsAvatar: (v: string | null) => void;
  setSettingsAvatarFile: (v: File | null) => void;
  setUserAvatar: (v: string | null) => void;
}

function SettingsModal({
  settingsOpen,
  settingsUsername,
  setSettingsUsername,
  settingsPassword,
  setSettingsPassword,
  settingsAvatarPreview,
  setSettingsAvatarPreview,
  userAvatar,
  handleAvatarChange,
  settingsError,
  settingsSuccess,
  settingsChanged,
  setSettingsChanged,
  settingsLoading,
  handleSaveSettings,
  passwordInputRef,
  onClose,
  showPasswordInput,
  setShowPasswordInput,
  plan,
  setSettingsAvatar,
  setSettingsAvatarFile,
  setUserAvatar,
}: SettingsModalProps) {
  const hasFocusedRef = useRef(false);
  useEffect(() => {
    if (settingsOpen && !hasFocusedRef.current) {
      passwordInputRef.current?.focus();
      hasFocusedRef.current = true;
    }
    if (!settingsOpen) {
      hasFocusedRef.current = false;
    }
  }, [settingsOpen, passwordInputRef]);
  if (!settingsOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-200 opacity-100 pointer-events-auto"
      aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 relative transform transition-all duration-300 scale-100 opacity-100"
        style={{ minHeight: 400 }}>
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={onClose} aria-label="Close">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-center flex items-center justify-center gap-3">
          User Settings
          <span
            className={
              plan === 'Pro+' ? 'inline-block px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-semibold' :
              plan === 'Pro' ? 'inline-block px-3 py-1 rounded-full bg-purple-600 text-white text-sm font-semibold' :
              'inline-block px-3 py-1 rounded-full bg-gray-400 text-white text-sm font-semibold'
            }
          >
            {plan}
          </span>
        </h2>
        <form onSubmit={handleSaveSettings} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-sm font-semibold mb-1">Username</label>
            <input type="text" value={settingsUsername} onChange={e => setSettingsUsername(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Avatar</label>
            <div className="flex items-center gap-4">
              {(settingsAvatarPreview || userAvatar) ? (
                <div className="relative">
                  <img src={settingsAvatarPreview || getAvatarUrl(userAvatar)} alt="Avatar" className="w-16 h-16 rounded-full border object-cover" />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow border-2 border-white"
                    title="Remove photo"
                    onClick={() => {
                      setSettingsAvatarPreview(null);
                      setSettingsAvatarFile(null);
                      setSettingsAvatar(null);
                      setUserAvatar(null); // Immediately update profile icon
                      setSettingsChanged(true);
                    }}
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full border bg-gray-200 flex items-center justify-center text-2xl font-bold text-blue-400">
                  {settingsUsername ? settingsUsername.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="block text-sm" />
            </div>
          </div>
          {!showPasswordInput && (
            <button
              type="button"
              className="w-full py-2 rounded-lg font-bold text-blue-700 border border-blue-600 bg-white hover:bg-blue-50 transition mb-2"
              onClick={() => setShowPasswordInput(true)}
            >
              Update Password
            </button>
          )}
          {showPasswordInput && (
            <div>
              <label className="block text-sm font-semibold mb-1">New Password</label>
              <input
                type="password"
                ref={passwordInputRef}
                value={settingsPassword}
                onChange={e => setSettingsPassword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                placeholder="Enter new password to update"
                autoComplete="new-password"
              />
            </div>
          )}
          {settingsError && <div className="text-red-500 text-sm">{settingsError}</div>}
          {settingsSuccess && <div className="text-green-600 text-sm">{settingsSuccess}</div>}
          <button type="submit" className={`w-full py-2 rounded-lg font-bold text-white transition ${settingsChanged ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`} disabled={!settingsChanged || settingsLoading}>
            {settingsLoading ? <span className="inline-block w-5 h-5 border-2 border-white border-t-blue-500 rounded-full animate-spin align-middle mr-2" /> : null}
            {settingsLoading ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}

// UpgradeModal: reusable modal for upgrade prompts
const UpgradeModal: React.FC<{ open: boolean; onClose: () => void; feature: string; requiredPlan?: string }> = ({ open, onClose, feature, requiredPlan }) => {
  const navigate = useNavigate();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-pop-in">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <svg width="48" height="48" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#2563eb"/><path d="M24 14v12" stroke="#fff" strokeWidth="3" strokeLinecap="round"/><circle cx="24" cy="32" r="2" fill="#fff"/></svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-blue-700">Upgrade Required</h2>
          <p className="text-gray-700 mb-4 text-lg font-medium">The <span className="font-bold text-blue-600">{feature}</span> feature is available for <span className="font-bold text-blue-600">{requiredPlan || 'Pro/Pro+'}</span> users only.</p>
          <p className="text-gray-500 mb-6">Upgrade your plan to unlock this and more premium features!</p>
          <button
            className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-full shadow-lg text-lg transition-all"
            onClick={() => { onClose(); navigate('/pricing'); }}
          >
            View Plans & Upgrade
          </button>
        </div>
      </div>
    </div>
  );
};

const Whiteboard: React.FC = () => {
  // Board management state
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Whiteboard state
  const [boardSize, setBoardSize] = useState<{ width: string; height: string }>({
    width: '600',
    height: '400',
  });
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const addImagesInputRef = useRef<HTMLInputElement | null>(null);
  const backgroundInputRef = useRef<HTMLInputElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const setBoardRef = (node: any) => {
    if (node && node.resizableElement) {
      boardRef.current = node.resizableElement.current;
    }
  };

  // Get JWT token from localStorage
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || '';

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const shareToken = params.get('shareToken');
  const sharePermission = params.get('permission');

  // Fetch all boards for the user
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoadingBoards(true);
    api.get('/api/boards')
      .then((res) => {
        setBoards(res.data);
        setLoadingBoards(false);
      })
      .catch((err) => {
        setError('Failed to fetch boards');
        setLoadingBoards(false);
      });
  }, [token]);

  // On page load/refresh, always fetch the board content for the board in the URL
  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    api.get(`/api/boards/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (res.data) loadBoardContent(res.data);
      })
      .catch(() => {
        setError('Failed to load board content');
      });
  }, [id]);

  // Load board content into whiteboard
  const loadBoardContent = (board: Board) => {
    setSelectedBoard(board);
    const content = board.content || {};
    setBoardSize({
      width: content.width ? content.width.toString() : '600',
      height: content.height ? content.height.toString() : '400',
    });
    setBackgroundImage(content.backgroundImage || null);
    setImages(content.elements || []);
    setCanvasFrames(content.frames || []); // restore frames
    setSelectedImageId(null);
  };

  // Save current board content to backend
  const saveBoardContent = async () => {
    if (!selectedBoard || !token) return;
    setSaving(true);
    const content = {
      width: Number(boardSize.width),
      height: Number(boardSize.height),
      backgroundImage,
      elements: images,
      frames: canvasFrames, // persist frames
    };
    try {
      const res = await fetch(`${API_URL}/boards/${selectedBoard._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaving(false);
    } catch (e) {
      setError('Failed to save board');
      setSaving(false);
    }
  };

  // fully reset board state and input fields
  const resetBoardState = () => {
    setBoardSize({ width: '600', height: '400' });
    setBackgroundImage(null);
    setImages([]);
    setCanvasFrames([]); // Clear frames on reset
    setSelectedImageId(null);
    if (addImagesInputRef.current) addImagesInputRef.current.value = '';
    if (backgroundInputRef.current) backgroundInputRef.current.value = '';
  };

  // Create new board
  const handleCreateBoard = async () => {
    if (!newBoardName.trim() || !token) return;
    try {
      const res = await api.post(
        `${API_URL}/boards`,
        { name: newBoardName, content: {} },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const board = res.data;
      setBoards((prev) => [...prev, board]);
      setNewBoardName('');
      setSelectedBoard(board);
      navigate(`/board/${board._id}`);
      api.get(`/api/boards/${board._id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (res.data) loadBoardContent(res.data);
        });
    } catch (e) {
      setError('Failed to create board');
    }
  };

  // Board list click handler
  const handleSelectBoard = (board: Board) => {
    if (!board) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    setSelectedBoard(board);
    navigate(`/board/${board._id}`);
    api.get(`/api/boards/${board._id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (res.data) loadBoardContent(res.data);
      });
  };

  // Update handleBackgroundUpload to upload the file to the backend and use the returned URL
  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Upload to backend
      const formData = new FormData();
      formData.append('image', file);
      try {
        const res = await api.post('http://localhost:5001/api/backgrounds', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data && res.data.url) {
          setBackgroundImage(`http://localhost:5001${res.data.url}`);
        }
      } catch (err) {
        // Optionally show error to user
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages: ImageItem[] = files.map((file) => ({
      id: Date.now() + Math.random(),
      src: URL.createObjectURL(file),
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    }));
    setImages((prev) => [...prev, ...newImages]);
    if (addImagesInputRef.current) addImagesInputRef.current.value = '';
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBoardSize({
      ...boardSize,
      [name]: value,
    });
  };

  const handleImageClick = (id: number) => {
    setSelectedImageId(id);
  };

  // Set shape for selected image
  const handleShapeSelect = (shape: 'rectangle' | 'circle') => {
    setImages((prev) =>
      prev.map((img) => (img.id === selectedImageId ? { ...img, shape } : img))
    );
  };

  // Delete image by id
  const handleDeleteImage = (id: number) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (selectedImageId === id) setSelectedImageId(null);
    if (addImagesInputRef.current) addImagesInputRef.current.value = '';
  };

  // Reset board: archive current state before clearing
  const handleReset = async () => {
    if (selectedBoard && token) {
      try {
        await fetch(`${API_URL}/boards/${selectedBoard._id}/archive`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        setError('Failed to reset board');
      }
    }
    setBoardSize({ width: '600', height: '400' });
    setBackgroundImage(null);
    setImages([]);
    setCanvasFrames([]); // Clear frames on reset
    setSelectedImageId(null);
    if (addImagesInputRef.current) addImagesInputRef.current.value = '';
    if (backgroundInputRef.current) backgroundInputRef.current.value = '';
  };

  // Clamp values for rendering and validation
  const widthNum = Math.max(300, Math.min(Number(boardSize.width), 2000));
  const heightNum = Math.max(300, Math.min(Number(boardSize.height), 2000));
  const validSize =
    !isNaN(Number(boardSize.width)) &&
    !isNaN(Number(boardSize.height)) &&
    Number(boardSize.width) >= 300 &&
    Number(boardSize.height) >= 300;

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setBoards([]);
    setSelectedBoard(null);
    setNewBoardName('');
    setBoardSize({ width: '600', height: '400' });
    setBackgroundImage(null);
    setImages([]);
    setSelectedImageId(null);
    setError(null);
    setSaving(false);
    setLoadingBoards(false);
    navigate('/signup');
  };

  // Delete board with confirmation
  const handleDeleteBoard = async (boardId: string) => {
    if (!token) return;
    const confirmDelete = window.confirm('Are you sure you want to delete this board? This action cannot be undone.');
    if (!confirmDelete) return;
    try {
      const res = await fetch(`${API_URL}/boards/${boardId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete board');
      setBoards((prev) => {
        const newBoards = prev.filter((b) => b._id !== boardId);
        // If the deleted board is selected, move to previous or next board
        if (selectedBoard && selectedBoard._id === boardId) {
          if (newBoards.length > 0) {
            // Prefer previous board, else next
            const idx = prev.findIndex((b) => b._id === boardId);
            const newIdx = idx > 0 ? idx - 1 : 0;
            const nextBoard = newBoards[newIdx];
            setSelectedBoard(nextBoard);
            resetBoardState();
            navigate(`/board/${nextBoard._id}`);
          } else {
            setSelectedBoard(null);
            resetBoardState();
            navigate('/');
          }
        }
        return newBoards;
      });
    } catch (err) {
      setError('Failed to delete board');
    }
  };

  // Add handleDownloadBoard function
  const handleDownloadBoard = async (format: 'png' | 'jpeg' = 'png') => {
    const boardArea = boardRef.current;
    if (!boardArea) return;

    // Wait for all images inside the board area to load
    const images = boardArea.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
      if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = img.onerror = resolve;
      });
    });
    await Promise.all(promises);

    const canvas = await html2canvas(boardArea, { useCORS: true });
    const dataUrl = canvas.toDataURL(`image/${format}`);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${selectedBoard?.name || 'board'}.${format}`;
    link.click();
  };

  // Spinner CSS 
  const spinnerStyle: React.CSSProperties = {
    display: 'inline-block',
    width: 18,
    height: 18,
    border: '2.5px solid #bbb',
    borderTop: '2.5px solid #333',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    verticalAlign: 'middle',
    marginLeft: 8,
    opacity: 1,
    transition: 'opacity 0.2s',
  };

  // Add keyframes for spinner animation
  const spinnerKeyframes = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
  if (typeof document !== 'undefined' && !document.getElementById('spinner-keyframes')) {
    const style = document.createElement('style');
    style.id = 'spinner-keyframes';
    style.innerHTML = spinnerKeyframes;
    document.head.appendChild(style);
  }

  // Board name editing state
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editBoardName, setEditBoardName] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Start editing a board name
  const startEditingBoard = (board: Board) => {
    setEditingBoardId(board._id);
    setEditBoardName(board.name);
  };

  // Save edited board name
  const saveBoardName = async (board: Board) => {
    if (!editBoardName.trim() || editBoardName === board.name) {
      setEditingBoardId(null);
      return;
    }
    setEditSaving(true);
    try {
      const res = await api.put(`/api/boards/${board._id}`, { name: editBoardName }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data) {
        setBoards(prev => prev.map(b => b._id === board._id ? { ...b, name: res.data.name } : b));
        if (selectedBoard && selectedBoard._id === board._id) {
          setSelectedBoard({ ...selectedBoard, name: res.data.name });
        }
      }
      setEditingBoardId(null);
    } catch (err) {
      setError('Failed to update board name');
    } finally {
      setEditSaving(false);
    }
  };

  // Handle Enter/Escape in input
  const handleEditInputKey = (e: React.KeyboardEvent<HTMLInputElement>, board: Board) => {
    if (e.key === 'Enter') {
      saveBoardName(board);
    } else if (e.key === 'Escape') {
      setEditingBoardId(null);
    }
  };

  // 1. Add consistent SVG icons (Heroicons outline style)
  const PencilIcon = ({ className = '' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.79l-4 1 1-4 12.362-12.303ZM16.862 4.487l2.651 2.651" />
    </svg>
  );
  const TrashIcon = ({ className = '' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18.75A2.25 2.25 0 0 0 8.25 21h7.5A2.25 2.25 0 0 0 18 18.75V7.5H6v11.25ZM9.75 10.5v6m4.5-6v6M7.5 7.5V6A2.25 2.25 0 0 1 9.75 3.75h4.5A2.25 2.25 0 0 1 16.5 6v1.5m-9 0h12" />
    </svg>
  );
  const DownloadIcon = ({ className = '' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4m-7 7h10" />
    </svg>
  );
  const SaveIcon = ({ className = '' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16v2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-2m10-6V6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4m10 0H6" />
    </svg>
  );
  const LogoutIcon = ({ className = '' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3-3h8.25m0 0l-3-3m3 3l-3 3" />
    </svg>
  );

  const [decors, setDecors] = useState<any[]>([]); // user-uploaded decors
  const [decorLoading, setDecorLoading] = useState(false);
  const decorInputRef = useRef<HTMLInputElement | null>(null);
  const [hoveredImageId, setHoveredImageId] = useState<number | null>(null);

  // Fetch user decors on mount
  useEffect(() => {
    const fetchDecors = async () => {
      if (!token) return;
      setDecorLoading(true);
      try {
        const res = await api.get('/api/decors');
        setDecors(res.data);
      } catch (err) {
        // handle error
      }
      setDecorLoading(false);
    };
    fetchDecors();
  }, [token]);

  // Handle decor upload
  const handleDeleteDecor = async (id: string) => {
    if (!token) return;
    setDecorLoading(true);
    try {
      // Find the decor object before deleting
      const decorToDelete = decors.find((d) => d._id === id);
      await api.delete(`/api/decors/${id}`);
      setDecors((prev) => prev.filter((d) => d._id !== id));
      // Remove all board images with this decor's src
      if (decorToDelete) {
        setImages((prev) =>
          prev.filter(
            (img) => img.src !== `http://localhost:5001${decorToDelete.imageUrl}`
          )
        );
      }
    } catch (err) {
      // handle error
    }
    setDecorLoading(false);
  };

  // Add decor to canvas
  const handleAddDecorToCanvas = (src: string) => {
    setImages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        src,
        x: 100,
        y: 100,
        width: 100,
        height: 100,
      },
    ]);
  };

  const [canvasFrames, setCanvasFrames] = useState<CanvasFrame[]>([]);

  const handleAddFrameToBoard = (frameSrc: string) => {
    setCanvasFrames((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        frameSrc,
        x: 100,
        y: 100,
        width: 220,
        height: 280,
      },
    ]);
  };

  const handleFrameImageUpload = (frameId: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCanvasFrames((prev) =>
        prev.map((f) =>
          f.id === frameId ? { ...f, imageSrc: dataUrl } : f
        )
      );
    };
    reader.readAsDataURL(file);
  };

  // Add at the top-level of the Whiteboard component:
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsUsername, setSettingsUsername] = useState(username);
  const [settingsPassword, setSettingsPassword] = useState('');
  const [settingsAvatar, setSettingsAvatar] = useState<string | null>(null);
  const [settingsAvatarFile, setSettingsAvatarFile] = useState<File | null>(null);
  const [settingsAvatarPreview, setSettingsAvatarPreview] = useState<string | null>(null);
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // For board rename in modal
  const [renamingBoardId, setRenamingBoardId] = useState<string | null>(null);
  const [renameBoardName, setRenameBoardName] = useState('');
  const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null);

  // Add state to control password update visibility
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  // 1. Add state for board refresh
  const [showRefresh, setShowRefresh] = useState(false);
  const [lastBoardHash, setLastBoardHash] = useState<string | null>(null);

  // 2. Utility to hash board content for change detection
  function hashBoardContent(content: any) {
    return JSON.stringify(content);
  }

  // 3. Poll for board changes for both owner and editors
  useEffect(() => {
    if (!selectedBoard) return;
    // Only poll if owner or edit permission (not view-only)
    if (sharePermission === 'view') return;
    const interval = setInterval(async () => {
      try {
        const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
        if (shareToken) headers['x-share-token'] = shareToken;
        const res = await api.get(`${API_URL}/boards/${selectedBoard._id}`, { headers });
        const newHash = hashBoardContent(res.data.content);
        if (lastBoardHash && newHash !== lastBoardHash) {
          setShowRefresh(true);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedBoard, sharePermission, token, shareToken, lastBoardHash]);

  // 4. Set initial board hash when board loads
  useEffect(() => {
    if (selectedBoard) {
      setLastBoardHash(hashBoardContent(selectedBoard.content));
      setShowRefresh(false);
    }
  }, [selectedBoard]);

  // 5. Refresh handler
  const handleRefreshBoard = async () => {
    if (!selectedBoard) return;
    try {
      const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
      if (shareToken) headers['x-share-token'] = shareToken;
      const res = await api.get(`${API_URL}/boards/${selectedBoard._id}`, { headers });
      loadBoardContent(res.data);
      setLastBoardHash(hashBoardContent(res.data.content));
      setShowRefresh(false);
    } catch {}
  };

  // Fetch userId and avatar on mount
  useEffect(() => {
    if (!token) return;
    api.get('http://localhost:5001/api/boards', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      if (res.data && res.data.length > 0 && res.data[0].user) {
        setUserId(res.data[0].user);
      }
    });
    // On mount, fetch user avatar after login
    if (!token) return;
    // Try to get avatar from localStorage first
    const storedAvatar = localStorage.getItem('avatar');
    if (storedAvatar) {
      setUserAvatar(storedAvatar);
    } else {
      // Fetch user info (avatar) from backend
      api.get('http://localhost:5001/api/users/me')
        .then(res => {
          if (res.data && res.data.avatar) {
            setUserAvatar(res.data.avatar);
            localStorage.setItem('avatar', res.data.avatar);
          } else {
            setUserAvatar(null);
            localStorage.removeItem('avatar');
          }
        })
        .catch(() => {
          setUserAvatar(null);
          localStorage.removeItem('avatar');
        });
    }
  }, [token]);

  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const hasFocusedRef = useRef(false);

  // Remove setTimeout or direct .focus() from handleOpenSettings
  const handleOpenSettings = () => {
    setSettingsOpen(true);
    setSettingsUsername(username);
    setSettingsAvatar(userAvatar);
    setSettingsAvatarPreview(null);
    setSettingsAvatarFile(null);
    setSettingsChanged(false);
    setSettingsError('');
    setSettingsSuccess('');
    setShowPasswordInput(false);
    setSettingsPassword('');
  };

  // Focus password input only once per modal open
  useEffect(() => {
    if (settingsOpen && !hasFocusedRef.current) {
      passwordInputRef.current?.focus();
      hasFocusedRef.current = true;
    }
    if (!settingsOpen) {
      hasFocusedRef.current = false;
    }
  }, [settingsOpen]);

  // In handleSaveSettings, only clear password after successful save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSettingsLoading(true);
    setSettingsError('');
    setSettingsSuccess('');
    try {
      const formData = new FormData();
      formData.append('username', settingsUsername);
      if (settingsPassword) formData.append('password', settingsPassword);
      if (settingsAvatarFile) formData.append('avatar', settingsAvatarFile);
      // If avatar is null and no preview and no file, send a flag to remove avatar
      if (!settingsAvatar && !settingsAvatarPreview && !settingsAvatarFile) formData.append('removeAvatar', 'true');
      const res = await api.patch(
        `http://localhost:5001/api/users/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        }
      );
      if (res.data) {
        setSettingsSuccess('Profile updated!');
        setSettingsOpen(false);
        setSettingsChanged(false);
        setSettingsAvatarPreview(null);
        setSettingsAvatarFile(null);
        setSettingsUsername(res.data.username);
        setSettingsPassword('');
        setShowPasswordInput(false);
        localStorage.setItem('username', res.data.username);
        if (res.data.avatar) {
          setUserAvatar(res.data.avatar);
          setSettingsAvatar(res.data.avatar);
          localStorage.setItem('avatar', res.data.avatar);
        } else {
          setUserAvatar(null);
          setSettingsAvatar(null);
          localStorage.removeItem('avatar');
        }
      }
    } catch (err: any) {
      setSettingsError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Avatar file change handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSettingsAvatarFile(file);
      setSettingsAvatarPreview(URL.createObjectURL(file));
      setSettingsChanged(true);
    }
  };

  // Username change handler
  const handleSettingsUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettingsUsername(e.target.value);
    setSettingsChanged(true);
  };

  // Password change handler
  const handleSettingsPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettingsPassword(e.target.value);
    setSettingsChanged(true);
  };

  // Update settingsChanged logic to enable Save if any field is changed (username, password, or avatar)
  useEffect(() => {
    const changed =
      settingsUsername !== username ||
      !!settingsPassword ||
      !!settingsAvatarFile;
    setSettingsChanged(changed);
  }, [settingsUsername, username, settingsPassword, settingsAvatarFile]);

  const [shareOpen, setShareOpen] = useState(false);

  // In the header, show board name from selectedBoard?.name
  // Show a Read Only badge if sharePermission === 'view'
  // Disable editing features if sharePermission === 'view'
  // Example for Save button:
  // <button ... disabled={sharePermission === 'view' || saving}>Save</button>
  // For upload, reset, add/delete, etc, wrap with similar checks

  // Determine if the current user is the owner
  const isOwner = selectedBoard && selectedBoard.user === userId;

  const [ownerUsername, setOwnerUsername] = useState<string | null>(null);
  // 1. Add error state for owner username fetch
  const [ownerUsernameError, setOwnerUsernameError] = useState(false);

  // Fetch the owner's username if not owner
  useEffect(() => {
    if (selectedBoard && selectedBoard.user && selectedBoard.user !== userId) {
      api.get(`${API_URL}/users/${selectedBoard.user}`)
        .then(res => {
          setOwnerUsername(res.data.username);
          setOwnerUsernameError(false);
        })
        .catch(() => {
          setOwnerUsername(null);
          setOwnerUsernameError(true);
        });
    } else {
      setOwnerUsername(null);
      setOwnerUsernameError(false);
    }
  }, [selectedBoard, userId]);

  // Restore handleDecorUpload for decor image uploads
  const handleDecorUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !['image/png', 'image/webp', 'image/jpeg', 'image/jpg'].includes(file.type)) return;
    const formData = new FormData();
    formData.append('image', file);
    setDecorLoading(true);
    try {
      const res = await api.post('/api/decors', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDecors((prev) => [...prev, res.data]);
    } catch (err) {
      // handle error
    }
    setDecorLoading(false);
    if (decorInputRef.current) decorInputRef.current.value = '';
  };

  const [userRole, setUserRole] = useState<string | null>(null);

  // Fetch user role on mount if not in localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      setUserRole(storedRole);
    } else if (token) {
      api.get('http://localhost:5001/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (res.data && res.data.role) {
            setUserRole(res.data.role);
            localStorage.setItem('role', res.data.role);
          }
        })
        .catch(() => {
          setUserRole(null);
        });
    }
  }, [token]);

  const [userPlan, setUserPlan] = useState<string>('');

  useEffect(() => {
    if (!token) return;
    api.get('http://localhost:5001/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.data && res.data.plan) {
          setUserPlan(res.data.plan);
        } else if (res.data && res.data.role) {
          setUserPlan(res.data.role === 'admin' ? 'Pro+' : 'Basic');
        } else {
          setUserPlan('Basic');
        }
      })
      .catch(() => setUserPlan('Basic'));
  }, [token]);

  // Helper for plan restrictions
  const isBasic = userPlan === 'Basic';
  const isPro = userPlan === 'Pro';
  const isProPlus = userPlan === 'Pro+';
  const boardLimitReached = (isBasic && boards.length >= 2) || (isPro && boards.length >= 5);
  // For frames: Pro can only have 1 frame
  const frameLimitReached = isPro && canvasFrames.length >= 1;
  const decorLimitReached = isBasic && decors.length >= 2;

  // Upgrade modal state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [upgradeRequiredPlan, setUpgradeRequiredPlan] = useState('');
  const openUpgradeModal = (feature: string, requiredPlan?: string) => {
    setUpgradeFeature(feature);
    setUpgradeRequiredPlan(requiredPlan || 'Pro/Pro+');
    setUpgradeModalOpen(true);
  };

  const [editingName, setEditingName] = useState('');

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="w-full py-4 bg-gradient-to-r from-gray-900 via-gray-800 to-black shadow-lg text-center relative flex items-center justify-center min-h-[64px]">
        {/* Left: Profile Icon and Dashboard */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            onClick={handleOpenSettings}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-blue-300 text-xl font-bold shadow border border-blue-400/20 focus:outline-none focus:ring-2 focus:ring-blue-400/30 overflow-hidden hover:bg-white/20 transition-all glass-btn"
            title="User Settings"
            style={{ minWidth: 40 }}
          >
            {userAvatar ? (
              <img src={getAvatarUrl(userAvatar)} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              settingsUsername ? settingsUsername.charAt(0).toUpperCase() : '?' 
            )}
          </button>
          {userRole === 'admin' && (
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-1 px-4 py-2 rounded-full glass-btn bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white font-semibold shadow text-sm hover:from-blue-600 hover:to-blue-800 transition-colors ml-2"
              style={{ minWidth: 90 }}
              title="Dashboard"
            >
              <FaTachometerAlt size={16} /> Dashboard
            </button>
          )}
        </div>
        {/* Center: Board Title */}
        <h1 className="text-2xl font-extrabold text-white tracking-wide drop-shadow mx-auto">
          {selectedBoard ? selectedBoard.name : 'Canvas Board'}
        </h1>
        {/* Right: Upgrade, Share, Logout */}
        <div className="absolute top-1/2 right-6 -translate-y-1/2 flex items-center gap-2">
          <button
            onClick={() => navigate('/pricing')}
            className="flex items-center gap-1 px-4 py-2 rounded-full glass-btn bg-white/10 text-blue-400 hover:text-blue-300 font-semibold shadow text-sm transition-colors"
            style={{ minWidth: 80 }}
            title="Upgrade"
          >
            <FaArrowUp size={16} /> Upgrade
          </button>
          <button
            onClick={isProPlus ? () => setShareOpen(true) : () => openUpgradeModal('Share', 'Pro+')}
            className={`flex items-center gap-1 px-4 py-2 rounded-full glass-btn font-semibold shadow text-sm transition-colors ${isProPlus ? 'bg-white/10 text-blue-400 hover:text-blue-300' : 'bg-white/10 text-blue-200 cursor-not-allowed opacity-60'}`}
            style={{ minWidth: 80 }}
            title={isProPlus ? 'Share this board' : 'Share is not available for your plan.'}
            disabled={!isProPlus}
          >
            <FaShareAlt size={16} /> Share
          </button>
          <button
            onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
            className="flex items-center gap-1 px-4 py-2 rounded-full glass-btn bg-white/10 text-gray-300 hover:text-white font-semibold shadow text-sm transition-colors"
            style={{ minWidth: 80 }}
            title="Logout"
          >
            <FaSignOutAlt size={16} /> Logout
          </button>
        </div>
      </header>
      {/* Loading spinner for board area */}
      {loadingBoards ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : selectedBoard ? (
        <>
          {/* Board List and Create: only for owner, not for share links */}
          {isOwner && sharePermission !== 'view' && (
            <div className="w-full px-8 py-4">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-blue-700 font-semibold">Boards:</span>
                <div className="flex flex-wrap gap-2">
                  {boards.map(board => (
                    <div
                      key={board._id}
                      className={`relative group flex items-center rounded-full text-sm font-semibold transition-all shadow px-3 py-1.5 pr-2 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-900 glass-btn`}
                      style={{ minWidth: 80, maxWidth: 220, cursor: 'pointer' }}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectBoard(board)}
                    >
                      {editingBoardId === board._id ? (
                        <input
                          type="text"
                          value={editBoardName}
                          onChange={e => setEditBoardName(e.target.value)}
                          onBlur={() => saveBoardName(board)}
                          onKeyDown={e => handleEditInputKey(e, board)}
                          className="px-2 py-1 rounded bg-white border border-blue-200 text-blue-900 font-semibold w-32 mr-2"
                          autoFocus
                          disabled={editSaving}
                        />
                      ) : (
                        <span className="truncate max-w-[110px]">{board.name}</span>
                      )}
                      {isOwner && selectedBoard?._id === board._id && (
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={e => { e.stopPropagation(); startEditingBoard(board); }}
                            className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                            title="Edit board name"
                          >
                            <FaEdit size={13} />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteBoard(board._id); }}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors"
                            title="Delete board"
                          >
                            <FaTrash size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Create new board */}
                <div className="ml-auto flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="New board name"
                    className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 placeholder-blue-400 border border-blue-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow glass-btn"
                    value={newBoardName}
                    onChange={e => setNewBoardName(e.target.value)}
                    style={{ minWidth: 140 }}
                  />
                  <button
                    onClick={boardLimitReached ? () => openUpgradeModal('Create Board', isBasic ? 'Pro' : 'Pro+') : handleCreateBoard}
                    className={`px-4 py-1.5 rounded-full glass-btn font-semibold shadow text-sm transition-colors ${(boardLimitReached) ? 'bg-blue-50 text-blue-300 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                    style={{ minWidth: 80 }}
                    disabled={boardLimitReached}
                    title={isBasic ? (boardLimitReached ? 'Basic users can only create 2 boards.' : '') : isPro ? (boardLimitReached ? 'Pro users can only create 5 boards.' : '') : ''}
                  >
                    + Create
                  </button>
                </div>
                {/* Save, Download, Reset */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={saveBoardContent}
                    className="flex items-center gap-1 px-4 py-1.5 rounded-full glass-btn bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold shadow text-sm transition-colors"
                    style={{ minWidth: 80 }}
                  >
                    <span className="font-bold">Save</span>
                  </button>
                  <button
                    onClick={isBasic ? () => openUpgradeModal('Download', 'Pro/Pro+') : () => handleDownloadBoard('png')}
                    className={`flex items-center gap-1 px-4 py-1.5 rounded-full glass-btn font-semibold shadow text-sm transition-colors ${isBasic ? 'bg-blue-50 text-blue-300 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                    style={{ minWidth: 80 }}
                    disabled={isBasic}
                    title={isBasic ? 'Download is not available for Basic users.' : ''}
                  >
                    <span className="font-bold">Download</span>
                  </button>
                  <button
                    onClick={isBasic ? () => openUpgradeModal('Reset', 'Pro/Pro+') : handleReset}
                    className={`flex items-center gap-1 px-4 py-1.5 rounded-full glass-btn font-semibold shadow text-sm transition-colors ${isBasic ? 'bg-red-50 text-red-300 cursor-not-allowed' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                    style={{ minWidth: 80 }}
                    disabled={isBasic}
                    title={isBasic ? 'Reset is not available for Basic users.' : ''}
                  >
                    <span className="font-bold">Reset</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Error and Saving */}
          {(error || saving) && (
            <div className="w-full flex justify-center mt-2">
              {error && <span className="text-red-500 font-medium">{error}</span>}
              {saving && <span className="text-blue-500 ml-4">Saving...</span>}
            </div>
          )}
          {/* Main Content */}
          <main className="flex-1 flex flex-col md:flex-row gap-4 p-4 md:p-8 overflow-hidden">
            {/* Board Area and Sidebar as siblings in a flex row */}
            <div className="flex flex-1 flex-row gap-4 w-full">
              <section className="flex-1 flex items-center justify-center overflow-auto">
                <div className="relative w-full h-full max-w-full max-h-full min-w-[300px] min-h-[300px] bg-gradient-to-br from-gray-100/90 via-gray-200/80 to-white/90 rounded-2xl shadow-2xl p-4 flex items-center justify-center overflow-auto backdrop-blur-md">
                  <Rnd
                    ref={setBoardRef}
                    size={{ width: widthNum, height: heightNum }}
                    position={{ x: 0, y: 0 }}
                    disableDragging={true}
                    enableResizing={sharePermission !== 'view' ? { bottom: true, right: true, bottomRight: true } : {}}
                    onResizeStop={(e, direction, ref) => {
                      if (sharePermission === 'view') return;
                      setBoardSize({ width: ref.offsetWidth.toString(), height: ref.offsetHeight.toString() });
                    }}
                    minWidth={300}
                    minHeight={300}
                    bounds="parent"
                    className="relative bg-transparent overflow-hidden rounded-lg border border-gray-200 shadow-md"
                  >
                    {backgroundImage && backgroundImage.trim() !== '' && !backgroundImage.startsWith('blob:') && (
                      <img
                        src={backgroundImage}
                        alt="Background"
                        className="absolute top-0 left-0 w-full h-full object-fill z-0 rounded-lg"
                        style={{ objectFit: 'fill', objectPosition: 'center' }}
                      />
                    )}
                    {/* Render frames first (background) */}
                    {canvasFrames.map((frame) => (
                      <Rnd
                        key={frame.id}
                        size={{ width: frame.width, height: frame.height }}
                        position={{ x: frame.x, y: frame.y }}
                        onDragStop={(e, d) => {
                          setCanvasFrames((prev) =>
                            prev.map((f) =>
                              f.id === frame.id ? { ...f, x: d.x, y: d.y } : f
                            )
                          );
                        }}
                        onResizeStop={(e, direction, ref, delta, position) => {
                          setCanvasFrames((prev) =>
                            prev.map((f) =>
                              f.id === frame.id
                                ? {
                                    ...f,
                                    width: parseInt(ref.style.width, 10),
                                    height: parseInt(ref.style.height, 10),
                                    x: position.x,
                                    y: position.y,
                                  }
                                : f
                            )
                          );
                        }}
                        bounds="parent"
                        minWidth={100}
                        minHeight={100}
                        className="absolute"
                        style={{ zIndex: 0 }}
                      >
                        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                          {/* Delete button for frame */}
                          {sharePermission !== 'view' && (
                            <button
                              onClick={() => setCanvasFrames((prev) => prev.filter((f) => f.id !== frame.id))}
                              style={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                zIndex: 1,
                                background: 'white',
                                borderRadius: '50%',
                                border: '1px solid #ccc',
                                width: 24,
                                height: 24,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                                cursor: 'pointer',
                              }}
                              title="Delete Frame"
                            >
                              <span style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: 16 }}>&times;</span>
                            </button>
                          )}
                          {/* Centered, slightly smaller image or upload area */}
                          {frame.imageSrc ? (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                borderRadius: 8,
                                background: 'transparent',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                zIndex: 0,
                              }}
                            >
                              <img
                                src={frame.imageSrc}
                                alt="Framed"
                                style={{
                                  width: '85%',
                                  height: '85%',
                                  objectFit: 'contain',
                                  display: 'block',
                                  borderRadius: 8,
                                  zIndex: 0,
                                  background: 'white',
                                }}
                              />
                            </div>
                          ) : (
                            <label
                              style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: '85%',
                                height: '85%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 0,
                                background: 'transparent',
                                margin: 0,
                                padding: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px dashed #ccc',
                                boxSizing: 'border-box',
                                borderRadius: 8,
                                cursor: 'pointer',
                              }}
                            >
                              <span className="text-xs text-gray-700">Upload Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleFrameImageUpload(frame.id, e.target.files[0]);
                                  }
                                }}
                              />
                            </label>
                          )}
                          {/* Frame border always on top of its own image, but below all images/decors */}
                          <img
                            src={frame.frameSrc}
                            alt="Frame"
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
                          />
                        </div>
                      </Rnd>
                    ))}
                    {/* Then render images/decors (foreground) */}
                    {images.map((img, idx) => {
                      const isHovered = hoveredImageId === img.id;
                      const shape = img.shape || 'rectangle';
                      return (
                        <Rnd
                          key={img.id}
                          size={{ width: img.width, height: img.height }}
                          position={{ x: img.x, y: img.y }}
                          onDragStop={(e, d) => {
                            setImages((prev) =>
                              prev.map((im, i) =>
                                i === idx ? { ...im, x: d.x, y: d.y } : im
                              )
                            );
                          }}
                          onResizeStop={(e, direction, ref, delta, position) => {
                            setImages((prev) =>
                              prev.map((im, i) =>
                                i === idx
                                  ? {
                                      ...im,
                                      width: parseInt(ref.style.width, 10),
                                      height: parseInt(ref.style.height, 10),
                                      x: position.x,
                                      y: position.y,
                                    }
                                  : im
                              )
                            );
                          }}
                          bounds="parent"
                          minWidth={50}
                          minHeight={50}
                          className="z-10"
                        >
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              position: 'relative',
                              cursor: 'pointer',
                            }}
                            className="group"
                            onMouseEnter={() => setHoveredImageId(img.id)}
                            onMouseLeave={() => setHoveredImageId(null)}
                          >
                            {/* Delete button on hover */}
                            {sharePermission !== 'view' && (
                              <button
                                className="absolute top-1 right-1 z-30 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-red-500 hover:text-white transition-opacity opacity-0 group-hover:opacity-100"
                                style={{ fontSize: 16 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteImage(img.id);
                                }}
                                tabIndex={-1}
                                aria-label="Delete image"
                              >
                                &#10005;
                              </button>
                            )}
                            <img
                              src={img.src}
                              alt="Draggable"
                              className={`w-full h-full ${
                                isHovered ? 'border-2 border-blue-500' : 'border border-transparent'
                              } ${
                                shape === 'circle'
                                  ? 'object-cover clip-circle-img'
                                  : 'object-fill'
                              }`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'fill',
                                borderRadius: shape === 'circle' ? '50%' : undefined,
                                imageRendering: 'auto',
                                display: 'block',
                                background: 'none',
                              }}
                              draggable={false}
                            />
                          </div>
                        </Rnd>
                      );
                    })}
                  </Rnd>
                  {!validSize && (
                    <p className="text-red-500 text-xs mt-2 absolute bottom-2 left-2 bg-white bg-opacity-80 px-2 py-1 rounded shadow">
                      Enter valid width and height ≥ 300
                    </p>
                  )}
                </div>
              </section>
              {/* Sidebar Tools: only for owner or edit permission, not for view links */}
              {(isOwner || sharePermission === 'edit') && sharePermission !== 'view' && (
                <aside className="w-full md:w-80 min-w-[250px] max-h-[calc(100vh-100px)] overflow-y-auto bg-[#f4f5f7] backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-6 space-y-4 flex-shrink-0">
                  <h2 className="text-xl font-extrabold mb-2 text-gray-900">Tools</h2>
                  {/* Manual Board Size Inputs */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Board Width (px)</label>
                    <input
                      type="number"
                      name="width"
                      max={2000}
                      value={boardSize.width}
                      onChange={handleSizeChange}
                      className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#f4f5f7] text-gray-900 placeholder-gray-400 shadow-sm"
                      placeholder="Enter width ≥ 300"
                    />
                    <label className="text-sm font-semibold text-gray-700">Board Height (px)</label>
                    <input
                      type="number"
                      name="height"
                      max={2000}
                      value={boardSize.height}
                      onChange={handleSizeChange}
                      className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#f4f5f7] text-gray-900 placeholder-gray-400 shadow-sm"
                      placeholder="Enter height ≥ 300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Upload Background
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundUpload}
                      ref={backgroundInputRef}
                      className="block w-full text-sm border border-gray-300 rounded-lg cursor-pointer bg-[#f4f5f7] text-gray-900 placeholder-gray-400 shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Add Images</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      ref={addImagesInputRef}
                      className="block w-full text-sm border border-gray-300 rounded-lg cursor-pointer bg-[#f4f5f7] text-gray-900 placeholder-gray-400 shadow-sm"
                    />
                  </div>
                  {/* Shapes section - only for image items, not decor items */}
                  {selectedImageId && (() => {
                    const selectedImg = images.find(img => img.id === selectedImageId);
                    const isDefaultDecor = selectedImg && DEFAULT_DECORS.some(decor => decor.src === selectedImg.src);
                    const isUserDecor = selectedImg && decors.some(decor => `http://localhost:5001${decor.imageUrl}` === selectedImg.src);
                    if (!selectedImg || isDefaultDecor || isUserDecor) return null;
                    return (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Shapes</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            {
                              shape: 'rectangle',
                              icon: (
                                <svg width="24" height="24">
                                  <rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
                                </svg>
                              ),
                              label: 'Rectangle',
                            },
                            {
                              shape: 'circle',
                              icon: (
                                <svg width="24" height="24">
                                  <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                                </svg>
                              ),
                              label: 'Circle',
                            },
                          ].map(({ shape, icon, label }) => (
                            <button
                              key={shape}
                              className={`flex flex-col items-center justify-center px-2 py-2 rounded border border-gray-300 transition-colors
                                ${images.find((img) => img.id === selectedImageId)?.shape === shape
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-gray-100 hover:bg-blue-100'
                                }`}
                              onClick={() => handleShapeSelect(shape as any)}
                            >
                              {icon}
                              <span className="text-xs mt-1">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  <div className="mt-6">
                    <h3 className="text-lg font-bold mb-2 text-gray-900">Decors</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {/* Default decors */}
                      {DEFAULT_DECORS.map((decor) => (
                        <button
                          key={decor.src}
                          className="w-12 h-12 bg-white border rounded flex items-center justify-center shadow hover:shadow-lg transition relative"
                          title={decor.name}
                          onClick={() => handleAddDecorToCanvas(decor.src)}
                          style={{ padding: 2 }}
                        >
                          <img src={decor.src} alt={decor.name} className="max-w-full max-h-full object-contain" />
                        </button>
                      ))}
                      {/* User decors */}
                      {decors.map((decor) => (
                        <div key={decor._id} className="relative group">
                          <button
                            className="w-12 h-12 bg-white border rounded flex items-center justify-center shadow hover:shadow-lg transition"
                            title={decor.originalFilename}
                            onClick={() => handleAddDecorToCanvas(`http://localhost:5001${decor.imageUrl}`)}
                            style={{ padding: 2 }}
                          >
                            <img src={`http://localhost:5001${decor.imageUrl}`} alt={decor.originalFilename} className="max-w-full max-h-full object-contain" />
                          </button>
                          {sharePermission !== 'view' && (
                            <button
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                              onClick={() => handleDeleteDecor(decor._id)}
                              title="Delete"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      {decorLoading && <span className="text-xs text-gray-400">Loading...</span>}
                    </div>
                    {/* In the decor upload section: */}
                    {/* Only show upload input for Pro+ users */}
                    {isProPlus && (
                      <input
                        type="file"
                        accept="image/png,image/webp,image/jpeg,image/jpg"
                        onChange={handleDecorUpload}
                        ref={decorInputRef}
                        className="block w-full text-xs border border-gray-300 rounded cursor-pointer bg-[#f4f5f7] text-gray-900 placeholder-gray-400 shadow-sm"
                        style={{ marginTop: 4 }}
                      />
                    )}
                    {(isBasic || isPro) && (
                      <input
                        type="file"
                        disabled
                        className="block w-full text-xs border border-gray-300 rounded cursor-not-allowed bg-[#f4f5f7] text-gray-400 placeholder-gray-400 shadow-sm opacity-50"
                        style={{ marginTop: 4 }}
                        title={isBasic ? 'Decor upload is not available for Basic users.' : 'Decor upload is not available for Pro users.'}
                      />
                    )}
                    <span className="text-xs text-gray-500">PNG/WebP/JPEG only, max 5MB</span>
                  </div>
                  {/* Frames section: fade/disable for Basic users */}
                  <div
                    style={{ opacity: isBasic ? 0.4 : isPro && frameLimitReached ? 0.7 : 1, pointerEvents: 'auto' }}
                    title={isBasic ? 'Frames are not available for Basic users.' : isPro && frameLimitReached ? 'Pro users can only have 1 frame.' : ''}
                    onClick={isBasic ? () => openUpgradeModal('Frames', 'Pro/Pro+') : undefined}
                  >
                    <FramesSection
                      onAddFrame={src => {
                        if (isBasic) {
                          openUpgradeModal('Frames', 'Pro/Pro+');
                          return;
                        }
                        if (isPro && frameLimitReached) {
                          openUpgradeModal('More Frames', 'Pro+');
                          return;
                        }
                        handleAddFrameToBoard(src);
                      }}
                      disableAdd={isBasic || (isPro && frameLimitReached)}
                      onUpgradeClick={() => openUpgradeModal(isBasic ? 'Frames' : 'More Frames', isBasic ? 'Pro/Pro+' : 'Pro+')}
                    />
                  </div>
                </aside>
              )}
            </div>
          </main>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-xl">No board found</div>
      )}
      {settingsOpen && (
        <SettingsModal
          settingsOpen={settingsOpen}
          settingsUsername={settingsUsername}
          setSettingsUsername={setSettingsUsername}
          settingsPassword={settingsPassword}
          setSettingsPassword={setSettingsPassword}
          settingsAvatarPreview={settingsAvatarPreview}
          setSettingsAvatarPreview={setSettingsAvatarPreview}
          userAvatar={userAvatar}
          handleAvatarChange={handleAvatarChange}
          settingsError={settingsError}
          settingsSuccess={settingsSuccess}
          settingsChanged={settingsChanged}
          setSettingsChanged={setSettingsChanged}
          settingsLoading={settingsLoading}
          handleSaveSettings={handleSaveSettings}
          passwordInputRef={passwordInputRef}
          onClose={() => setSettingsOpen(false)}
          showPasswordInput={showPasswordInput}
          setShowPasswordInput={setShowPasswordInput}
          plan={userPlan}
          setSettingsAvatar={setSettingsAvatar}
          setSettingsAvatarFile={setSettingsAvatarFile}
          setUserAvatar={setUserAvatar}
        />
      )}
      {/* Share Modal: only for owner, not for sharePermission 'edit' */}
      {selectedBoard && isOwner && sharePermission !== 'view' && (
        <ShareModal
          boardId={selectedBoard._id}
          open={shareOpen}
          onClose={() => setShareOpen(false)}
        />
      )}
      {/* Upgrade Modal */}
      <UpgradeModal open={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} feature={upgradeFeature} requiredPlan={upgradeRequiredPlan} />
    </div>
  );
};

export default Whiteboard;