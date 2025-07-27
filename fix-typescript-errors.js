const fs = require('fs');
const path = require('path');

// Read the whiteboard.tsx file
const whiteboardPath = path.join(__dirname, 'frontend', 'src', 'components', 'whiteboard.tsx');
let content = fs.readFileSync(whiteboardPath, 'utf8');

// Fix unused variables by commenting them out
const fixes = [
  // Comment out unused state variables
  { from: 'const [renameBoardName, setRenameBoardName] = useState(\'\');', to: '// const [renameBoardName, setRenameBoardName] = useState(\'\');' },
  { from: 'const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null);', to: '// const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null);' },
  { from: 'const [ownerUsername, setOwnerUsername] = useState<string | null>(null);', to: '// const [ownerUsername, setOwnerUsername] = useState<string | null>(null);' },
  { from: 'const [ownerUsernameError, setOwnerUsernameError] = useState(false);', to: '// const [ownerUsernameError, setOwnerUsernameError] = useState(false);' },
  
  // Comment out unused functions
  { from: 'const handleRefreshBoard = async () => {', to: '// const handleRefreshBoard = async () => {' },
  { from: 'const handleSettingsUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {', to: '// const handleSettingsUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {' },
  { from: 'const handleSettingsPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {', to: '// const handleSettingsPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {' },
  { from: 'const handlePlanChange = async (plan: string) => {', to: '// const handlePlanChange = async (plan: string) => {' },
  
  // Comment out unused variables
  { from: 'const canUploadDecor = !isBasic || decors.length < 2;', to: '// const canUploadDecor = !isBasic || decors.length < 2;' },
  { from: 'const canUseFrames = !isBasic;', to: '// const canUseFrames = !isBasic;' },
  { from: 'const canDownload = isPro || isProPlus;', to: '// const canDownload = isPro || isProPlus;' },
  { from: 'const canShare = isProPlus;', to: '// const canShare = isProPlus;' },
  { from: 'const canReset = isPro || isProPlus;', to: '// const canReset = isPro || isProPlus;' },
  { from: 'const features = checkPlanFeatures();', to: '// const features = checkPlanFeatures();' },
  
  // Fix unused parameters in event handlers
  { from: 'onResizeStop={(e, direction, ref) => {', to: 'onResizeStop={(_e, _direction, ref) => {' },
  { from: 'onDragStop={(e, d) => {', to: 'onDragStop={(_e, d) => {' },
  { from: 'onResizeStop={(e, direction, ref, delta, position) => {', to: 'onResizeStop={(_e, _direction, ref, _delta, position) => {' },
];

// Apply fixes
fixes.forEach(fix => {
  content = content.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
});

// Write the fixed content back
fs.writeFileSync(whiteboardPath, content);

console.log('TypeScript errors fixed in whiteboard.tsx'); 