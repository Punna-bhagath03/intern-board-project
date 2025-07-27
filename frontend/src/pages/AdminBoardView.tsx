import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// Removed unused icon imports
import api from '../api';

// Removed unused Board interface

const AdminBoardView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // Removed unused navigate
  const [board, setBoard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Removed unused content state

  // For canvas/frames, etc. (reuse as needed)
  const [boardSize, setBoardSize] = useState<{ width: string; height: string }>({ width: '600', height: '400' });
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [canvasFrames, setCanvasFrames] = useState<any[]>([]);

  useEffect(() => {
    const fetchBoard = async () => {
      setLoading(true);
      setError(null);
      try {
        // Removed unused token variable
        const response = await api.get(`/api/admin/boards/${id}`);
        setBoard(response.data);
        setBoardSize({
          width: response.data.content?.width ? response.data.content.width.toString() : '600',
          height: response.data.content?.height ? response.data.content.height.toString() : '400',
        });
        setBackgroundImage(response.data.content?.backgroundImage || null);
        setImages(response.data.content?.elements || []);
        setCanvasFrames(response.data.content?.frames || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch board');
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [id]);

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
      // Removed unused token variable
      await api.put(`/api/boards/${board._id}`, { content: newContent });
      // setContent(newContent); // This line was removed from the new_code, so it's removed here.
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save board');
    }
    setSaving(false);
  };

  // Removed unused handleDelete function

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
          {/* The FramesSection component was removed from imports, so this section is now empty. */}
          {/* Add your canvas/editor UI here, or extract from Whiteboard for full features */}
          {/* ... */}
        </div>
      ) : null}
    </div>
  );
};

export default AdminBoardView; 