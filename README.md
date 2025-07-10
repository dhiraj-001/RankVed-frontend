# RankVed Frontend

This is the standalone React frontend for the RankVed Chatbot Platform.

## 🚀 Quick Start

### Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173` and will proxy API requests to `http://localhost:5000`.

### Production Build

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Preview the build**:
   ```bash
   npm run preview
   ```

## 📁 Project Structure

```
frontend/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and configurations
│   ├── pages/           # Page components
│   ├── types/           # TypeScript type definitions
│   └── main.tsx         # Application entry point
├── .env                 # Environment variables
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## 🔧 Configuration

### Environment Variables

- `VITE_API_URL`: Backend API URL (default: `http://localhost:5000`)

### API Configuration

The frontend uses a centralized API configuration in `src/lib/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  getApiUrl: (path: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl}${path}`;
  }
};
```

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/rankved-frontend.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure:
     - **Framework**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Environment Variables**: `VITE_API_URL=https://your-backend-url.com`

### Deploy to Netlify

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Drag and drop the `dist` folder to [netlify.com](https://netlify.com)
   - Or connect your GitHub repository for automatic deployments

## 🛠 Development

### Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **TanStack Query** - Data fetching
- **Radix UI** - UI components
- **Wouter** - Routing
- **React Hook Form** - Form handling
- **Zod** - Validation

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style

- ESLint and Prettier are configured
- TypeScript strict mode enabled
- Tailwind CSS for styling
- Components use shadcn/ui patterns

## 🔗 Backend Connection

This frontend connects to the RankVed backend API. Make sure your backend is running and accessible at the URL specified in `VITE_API_URL`.

### CORS Configuration

Your backend must be configured to allow requests from your frontend domain:

```javascript
// In your backend server
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://your-frontend-domain.com');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

## 📝 Notes

- Session-based authentication with cookies
- All API requests include credentials
- Images are stored as base64 data URIs
- Responsive design for all screen sizes
- Dark mode support (if implemented)

## 🆘 Troubleshooting

### Common Issues

1. **API connection failures**:
   - Check `VITE_API_URL` is correct
   - Verify backend is running
   - Check CORS configuration

2. **Build errors**:
   - Ensure all dependencies are installed
   - Check TypeScript errors
   - Verify environment variables

3. **Authentication issues**:
   - Verify cookies are being sent
   - Check session configuration
   - Ensure CORS allows credentials