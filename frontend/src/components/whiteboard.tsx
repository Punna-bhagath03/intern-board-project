import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { useNavigate, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';

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
    // eslint-disable-next-line
  }, [token, id]);

  // Load board content into whiteboard
  const loadBoardContent = (board: Board) => {
    setSelectedBoard(board);
    // Defensive: if content is not set, fallback to default
    const content = board.content || {};
    setBoardSize({
      width: content.width ? content.width.toString() : '600',
      height: content.height ? content.height.toString() : '400',
    });
    setBackgroundImage(content.backgroundImage || null);
    setImages(content.elements || []);
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

  // Utility to fully reset board state and input fields
  const resetBoardState = () => {
    setBoardSize({ width: '600', height: '400' });
    setBackgroundImage(null);
    setImages([]);
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
    resetBoardState();
    navigate(`/board/${board._id}`);
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

  const handleReset = () => {
    setBoardSize({ width: '600', height: '400' });
    setBackgroundImage(null);
    setImages([]);
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

  // Add handleDeleteBoard function
  const handleDeleteBoard = async (boardId: string) => {
    if (!token) return;
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
          <span className="font-semibold text-gray-900">Boards:</span>
          {loadingBoards ? (
            <span className="text-gray-900">Loading...</span>
          ) : (
            boards.map((board) => (
              <div key={board._id} className="relative flex items-center">
                <button
                  className={`group relative px-3 py-1 rounded-full border text-sm font-semibold transition-colors flex items-center pr-7 shadow-sm ${
                    selectedBoard?._id === board._id
                      ? 'bg-white text-gray-900 border-gray-300'
                      : 'bg-white/80 text-gray-700 border-gray-300 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                  onClick={() => handleSelectBoard(board)}
                  style={{ minWidth: 0 }}
                >
                  <span className="truncate max-w-[100px] mr-3 text-gray-900">{board.name}</span>
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteBoard(board._id); }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-300 shadow hover:bg-red-500 hover:text-white hover:border-red-600 hover:scale-110 focus:outline-none"
                    title="Delete board"
                    aria-label="Delete board"
                    type="button"
                    tabIndex={-1}
                    style={{ pointerEvents: 'auto', fontSize: '1.1rem', lineHeight: 1 }}
                  >
                    <span style={{ fontSize: '1.1rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>❌</span>
                  </button>
                </button>
              </div>
            ))
          )}
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
      {/* Error and Saving Indicator */}
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
              className="relative bg-white overflow-hidden rounded-lg border border-gray-200 shadow-md"
            >
              {backgroundImage && (
                <img
                  src={backgroundImage}
                  alt="Background"
                  className="absolute top-0 left-0 w-full h-full object-cover z-0 rounded-lg"
                />
              )}
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
                        className={`w-full h-full border border-gray-300 ${
                          shape === 'circle'
                            ? 'object-cover clip-circle-img'
                            : 'object-cover'
                        }`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
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
        {/* Toolbar */}
        <aside className="w-full md:w-80 min-w-[250px] bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-6 space-y-4 flex-shrink-0">
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
          {/* Shapes section - only shown if image is selected */}
          {selectedImageId && (
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
                      ${
                        images.find((img) => img.id === selectedImageId)
                          ?.shape === shape
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
          )}
          <div className="text-gray-500 text-sm pt-2 opacity-90">
            More features coming soon...
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Whiteboard;