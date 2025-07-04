import React, { useState, useRef } from 'react';
import { Rnd } from 'react-rnd';

interface ImageItem {
  id: number;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape?: 'rectangle' | 'circle';
}

const Whiteboard: React.FC = () => {
  const [boardSize, setBoardSize] = useState<{ width: string; height: string }>(
    {
      width: '600',
      height: '400',
    }
  );
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const addImagesInputRef = useRef<HTMLInputElement | null>(null);
  const backgroundInputRef = useRef<HTMLInputElement | null>(null);

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

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="w-full py-6 bg-white shadow text-center">
        <h1 className="text-3xl font-semibold">Canvas Board</h1>
      </header>
      {/* Reset Button Row */}
      <div className="w-full flex justify-end px-8 mt-2">
        <button
          onClick={handleReset}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded shadow transition"
        >
          Reset
        </button>
      </div>
      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row gap-4 p-4 md:p-8 overflow-hidden">
        {/* Board Area */}
        <section className="flex-1 flex items-center justify-center overflow-auto">
          <div className="relative w-full h-full max-w-full max-h-full min-w-[300px] min-h-[300px] bg-gradient-to-br from-gray-50 to-gray-200 rounded-xl shadow-lg p-2 flex items-center justify-center overflow-auto">
            <Rnd
              size={{
                width: widthNum,
                height: heightNum,
              }}
              position={{ x: 0, y: 0 }}
              disableDragging
              enableResizing={{
                bottom: true,
                right: true,
                bottomRight: true,
              }}
              onResizeStop={(e, direction, ref) => {
                setBoardSize({
                  width: ref.offsetWidth.toString(),
                  height: ref.offsetHeight.toString(),
                });
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
        <aside className="w-full md:w-80 min-w-[250px] bg-white border border-gray-200 shadow-lg rounded-xl p-4 space-y-4 flex-shrink-0">
          <h2 className="text-xl font-bold mb-2">Tools</h2>
          {/* Manual Board Size Inputs */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Board Width (px)</label>
            <input
              type="number"
              name="width"
              max={2000}
              value={boardSize.width}
              onChange={handleSizeChange}
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter width ≥ 300"
            />
            <label className="text-sm font-medium">Board Height (px)</label>
            <input
              type="number"
              name="height"
              max={2000}
              value={boardSize.height}
              onChange={handleSizeChange}
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter height ≥ 300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Upload Background
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBackgroundUpload}
              ref={backgroundInputRef}
              className="block w-full text-sm border border-gray-300 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Add Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              ref={addImagesInputRef}
              className="block w-full text-sm border border-gray-300 rounded cursor-pointer"
            />
          </div>
          {/* Shapes section - only shown if
          
          image is selected */}
          {selectedImageId && (
            <div>
              <label className="block text-sm font-medium mb-1">Shapes</label>
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
          <div className="text-gray-400 text-sm pt-2">
            More features coming soon...
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Whiteboard;
