export const LANGUAGES = [
  { id: 'python', name: 'Python', icon: 'Terminal' },
  { id: 'javascript', name: 'JavaScript', icon: 'FileJson' },
  { id: 'typescript', name: 'TypeScript', icon: 'FileJson' },
  { id: 'html', name: 'HTML', icon: 'Layout' },
  { id: 'css', name: 'CSS', icon: 'FileType2' },
  { id: 'react', name: 'React', icon: 'Code2' },
  { id: 'cpp', name: 'C++', icon: 'Terminal' },
] as const;

export const SUPPORTED_LANGUAGES = [
  { id: 'lang-python', name: 'python', title: 'Python Mastery', description: 'Master the fundamentals of Python programming.', languageId: 'python' },
  { id: 'lang-dsa-python', name: 'dsa with python', title: 'DSA with Python', description: 'Learn Data Structures and Algorithms using Python.', languageId: 'python' },
  { id: 'lang-js', name: 'js', title: 'JavaScript Essentials', description: 'Learn the core concepts of modern JavaScript.', languageId: 'javascript' },
  { id: 'lang-ts', name: 'ts', title: 'TypeScript Pro', description: 'Level up your JavaScript with static typing.', languageId: 'typescript' },
  { id: 'lang-html', name: 'html', title: 'HTML Structure', description: 'Learn the building blocks of the web.', languageId: 'html' },
  { id: 'lang-css', name: 'css', title: 'CSS Styling', description: 'Master the art of styling web pages.', languageId: 'css' },
  { id: 'lang-react', name: 'react', title: 'React Mastery', description: 'Build modern user interfaces with React.', languageId: 'react' }
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]['name'];
