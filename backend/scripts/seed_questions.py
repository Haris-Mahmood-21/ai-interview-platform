import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import json
from app.database import SessionLocal
from app.models.question import Question

QUESTIONS = [

    # ─── DSA CODING ───────────────────────────────────────────────────
    {
        "category": "dsa",
        "type": "coding",
        "difficulty": "easy",
        "question_text": "Write a function that takes an array of integers and returns the two indices whose values add up to a target sum. Assume exactly one solution exists.\n\nExample:\nInput: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]",
        "test_cases": json.dumps([
            {"input": "nums = [2, 7, 11, 15]\ntarget = 9", "expected": "[0, 1]"},
            {"input": "nums = [3, 2, 4]\ntarget = 6", "expected": "[1, 2]"},
            {"input": "nums = [3, 3]\ntarget = 6", "expected": "[0, 1]"},
        ]),
    },
    {
        "category": "dsa",
        "type": "coding",
        "difficulty": "easy",
        "question_text": "Write a function to reverse a singly linked list and return the new head.\n\nExample:\nInput: 1 -> 2 -> 3 -> 4 -> 5\nOutput: 5 -> 4 -> 3 -> 2 -> 1",
        "test_cases": json.dumps([
            {"input": "[1, 2, 3, 4, 5]", "expected": "[5, 4, 3, 2, 1]"},
            {"input": "[1, 2]", "expected": "[2, 1]"},
            {"input": "[1]", "expected": "[1]"},
        ]),
    },
    {
        "category": "dsa",
        "type": "coding",
        "difficulty": "medium",
        "question_text": "Given a string, find the length of the longest substring without repeating characters.\n\nExample:\nInput: s = 'abcabcbb'\nOutput: 3 (the answer is 'abc')",
        "test_cases": json.dumps([
            {"input": "s = 'abcabcbb'", "expected": "3"},
            {"input": "s = 'bbbbb'", "expected": "1"},
            {"input": "s = 'pwwkew'", "expected": "3"},
        ]),
    },
    {
        "category": "dsa",
        "type": "coding",
        "difficulty": "medium",
        "question_text": "Given an array of integers, return true if any value appears at least twice. Return false if every element is distinct.\n\nExample:\nInput: [1, 2, 3, 1]\nOutput: true",
        "test_cases": json.dumps([
            {"input": "[1, 2, 3, 1]", "expected": "true"},
            {"input": "[1, 2, 3, 4]", "expected": "false"},
            {"input": "[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]", "expected": "true"},
        ]),
    },
    {
        "category": "dsa",
        "type": "coding",
        "difficulty": "hard",
        "question_text": "Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.\n\nExample:\nInput: [-2, 1, -3, 4, -1, 2, 1, -5, 4]\nOutput: 6 (subarray [4, -1, 2, 1])",
        "test_cases": json.dumps([
            {"input": "[-2, 1, -3, 4, -1, 2, 1, -5, 4]", "expected": "6"},
            {"input": "[1]", "expected": "1"},
            {"input": "[5, 4, -1, 7, 8]", "expected": "23"},
        ]),
    },

    # ─── DSA THEORY ───────────────────────────────────────────────────
    {
        "category": "dsa",
        "type": "theory",
        "difficulty": "easy",
        "question_text": "Explain the difference between a stack and a queue. Give a real-world example of each.",
        "test_cases": None,
    },
    {
        "category": "dsa",
        "type": "theory",
        "difficulty": "medium",
        "question_text": "What is a hash table and how does it handle collisions? Explain chaining and open addressing.",
        "test_cases": None,
    },
    {
        "category": "dsa",
        "type": "theory",
        "difficulty": "medium",
        "question_text": "Explain how merge sort works. What is its time and space complexity, and when would you prefer it over quicksort?",
        "test_cases": None,
    },
    {
        "category": "dsa",
        "type": "theory",
        "difficulty": "hard",
        "question_text": "What is dynamic programming? Explain the difference between memoization and tabulation with an example.",
        "test_cases": None,
    },
    {
        "category": "dsa",
        "type": "theory",
        "difficulty": "hard",
        "question_text": "Explain Dijkstra's algorithm. What data structure does it use and what is its time complexity?",
        "test_cases": None,
    },

# ─── OOP CODING ───────────────────────────────────────────────────
    {
        "category": "oop",
        "type": "coding",
        "difficulty": "easy",
        "question_text": "Create a Python class called BankAccount with attributes owner and balance. Add methods deposit(amount), withdraw(amount), and get_balance(). Withdrawal should fail if balance is insufficient.\n\nExample:\nacc = BankAccount('Ali', 1000)\nacc.deposit(500)\nacc.withdraw(200)\nprint(acc.get_balance())  # 1300",
        "test_cases": json.dumps([
            {"input": "acc = BankAccount('Ali', 1000)\nacc.deposit(500)\nprint(acc.get_balance())", "expected": "1500"},
            {"input": "acc = BankAccount('Ali', 1000)\nacc.withdraw(400)\nprint(acc.get_balance())", "expected": "600"},
            {"input": "acc = BankAccount('Ali', 100)\nresult = acc.withdraw(500)\nprint(result)", "expected": "false"},
        ]),
    },
    {
        "category": "oop",
        "type": "coding",
        "difficulty": "medium",
        "question_text": "Implement a Shape hierarchy in Python. Create a base class Shape with an abstract method area(). Create two subclasses: Circle(radius) and Rectangle(width, height). Each must implement area() correctly.\n\nExample:\nc = Circle(5)\nprint(round(c.area(), 2))  # 78.54",
        "test_cases": json.dumps([
            {"input": "import math\nc = Circle(5)\nprint(round(c.area(), 2))", "expected": "78.54"},
            {"input": "r = Rectangle(4, 6)\nprint(r.area())", "expected": "24"},
            {"input": "r = Rectangle(3, 3)\nprint(r.area())", "expected": "9"},
        ]),
    },
    {
        "category": "oop",
        "type": "coding",
        "difficulty": "medium",
        "question_text": "Implement the Singleton design pattern in Python. Create a class DatabaseConnection that ensures only one instance is ever created. Calling DatabaseConnection() multiple times should return the same object.\n\nExample:\na = DatabaseConnection()\nb = DatabaseConnection()\nprint(a is b)  # True",
        "test_cases": json.dumps([
            {"input": "a = DatabaseConnection()\nb = DatabaseConnection()\nprint(a is b)", "expected": "true"},
        ]),
    },

    # ─── OOP THEORY ───────────────────────────────────────────────────
    {
        "category": "oop",
        "type": "theory",
        "difficulty": "easy",
        "question_text": "What are the four pillars of Object-Oriented Programming? Briefly explain each one.",
        "test_cases": None,
    },
    {
        "category": "oop",
        "type": "theory",
        "difficulty": "easy",
        "question_text": "What is the difference between a class and an object? Give a real-world example of each.",
        "test_cases": None,
    },
    {
        "category": "oop",
        "type": "theory",
        "difficulty": "medium",
        "question_text": "What is the difference between method overloading and method overriding? Which one is runtime polymorphism and why?",
        "test_cases": None,
    },
    {
        "category": "oop",
        "type": "theory",
        "difficulty": "medium",
        "question_text": "When would you use an abstract class vs an interface? What are the key differences between them?",
        "test_cases": None,
    },
    {
        "category": "oop",
        "type": "theory",
        "difficulty": "medium",
        "question_text": "Explain the SOLID principles. Which one do you think is most important and why?",
        "test_cases": None,
    },
    {
        "category": "oop",
        "type": "theory",
        "difficulty": "hard",
        "question_text": "What is composition vs inheritance? Why do experienced developers say 'favor composition over inheritance'?",
        "test_cases": None,
    },
    {
        "category": "oop",
        "type": "theory",
        "difficulty": "hard",
        "question_text": "Explain the Observer design pattern. Where would you use it in a real application?",
        "test_cases": None,
    },

    # ─── REACT CODING ─────────────────────────────────────────────────
    {
        "category": "react",
        "type": "coding",
        "difficulty": "easy",
        "question_text": "Write a Python function that simulates React's useState behavior. Create a class StateManager with methods get_state(), set_state(value), and a render callback that fires whenever state changes.\n\nExample:\nsm = StateManager(0)\nsm.set_state(5)\nprint(sm.get_state())  # 5",
        "test_cases": json.dumps([
            {"input": "sm = StateManager(0)\nsm.set_state(5)\nprint(sm.get_state())", "expected": "5"},
            {"input": "sm = StateManager('hello')\nsm.set_state('world')\nprint(sm.get_state())", "expected": "world"},
        ]),
    },
    {
        "category": "react",
        "type": "coding",
        "difficulty": "medium",
        "question_text": "Write a Python function that simulates a simple event emitter (similar to React's synthetic event system). Create an EventEmitter class with on(event, callback), emit(event, data), and off(event, callback) methods.\n\nExample:\nem = EventEmitter()\nem.on('click', lambda d: print(f'clicked: {d}'))\nem.emit('click', 'button1')",
        "test_cases": json.dumps([
            {"input": "results = []\nem = EventEmitter()\nem.on('click', lambda d: results.append(d))\nem.emit('click', 'btn')\nprint(results)", "expected": "['btn']"},
            {"input": "results = []\nem = EventEmitter()\nfn = lambda d: results.append(d)\nem.on('click', fn)\nem.off('click', fn)\nem.emit('click', 'btn')\nprint(results)", "expected": "[]"},
        ]),
    },

    # ─── REACT THEORY ─────────────────────────────────────────────────
    {
        "category": "react",
        "type": "theory",
        "difficulty": "easy",
        "question_text": "What is the virtual DOM in React and why does it exist? How does React use it to update the UI efficiently?",
        "test_cases": None,
    },
    {
        "category": "react",
        "type": "theory",
        "difficulty": "easy",
        "question_text": "What is the difference between props and state in React? When would you use one vs the other?",
        "test_cases": None,
    },
    {
        "category": "react",
        "type": "theory",
        "difficulty": "medium",
        "question_text": "Explain useEffect in React. What does the dependency array do and what happens if you omit it?",
        "test_cases": None,
    },
    {
        "category": "react",
        "type": "theory",
        "difficulty": "medium",
        "question_text": "What is the difference between useMemo and useCallback? When would you use each one?",
        "test_cases": None,
    },
    {
        "category": "react",
        "type": "theory",
        "difficulty": "medium",
        "question_text": "What is prop drilling and how do you solve it? Explain Context API and when you would use an external state manager instead.",
        "test_cases": None,
    },
    {
        "category": "react",
        "type": "theory",
        "difficulty": "hard",
        "question_text": "What is the difference between server-side rendering and client-side rendering in Next.js? When would you choose SSR over SSG?",
        "test_cases": None,
    },
    {
        "category": "react",
        "type": "theory",
        "difficulty": "hard",
        "question_text": "Explain React's reconciliation algorithm. How does React decide what to re-render and what role does the key prop play?",
        "test_cases": None,
    },

    # ─── ML CODING ────────────────────────────────────────────────────
    {
        "category": "ml",
        "type": "coding",
        "difficulty": "easy",
        "question_text": "Implement linear regression from scratch using gradient descent. Given X (features) and y (labels), return the learned weights after 1000 iterations with learning rate 0.01.\n\nDo not use sklearn.",
        "test_cases": json.dumps([
            {"input": "X = [1, 2, 3, 4, 5]\ny = [2, 4, 6, 8, 10]", "expected": "weights close to [0, 2]"},
        ]),
    },
    {
        "category": "ml",
        "type": "coding",
        "difficulty": "medium",
        "question_text": "Implement k-means clustering from scratch. Given a list of 2D points and k, return the final cluster centroids after convergence.\n\nExample:\nInput: points = [(1,1),(1,2),(10,10),(10,11)], k = 2\nOutput: two centroids near (1, 1.5) and (10, 10.5)",
        "test_cases": json.dumps([
            {"input": "points = [(1,1),(2,1),(10,10),(11,10)]\nk = 2", "expected": "centroids near (1.5, 1.0) and (10.5, 10.0)"},
        ]),
    },

    # ─── ML THEORY ────────────────────────────────────────────────────
    {
        "category": "ml",
        "type": "theory",
        "difficulty": "easy",
        "question_text": "What is the difference between supervised and unsupervised learning? Give an example of each.",
        "test_cases": None,
    },
    {
        "category": "ml",
        "type": "theory",
        "difficulty": "medium",
        "question_text": "Explain overfitting and underfitting. What techniques can you use to prevent overfitting?",
        "test_cases": None,
    },
    {
        "category": "ml",
        "type": "theory",
        "difficulty": "medium",
        "question_text": "What is the bias-variance tradeoff? How does it relate to model complexity?",
        "test_cases": None,
    },
    {
        "category": "ml",
        "type": "theory",
        "difficulty": "hard",
        "question_text": "Explain how gradient descent works. What are the differences between batch, stochastic, and mini-batch gradient descent?",
        "test_cases": None,
    }
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(Question).count()
        if existing > 0:
            print(f"⚠ Question bank already has {existing} questions. Skipping seed.")
            return

        for q in QUESTIONS:
            question = Question(**q)
            db.add(question)

        db.commit()
        print(f"✅ Seeded {len(QUESTIONS)} questions into the database.")

    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()