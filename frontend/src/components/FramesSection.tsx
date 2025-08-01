import React from 'react';
import frame1 from '../assets/frame1.png';
import frame2 from '../assets/frame2.png';

const DEFAULT_FRAMES = [
  { src: frame1, name: 'Classic Frame' },
  { src: frame2, name: 'Modern Frame' },
];

interface FramesSectionProps {
  onAddFrame: (src: string) => void;
  disableAdd?: boolean;
  onUpgradeClick?: () => void;
}

const FramesSection: React.FC<FramesSectionProps> = ({ onAddFrame, disableAdd, onUpgradeClick }) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-2 text-gray-900">Frames</h3>
      <div className="flex flex-wrap gap-2 mb-2">
        {DEFAULT_FRAMES.map((frame) => (
          <button
            key={frame.src}
            className={`w-16 h-16 bg-white border rounded flex items-center justify-center shadow transition relative ${disableAdd ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
            title={disableAdd ? 'Pro users can only have 1 frame.' : frame.name}
            onClick={() => { if (disableAdd && onUpgradeClick) { onUpgradeClick(); } else if (!disableAdd) { onAddFrame(frame.src); } }}
            style={{ padding: 2 }}
            disabled={false}
          >
            <img src={frame.src} alt={frame.name} className="max-w-full max-h-full object-contain" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default FramesSection; 