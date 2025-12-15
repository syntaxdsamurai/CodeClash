import { create } from 'zustand';

// Define structure for problem data (for type safety and clarity)
export interface Problem {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    description: string;
    input: string;
    output: string;
    starterCode: {
        javascript: string;
        cpp: string;
        java: string;
        python: string;
    };
}

interface GameState {
    code: string;
    output: string;
    isRunning: boolean;
    opponentProgress: number; // 0 to 100
    roomCode: string | null;  // Tracks the current room ID

    // NEW: Problem State
    currentProblem: Problem | null;
    winnerId: string | null; // ID of the user who solved it first (e.g., 'Dhruv')
    userDisplayName: string; // The local user's display name

    // Actions Definition
    setCode: (code: string) => void;
    setOutput: (output: string) => void;
    setRunning: (isRunning: boolean) => void;
    setOpponentProgress: (progress: number) => void;
    setRoomCode: (roomCode: string | null) => void;

    // NEW: Actions
    setCurrentProblem: (problem: Problem | null) => void;
    setWinnerId: (winnerId: string | null) => void;
}

// Mock Problem List (10 Problems)
const PROBLEM_SET: Problem[] = [
    {
        id: 'reverse-string',
        title: 'Reverse String',
        difficulty: 'Easy',
        description: 'Write a function that reverses a string. The input string is given as an array of characters <code>s</code>. You must do this by modifying the input array <strong>in-place</strong> with <code>O(1)</code> extra memory.',
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
        starterCode: {
            javascript: `function reverseString(s) {\n  // JavaScript Solution\n  // Modify s in-place\n  let left = 0;\n  let right = s.length - 1;\n  while (left < right) {\n    [s[left], s[right]] = [s[right], s[left]];\n    left++;\n    right--;\n  }\n}`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        // C++ Solution\n    }\n};`,
            java: `class Solution {\n    public void reverseString(char[] s) {\n        // Java Solution (Two-pointer approach for O(1) space)\n        int left = 0;\n        int right = s.length - 1;\n        while (left < right) {\n            char temp = s[left];\n            s[left] = s[right];\n            s[right] = temp;\n            left++;\n            right--;\n        }\n    }\n}`,
            python: `class Solution:\n    def reverseString(self, s: List[str]) -> None:\n        """\n        Do not return anything, modify s in-place instead.\n        """\n        s.reverse()`,
        },
    },
    {
        id: 'sum-of-two',
        title: 'Sum of Two Integers',
        difficulty: 'Easy',
        description: 'Given two integers <code>a</code> and <code>b</code>, return the sum of the two integers without using the operators <code>+</code> and <code>-</code>.',
        input: 'a = 1, b = 2',
        output: '3',
        starterCode: {
            javascript: `function getSum(a, b) {\n  // Implement logic without '+' or '-'\n  return 0;\n}`,
            cpp: `int getSum(int a, int b) {\n  // C++ Solution\n  return 0;\n}`,
            java: `class Solution {\n    public int getSum(int a, int b) {\n        // Java Solution\n        return 0;\n    }\n}`,
            python: `class Solution:\n    def getSum(self, a: int, b: int) -> int:\n        # Python Solution\n        return 0`,
        },
    },
    {
        id: 'climbing-stairs',
        title: 'Climbing Stairs',
        difficulty: 'Easy',
        description: 'You are climbing a staircase. It takes <code>n</code> steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
        input: 'n = 3',
        output: '3 (1+1+1, 1+2, 2+1)',
        starterCode: {
            javascript: `function climbStairs(n) {\n  // Dynamic Programming Solution\n  return 0;\n}`,
            cpp: `int climbStairs(int n) {\n  // C++ Solution\n  return 0;\n}`,
            java: `class Solution {\n    public int climbStairs(int n) {\n        // Java Solution\n        return 0;\n    }\n}`,
            python: `class Solution:\n    def climbStairs(self, n: int) -> int:\n        # Python Solution\n        return 0`,
        },
    },
    {
        id: 'valid-anagram',
        title: 'Valid Anagram',
        difficulty: 'Easy',
        description: 'Given two strings <code>s</code> and <code>t</code>, return true if <code>t</code> is an anagram of <code>s</code>, and false otherwise. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.',
        input: 's = "anagram", t = "nagaram"',
        output: 'true',
        starterCode: {
            javascript: `function isAnagram(s, t) {\n  // Check if t is an anagram of s\n  return false;\n}`,
            cpp: `bool isAnagram(string s, string t) {\n  // C++ Solution\n  return false;\n}`,
            java: `class Solution {\n    public boolean isAnagram(String s, String t) {\n        // Java Solution\n        return false;\n    }\n}`,
            python: `class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        # Python Solution\n        return False`,
        },
    },
    {
        id: 'max-subarray',
        title: 'Maximum Subarray',
        difficulty: 'Medium',
        description: 'Given an integer array <code>nums</code>, find the subarray with the largest sum, and return its sum (Kadane\'s algorithm).',
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6 (Subarray: [4,-1,2,1])',
        starterCode: {
            javascript: `function maxSubArray(nums) {\n  // Kadane's Algorithm\n  return 0;\n}`,
            cpp: `int maxSubArray(vector<int>& nums) {\n  // C++ Solution\n  return 0;\n}`,
            java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        // Java Solution\n        return 0;\n    }\n}`,
            python: `class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        # Python Solution\n        return 0`,
        },
    },
    {
        id: 'merge-intervals',
        title: 'Merge Intervals',
        difficulty: 'Medium',
        description: 'Given an array of intervals where <code>intervals[i] = [starti, endi]</code>, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
        input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
        output: '[[1,6],[8,10],[15,18]]',
        starterCode: {
            javascript: `function merge(intervals) {\n  // Sort and Merge\n  return intervals;\n}`,
            cpp: `vector<vector<int>> merge(vector<vector<int>>& intervals) {\n  // C++ Solution\n  return {};\n}`,
            java: `class Solution {\n    public int[][] merge(int[][] intervals) {\n        // Java Solution\n        return new int[0][];\n    }\n}`,
            python: `class Solution:\n    def merge(self, intervals: List[List[int]]) -> List[List[int]]:\n        # Python Solution\n        return []`,
        },
    },
    {
        id: 'two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        description: 'Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        starterCode: {
            javascript: `function twoSum(nums, target) {\n  // Hash Map Solution\n  return [];\n}`,
            cpp: `vector<int> twoSum(vector<int>& nums, int target) {\n  // C++ Solution\n  return {};\n}`,
            java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Java Solution\n        return new int[0];\n    }\n}`,
            python: `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Python Solution\n        return []`,
        },
    },
    {
        id: 'longest-substring',
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        description: 'Given a string <code>s</code>, find the length of the longest substring without repeating characters.',
        input: 's = "abcabcbb"',
        output: '3 ("abc")',
        starterCode: {
            javascript: `function lengthOfLongestSubstring(s) {\n  // Sliding Window Solution\n  return 0;\n}`,
            cpp: `int lengthOfLongestSubstring(string s) {\n  // C++ Solution\n  return 0;\n}`,
            java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Java Solution\n        return 0;\n    }\n}`,
            python: `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # Python Solution\n        return 0`,
        },
    },
    {
        id: 'binary-tree-inorder',
        title: 'Binary Tree Inorder Traversal',
        difficulty: 'Easy',
        description: 'Given the <code>root</code> of a binary tree, return the inorder traversal of its nodes\' values (Left -> Root -> Right).',
        input: 'root = [1,null,2,3]',
        output: '[1,3,2]',
        starterCode: {
            javascript: `function inorderTraversal(root) {\n  // Recursive Solution\n  return [];\n}`,
            cpp: `vector<int> inorderTraversal(TreeNode* root) {\n  // C++ Solution\n  return {};\n}`,
            java: `class TreeNode { int val; TreeNode left; TreeNode right; }\nclass Solution {\n    public List<Integer> inorderTraversal(TreeNode root) {\n        // Java Solution\n        return new ArrayList<>();\n    }\n}`,
            python: `class Solution:\n    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:\n        # Python Solution\n        return []`,
        },
    },
    {
        id: 'rotate-image',
        title: 'Rotate Image',
        difficulty: 'Medium',
        description: 'You are given an <code>n x n</code> 2D matrix representing an image, rotate the image by 90 degrees (clockwise). You have to rotate the image in-place, which means you must modify the input 2D matrix directly.',
        input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]',
        output: '[[7,4,1],[8,5,2],[9,6,3]]',
        starterCode: {
            javascript: `function rotate(matrix) {\n  // Transpose and Reflect\n  // Note: Function should modify matrix in-place\n}`,
            cpp: `void rotate(vector<vector<int>>& matrix) {\n  // C++ Solution\n}`,
            java: `class Solution {\n    public void rotate(int[][] matrix) {\n        // Java Solution\n    }\n}`,
            python: `class Solution:\n    def rotate(self, matrix: List[List[int]]) -> None:\n        # Python Solution (In-place)\n        pass`,
        },
    },
];

const INITIAL_CODE_SNIPPET = "// Write your solution here...\n\nfunction solution() {\n  return true;\n}";

export const useGameStore = create<GameState>((set, get) => ({
    // Initial State
    code: INITIAL_CODE_SNIPPET,
    output: "Ready to execute...",
    isRunning: false,
    opponentProgress: 0,
    roomCode: null,

    // NEW: Problem State Initialization
    currentProblem: null,
    winnerId: null,
    userDisplayName: 'Dhruv', // Mock User Name for self-reference in winner message

    // Actions Implementation
    setCode: (code: string) => set({ code }),
    setOutput: (output: string) => set({ output }),
    setRunning: (isRunning: boolean) => set({ isRunning }),
    setOpponentProgress: (progress: number) => set({ opponentProgress: progress }),
    setRoomCode: (roomCode: string | null) => set({ roomCode }),

    // NEW: Actions Implementation
    setCurrentProblem: (problem: Problem | null) => set({ currentProblem: problem }),
    setWinnerId: (winnerId: string | null) => set({ winnerId: winnerId }),
}));

// Export the mock problems for use in Arena.tsx
export { PROBLEM_SET };