#!/bin/bash

echo "🔒 Cleaning sensitive data from git history..."

# Create a new branch for clean history
CLEAN_BRANCH="production-clean-$(date +%Y%m%d)"
git checkout -b $CLEAN_BRANCH

# Remove sensitive files from git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch \
    .env* \
    **/deploy*.sh \
    **/restart-server.sh \
    **/update-*.sh \
    **/fix-*.sh \
    **/setup-*.sh \
    **/verify-*.sh \
    **/start-server.sh \
    **/test-server.sh \
    **/check-server.sh' \
  --prune-empty --tag-name-filter cat -- --all

# Add .gitignore if not exists
if [ ! -f .gitignore ]; then
    echo "Creating .gitignore..."
    cat > .gitignore << 'GITIGNORE'
.env*
*.pem
.ssh/
**/uploads/
**/node_modules/
**/*.log
**/.DS_Store
**/deploy*.sh
**/restart-server.sh
**/update-*.sh
**/fix-*.sh
**/setup-*.sh
**/verify-*.sh
**/start-server.sh
**/test-server.sh
**/check-server.sh
GITIGNORE
fi

# Stage all changes
git add .
git commit -m "chore: clean repository and remove sensitive data"

# Force push to remote
git push origin $CLEAN_BRANCH --force

echo "✅ Repository cleaned and pushed to $CLEAN_BRANCH"
echo "⚠️  Please create a pull request from $CLEAN_BRANCH to production"
