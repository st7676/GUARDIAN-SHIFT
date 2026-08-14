import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-xl border-2 border-red-200 p-6 md:p-8">
              {/* Error Icon */}
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              {/* Error Message */}
              <h2 className="text-center text-lg md:text-xl font-bold text-slate-800 mb-2">
                משהו השתבש! 😞
              </h2>
              <p className="text-center text-slate-600 text-sm mb-6">
                אנחנו מתנצלים על ההפרעה. אנא נסה שוב או פנה לתמיכה.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 p-3 bg-red-50 rounded border border-red-200 text-xs">
                  <summary className="font-mono text-red-700 cursor-pointer">
                    פרטי שגיאה (פיתוח בלבד)
                  </summary>
                  <pre className="mt-2 text-red-600 overflow-auto max-h-40">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}

              {/* Reset Button */}
              <button
                onClick={this.handleReset}
                className="w-full py-2 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                נסה שוב
              </button>

              {/* Home Link */}
              <a
                href="/"
                className="block text-center mt-4 text-sky-600 hover:text-sky-700 font-medium text-sm"
              >
                חזור לעמוד הבית
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
