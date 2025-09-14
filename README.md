# 🐛 Bug Whisperer

Bug Whisperer is an MVP JavaScript code analyzer that uses ESLint to detect issues and provide auto-fixes. It features a Node.js backend with Express and a React frontend for easy code analysis.

## Features

- **JavaScript Code Analysis**: Uses ESLint programmatically to detect code issues
- **Auto-Fix Capability**: Automatically fixes common ESLint violations when possible
- **Educational Lessons**: Provides learning insights based on detected issues
- **Clean React Interface**: Simple textarea for code input with results display
- **GitHub Integration**: Hooks for fetching code from and committing fixes to GitHub repos
- **RESTful API**: Well-documented API following OpenAPI 3.0 specification

## Quick Start

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. **Install backend dependencies:**

```bash
npm install
```

2. **Install frontend dependencies:**

```bash
npm run install-frontend
```

3. **Set up environment variables:**

```bash
cp .env.example .env
# Edit .env with your GitHub token if using GitHub hooks
```

### Running the Application

1. **Build the frontend:**

```bash
npm run build
```

2. **Start the server:**

```bash
npm start
```

3. **For development with auto-reload:**

```bash
npm run dev
```

The application will be available at `http://localhost:3001`

## API Usage

### Analyze Code Endpoint

**POST** `/api/analyze`

```json
{
  "language": "javascript",
  "filename": "example.js",
  "code": "var x = 5\nconsole.log(x)"
}
```

**Response:**

```json
{
  "issues": [
    {
      "line": 1,
      "column": 1,
      "severity": "error",
      "message": "Unexpected var, use let or const instead.",
      "rule": "no-var",
      "suggestion": "Use let or const instead of var"
    }
  ],
  "fixed_code": "const x = 5;\nconsole.log(x);\n",
  "lesson": "Found 2 issue(s) in your code. Use let or const instead of var for better scoping.",
  "stats": {
    "total_issues": 2,
    "errors": 1,
    "warnings": 1,
    "auto_fixed": true
  }
}
```

## Project Structure

```
bug-whisperer/
├── server.js                    # Express server
├── package.json                 # Backend dependencies
├── analyzer/
│   └── eslintAnalyzer.js       # ESLint integration
├── frontend/
│   ├── package.json            # Frontend dependencies
│   ├── public/
│   │   └── index.html          # HTML template
│   └── src/
│       ├── App.jsx             # Main React component
│       ├── App.css             # Component styles
│       ├── index.js            # React entry point
│       └── index.css           # Global styles
├── .kiro/
│   ├── specs/
│   │   └── analyzer.spec.yaml  # API specification
│   └── hooks/
│       ├── github_fetch.js     # GitHub fetching hook
│       └── github_commit.js    # GitHub commit hook
├── .env.example                # Environment template
└── README.md                   # This file
```

## GitHub Integration

The project includes hooks for GitHub integration:

### GitHub Fetch Hook

- Fetches code files from GitHub repositories
- Lists JavaScript files in repositories
- Requires `GITHUB_TOKEN` environment variable

### GitHub Commit Hook

- Creates commits with auto-fixed code
- Can create pull requests with fixes
- Supports branch creation for fixes

### Setup GitHub Token

1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Create a new token with `repo` scope (or `public_repo` for public repos only)
3. Add the token to your `.env` file:

```bash
GITHUB_TOKEN=your_token_here
```

## ESLint Configuration

The analyzer uses these ESLint rules by default:

- `no-unused-vars`: Detect unused variables
- `no-undef`: Detect undefined variables
- `semi`: Require semicolons
- `quotes`: Enforce single quotes
- `indent`: Enforce 2-space indentation
- `no-var`: Prefer let/const over var
- `prefer-const`: Use const when possible

## Development

### Running in Development Mode

```bash
# Start backend with auto-reload
npm run dev

# In another terminal, start frontend dev server
cd frontend
npm start
```

### API Testing

Test the health endpoint:

```bash
curl http://localhost:3001/api/health
```

Test code analysis:

```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"language":"javascript","filename":"test.js","code":"var x = 5"}'
```

## 🚀 Coming Soon - Exciting Features!

Bug Whisperer is currently in MVP phase with JavaScript analysis. Here's what's coming next:

### 🌐 **Multi-Language Support**

- **TypeScript** - Full TypeScript analysis with type checking
- **Python** - PEP 8 compliance and common bug detection
- **Java** - Static analysis with SpotBugs integration
- **C++** - Memory leak detection and best practices
- **Go, Rust, PHP** - And many more languages

### 📁 **GitHub Integration**

- **Direct Repository Access** - Analyze files directly from GitHub repos
- **Branch Comparison** - Compare code quality across branches
- **PR Integration** - Automatic code review on pull requests
- **Organization Scanning** - Analyze multiple repositories at once

### 🗂️ **Project-Wide Analysis**

- **Entire Project Scanning** - Analyze complete codebases
- **File-by-File Reports** - Detailed analysis for each file
- **Dependency Analysis** - Check for outdated or vulnerable packages
- **Architecture Insights** - Code structure and complexity metrics

### 📤 **File & Folder Upload**

- **Drag & Drop Interface** - Upload files and folders directly
- **Zip File Support** - Analyze compressed project archives
- **Batch Processing** - Process multiple files simultaneously
- **Export Reports** - Download detailed analysis reports

### ⚡ **Advanced Features**

- **Custom Linting Rules** - Define your own code standards
- **Security Vulnerability Detection** - Find potential security issues
- **Performance Analysis** - Identify performance bottlenecks
- **Code Duplication Detection** - Find and eliminate duplicate code
- **Real-time Collaboration** - Team-based code review workflows

### 🎯 **Enterprise Features**

- **CI/CD Integration** - Integrate with Jenkins, GitHub Actions, etc.
- **Custom Dashboards** - Team and project-level analytics
- **API Access** - Programmatic access to analysis features
- **White-label Solutions** - Custom branding for organizations

**Stay tuned!** Follow our development progress and be the first to try these powerful new features.

## 🚀 Deployment

Want to share Bug Whisperer with the world? See our [DEPLOYMENT.md](DEPLOYMENT.md) guide for easy deployment options.

**Quick Deploy to Railway (Free & Easy):**

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) and sign in
3. Deploy from GitHub repo
4. Share your live link!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
