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

    # ─── OS CODING ────────────────────────────────────────────────────
    {
        "category": "os",
        "type": "coding",
        "difficulty": "easy",
        "question_text": "Simulate a simple round-robin scheduler. Given a list of processes with their burst times and a time quantum, return the order in which processes finish and the average waiting time.\n\nExample:\nInput: processes = [('P1', 10), ('P2', 5), ('P3', 8)], quantum = 4\nOutput: average waiting time",
        "test_cases": json.dumps([
            {"input": "processes = [('P1', 4), ('P2', 3)]\nquantum = 2", "expected": "2.5"},
        ]),
    },
    {
        "category": "os",
        "type": "coding",
        "difficulty": "medium",
        "question_text": "Implement the banker's algorithm to check if a system state is safe. Given available resources, allocation matrix, and max matrix, return True if the state is safe, False otherwise.",
        "test_cases": json.dumps([
            {"input": "available = [3, 3, 2]\nallocation = [[0,1,0],[2,0,0],[3,0,2],[2,1,1],[0,0,2]]\nmax_matrix = [[7,5,3],[3,2,2],[9,0,2],[2,2,2],[4,3,3]]", "expected": "True"},
        ]),
    },

    # ─── OS THEORY ────────────────────────────────────────────────────
    {
        "category": "os",
        "type": "theory",
        "difficulty": "easy",
        "question_text": "What is the difference between a process and a thread? When would you use one over the other?",
        "test_cases": None,
    },
    {
        "category": "os",
        "type": "theory",
        "difficulty": "medium",
        "question_text": "Explain the four necessary conditions for a deadlock to occur. How can each condition be prevented?",
        "test_cases": None,
    },
    {
        "category": "os",
        "type": "theory",
        "difficulty": "medium",
        "question_text": "What is virtual memory and how does paging work? Explain what happens during a page fault.",
        "test_cases": None,
    },
    {
        "category": "os",
        "type": "theory",
        "difficulty": "hard",
        "question_text": "Compare and contrast LRU, FIFO, and Optimal page replacement algorithms. Which performs best and why?",
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
    },

    # ─── WEB CODING ───────────────────────────────────────────────────
    {
        "category": "web",
        "type": "coding",
        "difficulty": "easy",
        "question_text": "Write a function that takes a URL query string and returns a dictionary of key-value pairs.\n\nExample:\nInput: 'name=John&age=30&city=NYC'\nOutput: {'name': 'John', 'age': '30', 'city': 'NYC'}",
        "test_cases": json.dumps([
            {"input": "'name=John&age=30'", "expected": "{'name': 'John', 'age': '30'}"},
            {"input": "'key=value'", "expected": "{'key': 'value'}"},
            {"input": "''", "expected": "{}"},
        ]),
    },
    {
        "category": "web",
        "type": "coding",
        "difficulty": "medium",
        "question_text": "Implement a simple rate limiter. Given a list of request timestamps (in seconds) and a limit of N requests per 60-second window, return True if the latest request should be allowed, False if it should be blocked.\n\nExample:\nInput: timestamps = [1, 2, 3, 101], limit = 3\nOutput: True (only 1 request in the last 60 seconds)",
        "test_cases": json.dumps([
            {"input": "timestamps = [1, 2, 3, 4]\nlimit = 3", "expected": "False"},
            {"input": "timestamps = [1, 2, 3, 101]\nlimit = 3", "expected": "True"},
        ]),
    },

    # ─── WEB THEORY ───────────────────────────────────────────────────
    {
        "category": "web",
        "type": "theory",
        "difficulty": "easy",
        "question_text": "What is the difference between authentication and authorization? Give a real-world example of each.",
        "test_cases": None,
    },
    {
        "category": "web",
        "type": "theory",
        "difficulty": "medium",
        "question_text": "Explain how JWT authentication works. What are its advantages and potential security risks?",
        "test_cases": None,
    },
    {
        "category": "web",
        "type": "theory",
        "difficulty": "medium",
        "question_text": "What is the difference between SQL and NoSQL databases? When would you choose one over the other?",
        "test_cases": None,
    },
    {
        "category": "web",
        "type": "theory",
        "difficulty": "hard",
        "question_text": "Explain the concept of database indexing. How do indexes improve query performance, and what are their downsides?",
        "test_cases": None,
    },
    {
        "category": "web",
        "type": "theory",
        "difficulty": "hard",
        "question_text": "What is the N+1 query problem? How would you detect and fix it in a web application?",
        "test_cases": None,
    },
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