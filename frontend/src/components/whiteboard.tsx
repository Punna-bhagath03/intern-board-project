import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import axios from 'axios';
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

// Helper to get absolute avatar URL
const getAvatarUrl = (avatar: string | null | undefined): string => {
  if (!avatar) return '/default-avatar.png';
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
  userAvatar: string | null;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  settingsError: string;
  settingsSuccess: string;
  settingsChanged: boolean;
  settingsLoading: boolean;
  handleSaveSettings: (e: React.FormEvent) => void;
  passwordInputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  showPasswordInput: boolean;
  setShowPasswordInput: (v: boolean) => void;
}

function SettingsModal({
  settingsOpen,
  settingsUsername,
  setSettingsUsername,
  settingsPassword,
  setSettingsPassword,
  settingsAvatarPreview,
  userAvatar,
  handleAvatarChange,
  settingsError,
  settingsSuccess,
  settingsChanged,
  settingsLoading,
  handleSaveSettings,
  passwordInputRef,
  onClose,
  showPasswordInput,
  setShowPasswordInput
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
        <h2 className="text-2xl font-bold mb-4 text-center">User Settings</h2>
        <form onSubmit={handleSaveSettings} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-sm font-semibold mb-1">Username</label>
            <input type="text" value={settingsUsername} onChange={e => setSettingsUsername(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Avatar</label>
            <div className="flex items-center gap-4">
              <img src={settingsAvatarPreview || getAvatarUrl(userAvatar)} alt="Avatar" className="w-16 h-16 rounded-full border object-cover" />
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
    axios.get(`${API_URL}/boards`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        setBoards(res.data);
        setLoadingBoards(false);
      })
      .catch((err) => {
        setError('Failed to fetch boards');
        setLoadingBoards(false);
      });
  }, [token]);

  // Fetch the selected board by id
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!id) return;
    setLoadingBoards(true);
    // Check for shareToken in URL
    const headers: any = { Authorization: `Bearer ${token}` };
    if (shareToken) {
      headers['x-share-token'] = shareToken;
    }
    axios.get(`${API_URL}/boards/${id}`, {
      headers
    })
      .then((res) => {
        setSelectedBoard(res.data);
        loadBoardContent(res.data);
        setLoadingBoards(false);
      })
      .catch((err) => {
        setLoadingBoards(false);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          navigate('/login');
        } else {
          setError('Board not found or access denied.');
        }
      });
  }, [token, id, location.search]);

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
      const res = await axios.post(
        `${API_URL}/boards`,
        { name: newBoardName, content: {} },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const board = res.data;
      setBoards((prev) => [...prev, board]);
      setNewBoardName('');
      setSelectedBoard(board);
      resetBoardState();
      navigate(`/board/${board._id}`);
    } catch (e) {
      setError('Failed to create board');
    }
  };

  // Board list click handler
  const handleSelectBoard = (board: Board) => {
    if (!selectedBoard || selectedBoard._id !== board._id) {
      resetBoardState();
      navigate(`/board/${board._id}`);
    }
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackgroundImage(URL.createObjectURL(file));
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
    delete axios.defaults.headers.common['Authorization'];
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
      const res = await fetch(`${API_URL}/boards/${board._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editBoardName }),
      });
      if (!res.ok) throw new Error('Failed to update board name');
      const updated = await res.json();
      setBoards(prev => prev.map(b => b._id === board._id ? { ...b, name: updated.name } : b));
      if (selectedBoard && selectedBoard._id === board._id) {
        setSelectedBoard({ ...selectedBoard, name: updated.name });
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
        const res = await axios.get('http://localhost:5001/api/decors', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDecors(res.data);
      } catch (err) {
        // handle error
      }
      setDecorLoading(false);
    };
    fetchDecors();
  }, [token]);

  // Handle decor upload
  const handleDecorUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !['image/png', 'image/webp', 'image/jpeg', 'image/jpg'].includes(file.type)) return;
    const formData = new FormData();
    formData.append('image', file);
    setDecorLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/decors', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDecors((prev) => [...prev, res.data]);
    } catch (err) {
      // handle error
    }
    setDecorLoading(false);
    if (decorInputRef.current) decorInputRef.current.value = '';
  };

  // Handle decor delete
  const handleDeleteDecor = async (id: string) => {
    if (!token) return;
    setDecorLoading(true);
    try {
      // Find the decor object before deleting
      const decorToDelete = decors.find((d) => d._id === id);
      await axios.delete(`http://localhost:5001/api/decors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
        const res = await axios.get(`${API_URL}/boards/${selectedBoard._id}`, { headers });
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
      const res = await axios.get(`${API_URL}/boards/${selectedBoard._id}`, { headers });
      loadBoardContent(res.data);
      setLastBoardHash(hashBoardContent(res.data.content));
      setShowRefresh(false);
    } catch {}
  };

  // Fetch userId and avatar on mount
  useEffect(() => {
    if (!token) return;
    axios.get('http://localhost:5001/api/boards', {
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
      axios.get('http://localhost:5001/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
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
      const res = await axios.patch(
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
        setUserAvatar(res.data.avatar || null);
        setSettingsAvatar(res.data.avatar || null);
        setSettingsUsername(res.data.username);
        setSettingsPassword('');
        setShowPasswordInput(false);
        localStorage.setItem('username', res.data.username);
        if (res.data.avatar) {
          localStorage.setItem('avatar', res.data.avatar);
        } else {
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
      axios.get(`${API_URL}/users/${selectedBoard.user}`)
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

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="w-full py-6 bg-gradient-to-r from-gray-900 via-gray-800 to-black shadow text-center relative">
        <h1 className="text-3xl font-extrabold text-white tracking-wide drop-shadow">
          {selectedBoard ?
            (isOwner
              ? selectedBoard.name
              : `${selectedBoard.name} (by ${ownerUsernameError ? 'Unknown' : (ownerUsername || '...')})`)
            : 'Canvas Board'}
        </h1>
        {/* Show badges */}
        {sharePermission === 'view' && (
          <span className="absolute left-4 top-4 bg-yellow-400 text-gray-900 font-bold px-3 py-1 rounded-full shadow">Read Only</span>
        )}
        {!isOwner && sharePermission === 'edit' && (
          <span className="absolute left-4 top-4 bg-blue-400 text-white font-bold px-3 py-1 rounded-full shadow">Edit Mode</span>
        )}
        {/* Refresh button in edit/owner mode if board changed */}
        {showRefresh && sharePermission !== 'view' && (
          <button
            onClick={handleRefreshBoard}
            className="absolute left-4 top-16 bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-1 rounded-full shadow border border-green-700 transition-colors z-20"
            style={{ minWidth: 100 }}
          >
            Refresh Board
          </button>
        )}
        <div className="absolute top-4 right-4 flex items-center gap-4">
          <button
            onClick={handleOpenSettings}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-gray-700 text-xl font-bold shadow-md border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 overflow-hidden"
            title="User Settings"
          >
            {userAvatar ? (
              <img src={getAvatarUrl(userAvatar)} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              username ? username.charAt(0).toUpperCase() : '?'
            )}
          </button>
          <button
            onClick={handleLogout}
            className="bg-white/90 text-gray-800 hover:bg-gray-200 hover:text-black px-4 py-2 rounded-full font-semibold shadow transition-colors border border-gray-300 hover:border-gray-400"
          >
            Logout
          </button>
          {/* Share button only for edit or owner */}
          {selectedBoard && sharePermission !== 'view' && (
            <button
              onClick={() => setShareOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-semibold shadow border border-blue-700 transition-colors"
              title="Share this board"
            >
              Share
            </button>
          )}
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
            <div className="w-full flex flex-col md:flex-row items-center gap-2 px-8 mt-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="font-semibold text-gray-900 flex items-center">
                  Boards:
                  {loadingBoards && (
                    <span style={{ ...spinnerStyle, opacity: loadingBoards ? 1 : 0 }} aria-label="Loading" />
                  )}
                </span>
                {!loadingBoards && boards.map((board) => (
                  <div
                    key={board._id}
                    className="relative flex items-center mr-2 mb-2"
                    onClick={() => handleSelectBoard(board)}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: 'pointer' }}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleSelectBoard(board); }}
                  >
                    <div
                      className={`group flex items-center rounded-full border text-sm font-semibold transition-colors shadow-sm px-3 py-1 pr-2 min-w-0 max-w-full
                        ${selectedBoard?._id === board._id
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white/80 text-gray-700 border-gray-300 hover:bg-gray-200 hover:text-gray-900'}
                      `}
                      style={{ minWidth: 0, maxWidth: 220 }}
                    >
                      {/* Board name or input */}
                      <span
                        className={`truncate max-w-[110px] mr-2 ${selectedBoard?._id === board._id ? 'text-white' : 'text-gray-900'} cursor-pointer`}
                        title={board.name}
                      >
                        {board._id === selectedBoard?._id ? selectedBoard?.name : board.name}
                      </span>
                      {/* Edit icon: only for owner */}
                      {editingBoardId !== board._id && board.user === userId && (
                        <button
                          onClick={e => { e.stopPropagation(); startEditingBoard(board); }}
                          className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors duration-150 ml-0.5 mr-1
                            ${selectedBoard?._id === board._id ? 'text-white hover:bg-gray-800 hover:text-blue-200' : 'text-gray-500 hover:bg-gray-200 hover:text-blue-700'}`}
                          title="Edit board name"
                          type="button"
                          tabIndex={-1}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      )}
                      {/* Delete icon: only for owner */}
                      {board.user === userId && (
                        <button
                          onClick={e => { e.stopPropagation(); handleDeleteBoard(board._id); }}
                          className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors duration-150
                            ${selectedBoard?._id === board._id
                              ? 'text-white hover:bg-red-600 hover:text-white'
                              : 'text-gray-500 hover:bg-red-500 hover:text-white'}`}
                          title="Delete board"
                          aria-label="Delete board"
                          type="button"
                          tabIndex={-1}
                          style={{ fontSize: '1.1rem', lineHeight: 1 }}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Disable create new board for sharePermission 'edit' */}
              {sharePermission !== 'edit' && (
                <div className="flex gap-2 items-center ml-auto">
                  <input
                    type="text"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder="New board name"
                    className="p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900 placeholder-gray-400 shadow-sm"
                  />
                  <button
                    onClick={handleCreateBoard}
                    className="bg-white hover:bg-gray-200 text-gray-900 font-bold px-4 py-2 rounded-full shadow transition border border-gray-300"
                  >
                    + Create
                  </button>
                </div>
              )}
            </div>
          )}
          {/* Error and Saving */}
          {(error || saving) && (
            <div className="w-full flex justify-center mt-2">
              {error && <span className="text-red-500 font-medium">{error}</span>}
              {saving && <span className="text-blue-500 ml-4">Saving...</span>}
            </div>
          )}
          {/* Reset Button Row */}
          {sharePermission !== 'view' && (
            <div className="w-full flex justify-end gap-2 px-8 mt-2">
              <button
                onClick={saveBoardContent}
                className="flex items-center gap-2 bg-[#23272f] hover:bg-[#2d323c] text-white font-bold px-4 py-2 rounded-full shadow transition border border-gray-700"
                disabled={sharePermission === 'view' || saving}
              >
                <SaveIcon className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => handleDownloadBoard('png')}
                className="flex items-center gap-2 bg-[#23272f] hover:bg-[#2d323c] text-white font-bold px-4 py-2 rounded-full shadow transition border border-gray-700"
                title="Download board as image"
                disabled={sharePermission === 'view'}
              >
                <DownloadIcon className="w-5 h-5" />
                Download
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-full shadow transition"
                disabled={sharePermission === 'view'}
              >
                <TrashIcon className="w-5 h-5" />
                Reset
              </button>
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
                    <input
                      type="file"
                      accept="image/png,image/webp,image/jpeg,image/jpg"
                      onChange={handleDecorUpload}
                      ref={decorInputRef}
                      className="block w-full text-xs border border-gray-300 rounded cursor-pointer bg-[#f4f5f7] text-gray-900 placeholder-gray-400 shadow-sm"
                      style={{ marginTop: 4 }}
                    />
                    <span className="text-xs text-gray-500">PNG/WebP/JPEG only, max 5MB</span>
                  </div>
                  <FramesSection onAddFrame={handleAddFrameToBoard} />
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
          userAvatar={userAvatar}
          handleAvatarChange={handleAvatarChange}
          settingsError={settingsError}
          settingsSuccess={settingsSuccess}
          settingsChanged={settingsChanged}
          settingsLoading={settingsLoading}
          handleSaveSettings={handleSaveSettings}
          passwordInputRef={passwordInputRef}
          onClose={() => setSettingsOpen(false)}
          showPasswordInput={showPasswordInput}
          setShowPasswordInput={setShowPasswordInput}
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
    </div>
  );
};

export default Whiteboard;