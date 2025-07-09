import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { useNavigate, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import garland1 from '../assets/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcGYtczYyLXBvbS0wNzMxLXRlZGR5LWpvZHMucG5n-removebg-preview.png';
import marigoldGarland from '../assets/transparent-flower-arrangement-symmetrical-marigold-garland-on-dark-background6607c6f2040c06.15089414-removebg-preview.png';
import table1 from '../assets/5e053f7cb0da2910351bb80178095857-removebg-preview.png';
import table2 from '../assets/images-removebg-preview.png';
import table3 from '../assets/WhatsApp_Image_2025-07-09_at_11.17.18-removebg-preview.png';
import FramesSection from './FramesSection';

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
}

const API_URL = 'http://localhost:5001/api';

// Preloaded decor images (add your own PNGs/WebPs to assets and list here)
const PRELOADED_DECORS = [
  { src: '/src/assets/react.svg', name: 'React Logo' },
  // Add more preloaded PNG/WebP paths here
];

// Add default decors (add your PNG/WebP files to assets and list them here)
const DEFAULT_DECORS = [
  { src: garland1, name: 'Flower Garland 1' },
  { src: marigoldGarland, name: 'Marigold Garland' },
  { src: table1, name: 'Table 1' },
  { src: table2, name: 'Table 2' },
  { src: table3, name: 'Table 3' },
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

  // Fetch all boards for the user
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!id) return;
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
    axios.get(`${API_URL}/boards/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        setSelectedBoard(res.data);
        loadBoardContent(res.data);
        setLoadingBoards(false);
      })
      .catch((err) => {
        setError('Not authorized or board not found');
        setLoadingBoards(false);
        navigate('/login');
      });
  }, [token, id]);

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

  // SVG icons (Heroicons outline, inlined for Pencil and Trash)
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
    const url = URL.createObjectURL(file);
    setCanvasFrames((prev) =>
      prev.map((f) =>
        f.id === frameId ? { ...f, imageSrc: url } : f
      )
    );
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="w-full py-6 bg-gradient-to-r from-gray-900 via-gray-800 to-black shadow text-center relative">
        <h1 className="text-3xl font-extrabold text-white tracking-wide drop-shadow">Canvas Board</h1>
        <div className="absolute top-4 right-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-gray-700 text-xl font-bold shadow-md border-2 border-gray-200">
            {username ? username.charAt(0).toUpperCase() : '?'}
          </div>
          <button
            onClick={handleLogout}
            className="bg-white/90 text-gray-800 hover:bg-gray-200 hover:text-black px-4 py-2 rounded-full font-semibold shadow transition-colors border border-gray-300 hover:border-gray-400"
          >
            Logout
          </button>
        </div>
      </header>
      {/* Board List and Create */}
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
                {editingBoardId === board._id ? (
                  <span className="flex items-center mr-2 min-w-0 max-w-[110px]">
                    <input
                      className={`px-2 py-1 rounded text-sm font-semibold border focus:outline-none focus:ring-2 focus:ring-blue-400 truncate ${selectedBoard?._id === board._id ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
                      value={editBoardName}
                      onChange={e => setEditBoardName(e.target.value)}
                      onKeyDown={e => handleEditInputKey(e, board)}
                      disabled={editSaving}
                      autoFocus
                      style={{ minWidth: 60, maxWidth: 110 }}
                    />
                    <button
                      onClick={e => { e.stopPropagation(); saveBoardName(board); }}
                      className="ml-1 px-2 py-1 rounded bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition disabled:opacity-60"
                      disabled={editSaving}
                      type="button"
                      tabIndex={-1}
                    >
                      {editSaving ? <span style={spinnerStyle} /> : <span className="text-base">✔</span>}
                    </button>
                  </span>
                ) : (
                  <span
                    className={`truncate max-w-[110px] mr-2 ${selectedBoard?._id === board._id ? 'text-white' : 'text-gray-900'} cursor-pointer`}
                    onDoubleClick={e => { e.stopPropagation(); startEditingBoard(board); }}
                    title="Double-click to edit"
                  >
                    {board.name}
                  </span>
                )}
                {/* Edit icon */}
                {editingBoardId !== board._id && (
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
                {/* Delete icon: only this triggers deletion, with stopPropagation */}
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
              </div>
            </div>
          ))}
        </div>
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
      </div>
      {/* Error and Saving */}
      {(error || saving) && (
        <div className="w-full flex justify-center mt-2">
          {error && <span className="text-red-500 font-medium">{error}</span>}
          {saving && <span className="text-blue-500 ml-4">Saving...</span>}
        </div>
      )}
      {/* Reset Button Row */}
      <div className="w-full flex justify-end gap-2 px-8 mt-2">
        <button
          onClick={saveBoardContent}
          className="bg-white/80 hover:bg-white text-gray-900 font-bold px-4 py-2 rounded-full shadow transition border border-white/60"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={() => handleDownloadBoard('png')}
          className="bg-white/60 hover:bg-white text-gray-900 font-bold px-4 py-2 rounded-full shadow transition border border-white/40"
          title="Download board as image"
        >
          Download
        </button>
        <button
          onClick={handleReset}
          className="bg-red-500/80 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-full shadow transition"
        >
          Reset
        </button>
      </div>
      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row gap-4 p-4 md:p-8 overflow-hidden">
        {/* Board Area */}
        <section className="flex-1 flex items-center justify-center overflow-auto">
          <div className="relative w-full h-full max-w-full max-h-full min-w-[300px] min-h-[300px] bg-gradient-to-br from-gray-100/90 via-gray-200/80 to-white/90 rounded-2xl shadow-2xl p-4 flex items-center justify-center overflow-auto backdrop-blur-md">
            <Rnd
              ref={setBoardRef}
              size={{ width: widthNum, height: heightNum }}
              position={{ x: 0, y: 0 }}
              disableDragging
              enableResizing={{ bottom: true, right: true, bottomRight: true }}
              onResizeStop={(e, direction, ref) => {
                setBoardSize({ width: ref.offsetWidth.toString(), height: ref.offsetHeight.toString() });
              }}
              minWidth={300}
              minHeight={300}
              bounds="parent"
              className="relative bg-transparent overflow-hidden rounded-lg border border-gray-200 shadow-md"
            >
              {backgroundImage && (
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
                  style={{ zIndex: 0 }} // Ensure frame Rnd is at the lowest z-index
                >
                  <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                    {/* Delete button for frame */}
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
                    {/* Centered, slightly smaller image or upload area */}
                    {frame.imageSrc ? (
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: '85%',
                          height: '85%',
                          transform: 'translate(-50%, -50%)',
                          zIndex: 0,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 8,
                        }}
                      >
                        <img
                          src={frame.imageSrc}
                          alt="Framed"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'fill',
                            display: 'block',
                            borderRadius: 8,
                            zIndex: 0,
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
                const isSelected = img.id === selectedImageId;
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
                      onClick={() => handleImageClick(img.id)}
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
                      <img
                        src={img.src}
                        alt="Draggable"
                        className={`w-full h-full ${
                          (isSelected || hoveredImageId === img.id)
                            ? 'border-2 border-blue-500'
                            : 'border border-transparent'
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
        {/* Tools Sidebar (scrollable) */}
        <aside className="w-full md:w-80 min-w-[250px] max-h-[calc(100vh-100px)] overflow-y-auto bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-6 space-y-4 flex-shrink-0">
          <h2 className="text-xl font-extrabold mb-2 text-gray-900">Tools</h2>
          {/* Manual Board Size Inputs */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Board Width (px)</label>
            <input
              type="number"
              name="width"
              max={2000}
              value={boardSize.width}
              onChange={handleSizeChange}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900 placeholder-gray-400 shadow-sm"
              placeholder="Enter width ≥ 300"
            />
            <label className="text-sm font-semibold text-gray-900">Board Height (px)</label>
            <input
              type="number"
              name="height"
              max={2000}
              value={boardSize.height}
              onChange={handleSizeChange}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900 placeholder-gray-400 shadow-sm"
              placeholder="Enter height ≥ 300"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Upload Background
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBackgroundUpload}
              ref={backgroundInputRef}
              className="block w-full text-sm border border-gray-300 rounded-lg cursor-pointer bg-white text-gray-900 placeholder-gray-400 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Add Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              ref={addImagesInputRef}
              className="block w-full text-sm border border-gray-300 rounded-lg cursor-pointer bg-white text-gray-900 placeholder-gray-400 shadow-sm"
            />
          </div>
          {/* Shapes section - only for image items, not decor items */}
          {selectedImageId && (() => {
            const selectedImg = images.find(img => img.id === selectedImageId);
            // Only show shapes if the selected image is NOT a decor (not from DEFAULT_DECORS and not a user decor)
            const isDefaultDecor = selectedImg && DEFAULT_DECORS.some(decor => decor.src === selectedImg.src);
            const isUserDecor = selectedImg && decors.some(decor => `http://localhost:5001${decor.imageUrl}` === selectedImg.src);
            if (!selectedImg || isDefaultDecor || isUserDecor) return null;
            return (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Shapes</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      shape: 'rectangle',
                      icon: (
                        <svg width="24" height="24">
                          <rect
                            x="4"
                            y="4"
                            width="16"
                            height="16"
                            rx="4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                      ),
                      label: 'Rectangle',
                    },
                    {
                      shape: 'circle',
                      icon: (
                        <svg width="24" height="24">
                          <circle
                            cx="12"
                            cy="12"
                            r="8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
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
    <button
      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
      onClick={() => handleDeleteDecor(decor._id)}
      title="Delete"
    >
      ×
    </button>
  </div>
))}
              {decorLoading && <span className="text-xs text-gray-400">Loading...</span>}
            </div>
            <input
              type="file"
              accept="image/png,image/webp,image/jpeg,image/jpg"
              onChange={handleDecorUpload}
              ref={decorInputRef}
              className="block w-full text-xs border border-gray-300 rounded cursor-pointer bg-white text-gray-900 placeholder-gray-400 shadow-sm"
              style={{ marginTop: 4 }}
            />
            <span className="text-xs text-gray-500">PNG/WebP/JPEG only, max 5MB</span>
          </div>
          <FramesSection onAddFrame={handleAddFrameToBoard} />
        </aside>
      </main>
    </div>
  );
};

export default Whiteboard;