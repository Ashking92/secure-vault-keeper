
# SecureVault

A modern, secure file encryption and sharing platform built with React, TypeScript, and Supabase. SecureVault provides military-grade AES-256-GCM encryption with zero-knowledge architecture, ensuring your files remain private and secure.

## 🚀 Features

### 🔐 Advanced Security
- **AES-256-GCM Encryption**: Military-grade symmetric encryption for all files
- **RSA-2048 Key Pairs**: Asymmetric encryption for secure key management
- **Zero-Knowledge Architecture**: Your private keys never leave your device
- **Client-Side Encryption**: All encryption/decryption happens in your browser

### 📁 File Management
- **Secure File Storage**: Upload and store encrypted files in the cloud
- **Instant Encryption/Decryption**: Process files locally with real-time progress
- **Multiple File Support**: Handle any file type with automatic encryption
- **File Sharing**: Share encrypted files with specific users via email

### 🔑 Key Management
- **Automatic Key Generation**: Generate secure RSA key pairs with one click
- **Key Storage**: Securely store public keys in the database
- **Recipient-Specific Encryption**: Files shared with others are re-encrypted with their public keys
- **QR Code Integration**: Scan QR codes to quickly import encryption keys

### 👤 User Experience
- **Modern UI**: Beautiful, responsive interface with dark theme
- **Real-time Progress**: Visual feedback during encryption/decryption operations
- **Profile Management**: Custom avatars and display names
- **Mobile Responsive**: Works seamlessly on all devices

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Encryption**: Web Crypto API (AES-GCM + RSA-OAEP)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Supabase account and project

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd secure-vault-keeper-main
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

### 4. Supabase Setup

1. Create a new Supabase project
2. Run the migrations in `supabase/migrations/` in order
3. Update your `.env` with the correct Supabase credentials

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at `http://localhost:8080`

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard-specific components
│   ├── profile/         # Profile management
│   └── ui/              # Shadcn/ui components
├── hooks/               # Custom React hooks
├── integrations/        # External service integrations
│   └── supabase/        # Supabase client and types
├── lib/                 # Utility functions and crypto
├── pages/               # Route components
└── App.tsx              # Main app component
```

## 🔐 Security Architecture

### Encryption Flow
1. **File Upload**: User selects a file and provides an encryption key
2. **AES Encryption**: File is encrypted using AES-256-GCM with a random IV
3. **Key Encryption**: The AES key is encrypted with the user's RSA public key
4. **Storage**: Encrypted file and encrypted key are stored in Supabase

### Decryption Flow
1. **Key Retrieval**: User's private RSA key decrypts the AES key
2. **AES Decryption**: File is decrypted using the recovered AES key and IV
3. **Download**: Original file is downloaded to the user's device

### File Sharing
1. **Recipient Selection**: User selects recipient by email
2. **Re-encryption**: File is re-encrypted with recipient's public RSA key
3. **Secure Link**: Recipient receives an email with a secure download link
4. **Access Control**: Recipient must have the correct decryption key

## 📊 Database Schema

### Core Tables
- `encrypted_files`: Stores encrypted file metadata and data
- `file_shares`: Manages file sharing relationships
- `user_keys`: Stores user RSA public keys
- `profiles`: User profile information

### Security Policies
- Row Level Security (RLS) enabled on all tables
- Users can only access their own files and shares
- Public keys are readable by all users for sharing functionality

## 🧪 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build for development
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## 🔧 Configuration

### Vite Configuration
- Server runs on port 8080
- Path aliases configured (`@/` points to `src/`)
- React SWC plugin for fast compilation

### Tailwind Configuration
- Custom cybersecurity-themed color palette
- Glassmorphism utilities
- Custom animations and shadows

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Build
```bash
npm run build
# Deploy the dist/ folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Security Notice

- **Private Keys**: Never share your RSA private keys
- **Encryption Keys**: Keep AES keys secure and backed up
- **Zero Knowledge**: This app cannot decrypt your files without your keys
- **Client-Side**: All encryption happens in your browser

## 🆘 Support

For support, please open an issue on GitHub or contact the maintainers.

---

**SecureVault** - Protecting your digital assets with military-grade security.
