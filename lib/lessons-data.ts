export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: 'html' | 'css' | 'js' | 'python' | 'react';
  content: string;
  initialCode: {
    html?: string;
    css?: string;
    js?: string;
    ts?: string;
    py?: string;
    react?: string;
  };
}

export const lessons: Lesson[] = [];
