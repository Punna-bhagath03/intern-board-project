import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import FramesSection from '../components/FramesSection';

interface Board {
  _id: string;
  name: string;
  content: any;
  user: string;
}

const API_URL = 'http://localhost:5001/api';

const AdminBoardView: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<any>({});

  // For canvas/frames, etc. (reuse as needed)
  const [boardSize, setBoardSize] = useState<{ width: string; height: string }>({ width: '600', height: '400' });
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [canvasFrames, setCanvasFrames] = useState<any[]>([]);

  useEffect(() => {
    if (!boardId) return;
    const fetchBoard = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/boards/${boardId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBoard(res.data);
        setContent(res.data.content || {});
        setBoardSize({
          width: res.data.content?.width ? res.data.content.width.toString() : '600',
          height: res.data.content?.height ? res.data.content.height.toString() : '400',
        });
        setBackgroundImage(res.data.content?.backgroundImage || null);
        setImages(res.data.content?.elements || []);
        setCanvasFrames(res.data.content?.frames || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch board');
      }
      setLoading(false);
    };
    fetchBoard();
  }, [boardId]);

  const handleSave = async () => {
    if (!board) return;
    setSaving(true);
    setError(null);
    const newContent = {
      width: Number(boardSize.width),
      height: Number(boardSize.height),
      backgroundImage,
      elements: images,
      frames: canvasFrames,
    };
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/boards/${board._id}`, { content: newContent }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContent(newContent);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save board');
    }
    setSaving(false);
  };

  // You can add more editor features here, or extract more logic from Whiteboard if needed

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Admin Board View</h1>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : board ? (
        <div className="max-w-5xl mx-auto bg-white rounded shadow p-6">
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="font-semibold text-lg text-gray-800 truncate">{board.name}</div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold shadow transition disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          {/* Example: show board size and allow editing */}
          <div className="flex gap-4 mb-4 flex-wrap">
            <div>
              <label className="block text-xs font-semibold mb-1">Width</label>
              <input
                type="number"
                min={300}
                max={2000}
                value={boardSize.width}
                onChange={e => setBoardSize({ ...boardSize, width: e.target.value })}
                className="border rounded px-2 py-1 text-sm w-24"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Height</label>
              <input
                type="number"
                min={300}
                max={2000}
                value={boardSize.height}
                onChange={e => setBoardSize({ ...boardSize, height: e.target.value })}
                className="border rounded px-2 py-1 text-sm w-24"
              />
            </div>
            {/* Add more controls as needed */}
          </div>
          {/* Canvas/Frames/Images section (reuse or extract from Whiteboard) */}
          <FramesSection
            onAddFrame={src => setCanvasFrames([...canvasFrames, { id: Date.now() + Math.random(), frameSrc: src, x: 100, y: 100, width: 220, height: 280 }])}
          />
          {/* Add your canvas/editor UI here, or extract from Whiteboard for full features */}
          {/* ... */}
        </div>
      ) : null}
    </div>
  );
};

export default AdminBoardView; 