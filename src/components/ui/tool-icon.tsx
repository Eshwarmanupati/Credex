import type { ToolId } from '@/types';

interface ToolIconProps {
  toolId: ToolId;
  className?: string;
}

export function ToolIcon({ toolId, className = "w-5 h-5" }: ToolIconProps) {
  switch (toolId) {
    case 'cursor':
      // Style 1: Code editor / Terminal style line icon </ >
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );

    case 'github_copilot':
      // Style 1: Braces icon { }
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />
        </svg>
      );

    case 'chatgpt':
      // Style 1: Premium swirl / geometric knot
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M4.5 16.5c-1.5-1.5-2.5-3.5-2.5-6s2-6 4.5-6c1.5 0 3 .5 4 1.5M19.5 7.5c1.5 1.5 2.5 3.5 2.5 6s-2 6-4.5 6c-1.5 0-3-.5-4-1.5M16.5 19.5c-1.5 1.5-3.5 2.5-6 2.5s-6-2-6-4.5c0-1.5.5-3 1.5-4M7.5 4.5c1.5-1.5 3.5-2.5 6-2.5s6 2 6 4.5c0 1.5-.5 3-1.5 4" />
        </svg>
      );

    case 'claude':
      // Style 1: Premium 8-pointed starburst / asterisk style
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <line x1="12" y1="4" x2="12" y2="20" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="6.34" y1="6.34" x2="17.66" y2="17.66" />
          <line x1="6.34" y1="17.66" x2="17.66" y2="6.34" />
        </svg>
      );

    case 'openai_api':
      // Style 1: API / consistent network node icon
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <circle cx="12" cy="5" r="2.5" />
          <circle cx="6" cy="17" r="2.5" />
          <circle cx="18" cy="17" r="2.5" />
          <line x1="10.5" y1="7.2" x2="7.5" y2="14.8" />
          <line x1="13.5" y1="7.2" x2="16.5" y2="14.8" />
        </svg>
      );

    case 'anthropic_api':
      // Style 1: Stylized Anthropic "A" monogram (two slanted vertical nodes)
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <line x1="6" y1="20" x2="11.5" y2="4" />
          <line x1="18" y1="20" x2="12.5" y2="4" />
        </svg>
      );

    case 'gemini':
      // Style 1: Beautiful mathematical 4-pointed starburst / Gemini star
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z" />
        </svg>
      );

    case 'windsurf':
      // Style 1: Dual horizontal wave lines
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M4 10c2.5-2.5 5.5-2.5 8 0s5.5 2.5 8 0" />
          <path d="M4 14c2.5-2.5 5.5-2.5 8 0s5.5 2.5 8 0" />
        </svg>
      );

    default:
      return null;
  }
}
