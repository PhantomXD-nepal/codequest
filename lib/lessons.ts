// lib/lessons.ts
export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  challenge: string;
  hint?: string;
  initialCode: string;
  expectedOutput: string;
  type: 'beginner' | 'intermediate' | 'advanced';
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Section {
  id: string;
  title: string;
  chapters: Chapter[];
}

export const pythonCourse: Section[] = [
  {
    id: 'section-1',
    title: 'Section 1: The Basics',
    chapters: [
      {
        id: 'chapter-1',
        title: 'Introduction to Python',
        lessons: [
          {
            id: 'python-101',
            title: 'Hello World',
            description: 'Your first step into the world of Python programming.',
            content: 'Python is a powerful and easy-to-learn programming language. The most basic program you can write is one that prints "Hello, World!" to the screen.',
            challenge: 'Use the `print()` function to output "Hello, World!"',
            hint: 'Type print("Hello, World!") exactly as shown, including the quotes and parentheses.',
            initialCode: '# Write your code below\n',
            expectedOutput: 'Hello, World!\n',
            type: 'beginner',
          },
          {
            id: 'python-102',
            title: 'Variables',
            description: 'Learn how to store data in variables.',
            content: 'Variables are used to store information to be referenced and manipulated in a computer program. In Python, you can create a variable by assigning a value to a name using the `=` operator.',
            challenge: 'Create a variable named `message` and assign it the value "Python is fun!". Then print the variable.',
            hint: 'First line: message = "Python is fun!"\nSecond line: print(message)',
            initialCode: '# Create variable and print it\n',
            expectedOutput: 'Python is fun!\n',
            type: 'beginner',
          },
        ],
      },
      {
        id: 'chapter-2',
        title: 'Data Types & Math',
        lessons: [
          {
            id: 'python-201',
            title: 'Numbers',
            description: 'Working with integers and floats.',
            content: 'Python supports integers (whole numbers) and floats (decimal numbers). You can perform basic arithmetic operations like addition (+), subtraction (-), multiplication (*), and division (/).',
            challenge: 'Calculate the sum of 15 and 27 and print the result.',
            hint: 'You can do math directly inside the print function: print(15 + 27)',
            initialCode: '# Add 15 and 27\n',
            expectedOutput: '42\n',
            type: 'beginner',
          },
          {
            id: 'python-202',
            title: 'Strings',
            description: 'Manipulating text data.',
            content: 'Strings are sequences of characters enclosed in quotes. You can concatenate (join) strings using the `+` operator.',
            challenge: 'Create two variables `first` with "Code" and `second` with "Quest". Print their concatenation with a space in between.',
            hint: 'Use the + operator to join strings. Remember to add a space string " " in the middle: print(first + " " + second)',
            initialCode: 'first = "Code"\nsecond = "Quest"\n# Print "Code Quest"\n',
            expectedOutput: 'Code Quest\n',
            type: 'beginner',
          },
        ],
      },
      {
        id: 'chapter-3',
        title: 'Control Flow',
        lessons: [
          {
            id: 'python-301',
            title: 'If Statements',
            description: 'Making decisions in code.',
            content: 'If statements allow you to execute code only if a certain condition is true. Use `if`, `elif`, and `else`.',
            challenge: 'Create a variable `score` set to 85. If it is greater than 80, print "Passed!".',
            hint: 'Use the > operator. Example: if score > 80:\n    print("Passed!")',
            initialCode: 'score = 85\n# Write if statement\n',
            expectedOutput: 'Passed!\n',
            type: 'intermediate',
          },
          {
            id: 'python-302',
            title: 'Loops',
            description: 'Repeating actions.',
            content: 'Loops are used to repeat a block of code. A `for` loop is commonly used to iterate over a range of numbers.',
            challenge: 'Use a `for` loop and `range(3)` to print "Hello" three times.',
            hint: 'Use the syntax: for i in range(3):\n    print("Hello")',
            initialCode: '# Print Hello 3 times\n',
            expectedOutput: 'Hello\nHello\nHello\n',
            type: 'intermediate',
          },
        ],
      },
      {
        id: 'chapter-4',
        title: 'Functions',
        lessons: [
          {
            id: 'python-401',
            title: 'Defining Functions',
            description: 'Reusable blocks of code.',
            content: 'Functions are defined using the `def` keyword. They can take arguments and return values.',
            challenge: 'Define a function `greet(name)` that prints "Hi " followed by the name. Call it with "Alex".',
            hint: 'def greet(name):\n    print("Hi " + name)\n\ngreet("Alex")',
            initialCode: '# Define and call greet\n',
            expectedOutput: 'Hi Alex\n',
            type: 'intermediate',
          },
        ],
      },
    ],
  },
  {
    id: 'section-2',
    title: 'Section 2: Advanced Concepts',
    chapters: [
      {
        id: 'chapter-5',
        title: 'Data Structures',
        lessons: [
          {
            id: 'python-501',
            title: 'Lists',
            description: 'Storing collections of items.',
            content: 'Lists are ordered collections that can hold multiple items. You can access items by their index (starting at 0).',
            challenge: 'Create a list `fruits` with "apple" and "banana". Print the first item.',
            hint: 'fruits = ["apple", "banana"]\nprint(fruits[0])',
            initialCode: '# Create list and print first item\n',
            expectedOutput: 'apple\n',
            type: 'advanced',
          },
          {
            id: 'python-502',
            title: 'Dictionaries',
            description: 'Storing key-value pairs.',
            content: 'Dictionaries are used to store data values in key:value pairs. A dictionary is a collection which is ordered, changeable and do not allow duplicates.',
            challenge: 'Create a dictionary `person` with keys "name" and "age", and values "Alice" and 25. Print the value of "name".',
            hint: 'person = {"name": "Alice", "age": 25}\nprint(person["name"])',
            initialCode: '# Create dictionary and print name\n',
            expectedOutput: 'Alice\n',
            type: 'advanced',
          },
        ],
      },
      {
        id: 'chapter-6',
        title: 'Object-Oriented Programming',
        lessons: [
          {
            id: 'python-601',
            title: 'Classes and Objects',
            description: 'Creating your own data types.',
            content: 'Python is an object oriented programming language. Almost everything in Python is an object, with its properties and methods. A Class is like an object constructor, or a "blueprint" for creating objects.',
            challenge: 'Create a class `Dog` with an `__init__` method that takes `name`. Create an instance named "Buddy" and print its name.',
            hint: 'class Dog:\n    def __init__(self, name):\n        self.name = name\n\nmy_dog = Dog("Buddy")\nprint(my_dog.name)',
            initialCode: '# Create class and instance\n',
            expectedOutput: 'Buddy\n',
            type: 'advanced',
          },
        ],
      },
    ],
  },
];
