import React, { useState } from 'react';
import axios from 'axios';

interface ShareModalProps {
  boardId: string;
  open: boolean;
  onClose: () => void;
}

const API_URL = 'http://localhost:5001/api';

const ShareModal: React.FC<ShareModalProps> = ({ boardId, open, onClose }) => {
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [expiresIn, setExpiresIn] = useState<number>(60);
  const [expiresUnit, setExpiresUnit] = useState<'minutes' | 'hours'>('minutes');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);

  if (!open) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setShareLink(null);
    setShareToken(null);
    setCopied(false);
    try {
      const token = localStorage.getItem('token');
      const res = await api.post(
        `/api/boards/${boardId}/share`,
        { permission, expiresIn, expiresUnit }
      );
      // Extract token from response
      const tokenValue = res.data.token || (res.data.link && res.data.link.split('/').pop());
      if (tokenValue) {
        setShareToken(tokenValue);
        const frontendLink = `${window.location.origin}/join?token=${tokenValue}`;
        setShareLink(frontendLink);
      } else {
        setError('Failed to extract share token');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate link');
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">Share Board</h2>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Permission</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={permission}
            onChange={e => setPermission(e.target.value as 'view' | 'edit')}
          >
            <option value="view">View</option>
            <option value="edit">Edit</option>
          </select>
        </div>
        <div className="mb-4 flex gap-2 items-end">
          <div className="flex-1">
            <label className="block font-semibold mb-1">Expires In</label>
            <input
              type="number"
              min={1}
              className="w-full border rounded px-3 py-2"
              value={expiresIn}
              onChange={e => setExpiresIn(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Unit</label>
            <select
              className="border rounded px-3 py-2"
              value={expiresUnit}
              onChange={e => setExpiresUnit(e.target.value as 'minutes' | 'hours')}
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
            </select>
          </div>
        </div>
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 disabled:opacity-60"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Link'}
        </button>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {shareLink && (
          <div className="mb-2">
            <label className="block font-semibold mb-1">Share Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border rounded px-3 py-2 bg-gray-100"
                value={shareLink}
                readOnly
              />
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-3 py-2 rounded"
                onClick={handleCopy}
                type="button"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal; 