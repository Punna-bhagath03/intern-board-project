# 🔐 **CREDENTIAL UPDATE GUIDE - URGENT**

## 🚨 **EXPOSED CREDENTIALS FOUND**

Your local `.env` file contains the credentials that were exposed in the GitHub email:

```
MONGO_URL=mongodb+srv://crazyguyssssss3:ZDtJoOn2PqEawROj@mi-board.kaz26d2.mongodb.net/intern-board?retryWrites=true&w=majority
JWT_SECRET=mycanvassecret
GMAIL_USER=punnabhagath03@gmail.com
GMAIL_PASS=bgvr krlj vtny kjdl
```

## ✅ **IMMEDIATE ACTIONS REQUIRED**

### **1. UPDATE BACKEND .ENV FILE**

Replace your `backend/.env` file content with:

```bash
# Database Configuration - UPDATE WITH YOUR NEW MONGODB CREDENTIALS
MONGO_URL=mongodb+srv://your-new-username:your-new-password@your-cluster.mongodb.net/intern-board?retryWrites=true&w=majority

# JWT Configuration - USE THE NEW SECRET I GENERATED
JWT_SECRET=ff09400b599fcd6b3639506437d330abb53aa5fa3a5cd619cdbdf46e57a536772600b5c04e10b8ddadc225005c6c90949c53555a3dd9583a45f87808418bf9ec

# Email Configuration - UPDATE WITH NEW GMAIL APP PASSWORD
GMAIL_USER=punnabhagath03@gmail.com
GMAIL_PASS=your-new-gmail-app-password

# Client Configuration
CLIENT_ORIGIN=http://localhost:5173

# Environment
NODE_ENV=development
```

### **2. MONGODB ATLAS CREDENTIAL ROTATION**

**URGENT: Delete the exposed database user immediately!**

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com
2. **Navigate to Database Access**
3. **Delete the user**: `crazyguyssssss3`
4. **Create new database user**:
   - Username: `intern-board-user` (or any new name)
   - Password: Generate a strong password
   - Permissions: "Read and write to any database"
5. **Get new connection string** and update `MONGO_URL`

### **3. GMAIL APP PASSWORD ROTATION**

1. **Go to Google Account Settings**: https://myaccount.google.com
2. **Navigate to Security**
3. **Find "App passwords"**
4. **Delete the old app password**: `bgvr krlj vtny kjdl`
5. **Generate new app password** for your application
6. **Update `GMAIL_PASS`** in your `.env` file

### **4. JWT SECRET UPDATED**

✅ **Already generated new JWT secret**:
```
ff09400b599fcd6b3639506437d330abb53aa5fa3a5cd619cdbdf46e57a536772600b5c04e10b8ddadc225005c6c90949c53555a3dd9583a45f87808418bf9ec
```

**Update your `JWT_SECRET` with this new value.**

## 🔧 **STEP-BY-STEP UPDATE PROCESS**

### **Step 1: Update MongoDB Atlas**
```bash
# 1. Go to MongoDB Atlas Dashboard
# 2. Delete user: crazyguyssssss3
# 3. Create new user with new credentials
# 4. Get new connection string
# 5. Update MONGO_URL in backend/.env
```

### **Step 2: Update Gmail App Password**
```bash
# 1. Go to Google Account Security
# 2. Delete old app password: bgvr krlj vtny kjdl
# 3. Generate new app password
# 4. Update GMAIL_PASS in backend/.env
```

### **Step 3: Update JWT Secret**
```bash
# 1. Replace JWT_SECRET in backend/.env with:
JWT_SECRET=ff09400b599fcd6b3639506437d330abb53aa5fa3a5cd619cdbdf46e57a536772600b5c04e10b8ddadc225005c6c90949c53555a3dd9583a45f87808418bf9ec
```

### **Step 4: Test Application**
```bash
# 1. Test backend
cd backend && npm start

# 2. Test frontend
cd frontend && npm run dev

# 3. Verify all features work
```

## 🛡️ **SECURITY VERIFICATION**

After updating credentials:

```bash
# 1. Verify no credentials in git
git ls-files | grep -E "\.env"

# 2. Check for any remaining exposed credentials
grep -r "crazyguyssssss3" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "ZDtJoOn2PqEawROj" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "mycanvassecret" . --exclude-dir=node_modules --exclude-dir=.git

# Should return no results
```

## 🚀 **AFTER CREDENTIAL UPDATE**

Once you've updated all credentials:

1. **Test the application locally**
2. **Commit the security fix** (if any local changes)
3. **Proceed with Render deployment**
4. **Use new credentials in Render environment variables**

## ⚠️ **IMPORTANT NOTES**

- **All existing user sessions will be invalidated** due to JWT secret change
- **Users will need to log in again** after the update
- **Backup your new credentials securely**
- **Never commit .env files to git**

## 📞 **SUPPORT**

If you need help:
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Google App Passwords**: [support.google.com](https://support.google.com/accounts/answer/185833)
- **JWT Security**: [jwt.io](https://jwt.io)

**Complete this credential rotation immediately to secure your application!** 