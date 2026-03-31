export const SUPPORTED_LANGUAGES = [
  { id: 'lang-python', name: 'python', title: 'Python Mastery', description: 'Master the fundamentals of Python programming.' },
  { id: 'lang-dsa-python', name: 'dsa with python', title: 'DSA with Python', description: 'Learn Data Structures and Algorithms using Python.' },
  { id: 'lang-js', name: 'js', title: 'JavaScript Essentials', description: 'Learn the core concepts of modern JavaScript.' },
  { id: 'lang-ts', name: 'ts', title: 'TypeScript Pro', description: 'Level up your JavaScript with static typing.' },
  { id: 'lang-html', name: 'html', title: 'HTML Structure', description: 'Learn the building blocks of the web.' },
  { id: 'lang-css', name: 'css', title: 'CSS Styling', description: 'Master the art of styling web pages.' },
  { id: 'lang-react', name: 'react', title: 'React Mastery', description: 'Build modern user interfaces with React.' }
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]['name'];
