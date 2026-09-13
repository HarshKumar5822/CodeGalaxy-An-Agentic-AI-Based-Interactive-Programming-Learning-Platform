import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, SkipForward, SkipBack, Cpu, PlaySquare, BarChart3,
  Network, GitCommit, Info, ArrowRight, Layers, ArrowLeftRight, Search, 
  Grid3X3, Plus, Trash2, ShieldCheck, Repeat
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// --- Category & Sub-Topic Types ---
type Category = 'sorting' | 'linkedlist' | 'stackqueue' | 'arraysstrings' | 'searching' | 'bst' | 'graph' | 'backtracking';

type SortingAlgo = 'bubble' | 'selection' | 'insertion' | 'quick' | 'merge';
type LinkedListType = 'singly' | 'doubly' | 'circular';
type StackQueueMode = 'stack' | 'queue';
type ArrayStringAlgo = 'twopointers' | 'slidingwindow' | 'palindrome' | 'pattern';
type SearchAlgo = 'linear' | 'binary';
type GraphAlgo = 'bfs' | 'dfs' | 'dijkstra';
type BacktrackingAlgo = 'nqueens' | 'ratinmaze';

interface Step {
  array?: number[];
  comparing?: number[];
  swapping?: number[];
  sorted?: number[];
  pivot?: number;
  highlightLine?: number;
  description: string;
  // Linked list & Stack/Queue specific
  nodes?: { id: number; val: number }[];
  activeNodeId?: number;
  // Array/String Pointers
  leftPtr?: number;
  rightPtr?: number;
  midPtr?: number;
  windowRange?: [number, number];
  // Backtracking Grid (e.g., N-Queens or Maze)
  grid?: number[][];
  queenPositions?: [number, number][];
}

const ALGO_DETAILS: Record<string, { name: string; time: string; space: string; desc: string; code: string[] }> = {
  // --- Sorting ---
  bubble: {
    name: 'Bubble Sort',
    time: 'O(n²)',
    space: 'O(1)',
    desc: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
    code: ['for i from 0 to n-1:', '  for j from 0 to n-i-1:', '    if arr[j] > arr[j+1]:', '      swap(arr[j], arr[j+1])']
  },
  selection: {
    name: 'Selection Sort',
    time: 'O(n²)',
    space: 'O(1)',
    desc: 'Selects the minimum element from the unsorted portion and places it at the beginning.',
    code: ['for i from 0 to n-1:', '  minIdx = i', '  for j from i+1 to n:', '    if arr[j] < arr[minIdx]: minIdx = j', '  swap(arr[i], arr[minIdx])']
  },
  insertion: {
    name: 'Insertion Sort',
    time: 'O(n²)',
    space: 'O(1)',
    desc: 'Builds sorted array one item at a time by inserting elements into their correct position.',
    code: ['for i from 1 to n:', '  key = arr[i], j = i - 1', '  while j >= 0 and arr[j] > key:', '    arr[j+1] = arr[j], j--', '  arr[j+1] = key']
  },
  quick: {
    name: 'Quick Sort',
    time: 'O(n log n)',
    space: 'O(log n)',
    desc: 'Partitions array around a pivot element recursively.',
    code: ['quickSort(arr, low, high):', '  if low < high:', '    pi = partition(arr, low, high)', '    quickSort(arr, low, pi - 1)', '    quickSort(arr, pi + 1, high)']
  },
  merge: {
    name: 'Merge Sort',
    time: 'O(n log n)',
    space: 'O(n)',
    desc: 'Splits array in halves, recursively sorts them, and merges them.',
    code: ['mergeSort(arr):', '  if length <= 1: return', '  mid = length / 2', '  left = mergeSort(arr[0..mid])', '  right = mergeSort(arr[mid..end])', '  return merge(left, right)']
  },
  // --- Linked Lists ---
  singly: {
    name: 'Singly Linked List',
    time: 'O(n)',
    space: 'O(1)',
    desc: 'Linear collection of data nodes linked with single forward pointers.',
    code: ['struct Node { int val; Node* next; }', 'void insertHead(int val):', '  Node* newNode = new Node(val)', '  newNode->next = head, head = newNode', 'void reverse(): prev=null, curr=head...']
  },
  doubly: {
    name: 'Doubly Linked List',
    time: 'O(n)',
    space: 'O(1)',
    desc: 'Linear collection where nodes maintain both prev and next pointers.',
    code: ['struct Node { int val; Node* prev; Node* next; }', 'void insertTail(int val):', '  Node* newNode = new Node(val)', '  newNode->prev = tail, tail->next = newNode']
  },
  circular: {
    name: 'Circular Linked List',
    time: 'O(n)',
    space: 'O(1)',
    desc: 'Linked list where the last node points back to the head node.',
    code: ['void insert(int val):', '  tail->next = newNode', '  newNode->next = head']
  },
  // --- Stack & Queue ---
  stack: {
    name: 'Stack (LIFO)',
    time: 'O(1)',
    space: 'O(n)',
    desc: 'Last-In, First-Out data structure supporting Push, Pop, and Peek.',
    code: ['void push(x): stack.add(x)', 'int pop(): return stack.removeTop()', 'int peek(): return stack.top()']
  },
  queue: {
    name: 'Queue (FIFO)',
    time: 'O(1)',
    space: 'O(n)',
    desc: 'First-In, First-Out data structure supporting Enqueue, Dequeue, and Front.',
    code: ['void enqueue(x): queue.pushBack(x)', 'int dequeue(): return queue.popFront()', 'int front(): return queue.head()']
  },
  // --- Arrays & Strings ---
  twopointers: {
    name: 'Two Pointers Technique',
    time: 'O(n)',
    space: 'O(1)',
    desc: 'Uses two pointer markers (left & right) moving towards each other to solve search/pair problems.',
    code: ['left = 0, right = n - 1', 'while left < right:', '  if arr[left] + arr[right] == target: return', '  else if sum < target: left++', '  else: right--']
  },
  slidingwindow: {
    name: 'Sliding Window',
    time: 'O(n)',
    space: 'O(1)',
    desc: 'Maintains a dynamic or fixed subarray range window across an array.',
    code: ['for right from 0 to n-1:', '  windowSum += arr[right]', '  if right >= k - 1:', '    maxSum = max(maxSum, windowSum)', '    windowSum -= arr[left++]']
  },
  palindrome: {
    name: 'String Palindrome Checker',
    time: 'O(n)',
    space: 'O(1)',
    desc: 'Compares characters from start and end moving inwards.',
    code: ['left = 0, right = str.length - 1', 'while left < right:', '  if str[left] != str[right]: return false', '  left++, right--', 'return true']
  },
  pattern: {
    name: 'Pattern Searching (Naive/KMP)',
    time: 'O(n * m)',
    space: 'O(1)',
    desc: 'Finds occurrence of a pattern string inside a text string.',
    code: ['for i from 0 to n - m:', '  for j from 0 to m:', '    if text[i+j] != pattern[j]: break', '  if j == m: patternFound(i)']
  },
  // --- Searching ---
  linear: {
    name: 'Linear Search',
    time: 'O(n)',
    space: 'O(1)',
    desc: 'Sequentially checks each element until a match is found.',
    code: ['for i from 0 to n-1:', '  if arr[i] == target: return i', 'return -1']
  },
  binary: {
    name: 'Binary Search',
    time: 'O(log n)',
    space: 'O(1)',
    desc: 'Divides sorted array in half repeatedly to locate key.',
    code: ['low = 0, high = n - 1', 'while low <= high:', '  mid = (low + high) / 2', '  if arr[mid] == target: return mid', '  else if arr[mid] < target: low = mid + 1', '  else: high = mid - 1']
  },
  // --- Trees & Graphs ---
  bst: {
    name: 'Binary Search Tree (BST)',
    time: 'O(log n)',
    space: 'O(h)',
    desc: 'Hierarchical tree structure where left child < parent < right child.',
    code: ['insert(node, val):', '  if node == null: return new Node(val)', '  if val < node.val: node.left = insert(node.left, val)', '  else: node.right = insert(node.right, val)']
  },
  bfs: {
    name: 'Breadth-First Search (BFS)',
    time: 'O(V + E)',
    space: 'O(V)',
    desc: 'Explores graph level-by-level using a queue.',
    code: ['queue = [startNode], visited = {startNode}', 'while queue is not empty:', '  curr = queue.pop()', '  for neighbor in curr.neighbors:', '    if neighbor not in visited: visited.add(neighbor), queue.push(neighbor)']
  },
  dfs: {
    name: 'Depth-First Search (DFS)',
    time: 'O(V + E)',
    space: 'O(V)',
    desc: 'Explores as far as possible along each branch using recursion/stack.',
    code: ['stack = [startNode], visited = {}', 'while stack is not empty:', '  curr = stack.pop()', '  if curr not in visited: visited.add(curr), stack.push(curr.neighbors)']
  },
  dijkstra: {
    name: "Dijkstra's Shortest Path",
    time: 'O((V + E) log V)',
    space: 'O(V)',
    desc: 'Finds shortest paths from source to all vertices in a weighted graph.',
    code: ['dist[all] = inf, dist[src] = 0', 'pq = priority_queue({0, src})', 'while pq not empty:', '  u = pq.pop()', '  for (v, w) in u.adj: relax(u, v, w)']
  },
  // --- Backtracking ---
  nqueens: {
    name: 'N-Queens Backtracking',
    time: 'O(N!)',
    space: 'O(N)',
    desc: 'Places N non-attacking queens on an N×N chessboard.',
    code: ['solveNQueens(board, col):', '  if col >= N: return true', '  for i from 0 to N-1:', '    if isSafe(board, i, col):', '      board[i][col] = 1', '      if solveNQueens(board, col+1): return true', '      board[i][col] = 0 // backtrack']
  },
  ratinmaze: {
    name: 'Rat in a Maze',
    time: 'O(2^(N^2))',
    space: 'O(N^2)',
    desc: 'Finds path from top-left (0,0) to bottom-right (N-1,N-1) in a grid with obstacles.',
    code: ['solveMaze(x, y):', '  if x == N-1 && y == N-1: return true', '  if isSafe(x, y):', '    sol[x][y] = 1', '    if solveMaze(x+1, y) || solveMaze(x, y+1): return true', '    sol[x][y] = 0 // backtrack']
  }
};

const AlgorithmVisualizer = () => {
  const [category, setCategory] = useState<Category>('sorting');
  
  // Sub Algo selections
  const [sortingAlgo, setSortingAlgo] = useState<SortingAlgo>('bubble');
  const [linkedListType, setLinkedListType] = useState<LinkedListType>('singly');
  const [stackQueueMode, setStackQueueMode] = useState<StackQueueMode>('stack');
  const [arrayStringAlgo, setArrayStringAlgo] = useState<ArrayStringAlgo>('twopointers');
  const [searchAlgo, setSearchAlgo] = useState<SearchAlgo>('binary');
  const [graphAlgo, setGraphAlgo] = useState<GraphAlgo>('bfs');
  const [backtrackingAlgo, setBacktrackingAlgo] = useState<BacktrackingAlgo>('nqueens');

  // Controls State
  const [arraySize, setArraySize] = useState<number>(10);
  const [speed, setSpeed] = useState<number>(300);
  const [array, setArray] = useState<number[]>([]);
  const [targetVal, setTargetVal] = useState<number>(42);
  const [customInputVal, setCustomInputVal] = useState<string>('25');

  // Steps & Playback
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Dynamic Linked List / Stack State
  const [llNodes, setLlNodes] = useState<{ id: number; val: number }[]>([
    { id: 1, val: 12 }, { id: 2, val: 24 }, { id: 3, val: 38 }, { id: 4, val: 55 }
  ]);

  // Generate random data
  const generateData = (size: number) => {
    const newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 85) + 15);
    if (searchAlgo === 'binary' || category === 'searching') {
      newArr.sort((a, b) => a - b);
    }
    setArray(newArr);
    setTargetVal(newArr[Math.floor(newArr.length / 2)] || 42);
    setCurrentStepIdx(0);
    setIsPlaying(false);
    return newArr;
  };

  useEffect(() => {
    generateData(arraySize);
  }, [arraySize, category, searchAlgo]);

  // Compute Visualization Steps for Active Category & Algorithm
  useEffect(() => {
    let s: Step[] = [];
    if (category === 'sorting') {
      s = generateSortingSteps(sortingAlgo, [...array]);
    } else if (category === 'searching') {
      s = generateSearchSteps(searchAlgo, [...array], targetVal);
    } else if (category === 'arraysstrings') {
      s = generateArrayStringSteps(arrayStringAlgo, [...array]);
    } else if (category === 'linkedlist') {
      s = generateLinkedListSteps(linkedListType, [...llNodes]);
    } else if (category === 'stackqueue') {
      s = generateStackQueueSteps(stackQueueMode, [...array.slice(0, 6)]);
    } else if (category === 'backtracking') {
      s = generateBacktrackingSteps(backtrackingAlgo);
    } else {
      // Graphs / BST default steps
      s = [
        { description: 'Initial state of data structure', highlightLine: 0 },
        { description: 'Processing root/start node', highlightLine: 1 },
        { description: 'Traversing adjacent elements...', highlightLine: 2 },
        { description: 'Traversal completed successfully!', highlightLine: 3 }
      ];
    }
    setSteps(s);
    setCurrentStepIdx(0);
    setIsPlaying(false);
  }, [category, sortingAlgo, searchAlgo, arrayStringAlgo, linkedListType, stackQueueMode, backtrackingAlgo, array, llNodes, targetVal]);

  // Playback timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStepIdx < steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStepIdx(prev => prev + 1);
      }, 600 - speed);
    } else if (currentStepIdx >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIdx, steps, speed]);

  // --- Step Generators ---
  function generateSortingSteps(algo: SortingAlgo, arr: number[]): Step[] {
    const s: Step[] = [];
    let copy = [...arr];
    if (algo === 'bubble') {
      s.push({ array: [...copy], description: 'Initial array state', highlightLine: 0 });
      for (let i = 0; i < copy.length; i++) {
        for (let j = 0; j < copy.length - i - 1; j++) {
          s.push({ array: [...copy], comparing: [j, j + 1], description: `Compare ${copy[j]} & ${copy[j + 1]}`, highlightLine: 2 });
          if (copy[j] > copy[j + 1]) {
            [copy[j], copy[j + 1]] = [copy[j + 1], copy[j]];
            s.push({ array: [...copy], swapping: [j, j + 1], description: `Swapped ${copy[j + 1]} & ${copy[j]}`, highlightLine: 3 });
          }
        }
      }
      s.push({ array: [...copy], sorted: Array.from({ length: copy.length }, (_, i) => i), description: 'Array sorted!', highlightLine: 0 });
    } else {
      let sorted = [...copy].sort((a, b) => a - b);
      s.push({ array: [...copy], description: 'Initial array state', highlightLine: 0 });
      for (let i = 0; i < copy.length; i++) {
        s.push({ array: [...sorted.slice(0, i + 1), ...copy.slice(i + 1)], swapping: [i], description: `Sorting element at index ${i}`, highlightLine: 2 });
      }
      s.push({ array: sorted, sorted: Array.from({ length: copy.length }, (_, i) => i), description: 'Sorted successfully!', highlightLine: 0 });
    }
    return s;
  }

  function generateSearchSteps(algo: SearchAlgo, arr: number[], target: number): Step[] {
    const s: Step[] = [];
    if (algo === 'linear') {
      s.push({ array: [...arr], description: `Searching for target ${target}`, highlightLine: 0 });
      for (let i = 0; i < arr.length; i++) {
        s.push({ array: [...arr], comparing: [i], description: `Checking index ${i}: ${arr[i]} == ${target}?`, highlightLine: 1 });
        if (arr[i] === target) {
          s.push({ array: [...arr], sorted: [i], description: `Target ${target} found at index ${i}!`, highlightLine: 1 });
          return s;
        }
      }
      s.push({ array: [...arr], description: `Target ${target} not found in array.`, highlightLine: 2 });
    } else {
      let low = 0, high = arr.length - 1;
      s.push({ array: [...arr], leftPtr: low, rightPtr: high, description: `Binary search for target ${target}`, highlightLine: 0 });
      while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        s.push({ array: [...arr], leftPtr: low, rightPtr: high, midPtr: mid, comparing: [mid], description: `Mid = ${mid} (${arr[mid]}). Compare with ${target}`, highlightLine: 2 });
        if (arr[mid] === target) {
          s.push({ array: [...arr], sorted: [mid], description: `Target ${target} found at index ${mid}!`, highlightLine: 3 });
          return s;
        } else if (arr[mid] < target) {
          low = mid + 1;
          s.push({ array: [...arr], leftPtr: low, rightPtr: high, description: `Target > ${arr[mid]}. Search right half`, highlightLine: 4 });
        } else {
          high = mid - 1;
          s.push({ array: [...arr], leftPtr: low, rightPtr: high, description: `Target < ${arr[mid]}. Search left half`, highlightLine: 5 });
        }
      }
    }
    return s;
  }

  function generateArrayStringSteps(algo: ArrayStringAlgo, arr: number[]): Step[] {
    const s: Step[] = [];
    if (algo === 'twopointers') {
      let left = 0, right = arr.length - 1;
      s.push({ array: [...arr], leftPtr: left, rightPtr: right, description: 'Initial Two Pointer setup', highlightLine: 0 });
      while (left < right) {
        s.push({ array: [...arr], leftPtr: left, rightPtr: right, comparing: [left, right], description: `Pointers at left=${left} (${arr[left]}), right=${right} (${arr[right]})`, highlightLine: 1 });
        left++; right--;
      }
      s.push({ array: [...arr], description: 'Pointers met! Algorithm completed.', highlightLine: 4 });
    } else if (algo === 'slidingwindow') {
      const k = 3;
      for (let i = 0; i <= arr.length - k; i++) {
        s.push({ array: [...arr], windowRange: [i, i + k - 1], description: `Sliding Window from index ${i} to ${i + k - 1}`, highlightLine: 1 });
      }
    }
    return s;
  }

  function generateLinkedListSteps(type: LinkedListType, nodes: { id: number; val: number }[]): Step[] {
    const s: Step[] = [];
    s.push({ nodes: [...nodes], description: `Initial ${type} linked list`, highlightLine: 0 });
    for (let i = 0; i < nodes.length; i++) {
      s.push({ nodes: [...nodes], activeNodeId: nodes[i].id, description: `Traversing node ${nodes[i].val} (Index ${i})`, highlightLine: 1 });
    }
    return s;
  }

  function generateStackQueueSteps(mode: StackQueueMode, items: number[]): Step[] {
    const s: Step[] = [];
    s.push({ array: [...items], description: `Initial ${mode.toUpperCase()} container state`, highlightLine: 0 });
    s.push({ array: [...items, 99], swapping: [items.length], description: `${mode === 'stack' ? 'Push 99 onto Top' : 'Enqueue 99 to Rear'}`, highlightLine: 1 });
    s.push({ array: [...items], description: `${mode === 'stack' ? 'Pop Top element' : 'Dequeue Front element'}`, highlightLine: 2 });
    return s;
  }

  function generateBacktrackingSteps(algo: BacktrackingAlgo): Step[] {
    const s: Step[] = [];
    if (algo === 'nqueens') {
      s.push({ queenPositions: [], description: 'Starting N-Queens 4x4 Chessboard Placement', highlightLine: 0 });
      s.push({ queenPositions: [[0, 0]], description: 'Place Queen 1 at Row 0, Col 0', highlightLine: 3 });
      s.push({ queenPositions: [[0, 0], [1, 2]], description: 'Place Queen 2 at Row 1, Col 2 (Safe)', highlightLine: 3 });
      s.push({ queenPositions: [[0, 0], [1, 2], [2, 1]], description: 'Place Queen 3 at Row 2, Col 1 (Conflict! Backtracking...)', highlightLine: 6 });
      s.push({ queenPositions: [[0, 1], [1, 3], [2, 0], [3, 2]], description: 'Found Valid Non-Attacking 4-Queens Solution!', highlightLine: 5 });
    } else {
      s.push({ description: 'Maze Pathfinding from (0,0) to (3,3)', highlightLine: 0 });
    }
    return s;
  }

  // Sorting Custom Array Manipulations
  const handleInsertSortingElement = () => {
    const num = parseInt(customInputVal.trim(), 10);
    if (!isNaN(num)) {
      setArray(prev => [...prev, num]);
      setCurrentStepIdx(0);
      setIsPlaying(false);
      toast.success(`Inserted ${num} into sorting array!`);
    } else {
      toast.error("Please enter a valid number");
    }
  };

  const handleCustomCSVArray = () => {
    if (!customInputVal.trim()) return;
    const nums = customInputVal.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
    if (nums.length > 0) {
      setArray(nums);
      setCurrentStepIdx(0);
      setIsPlaying(false);
      toast.success(`Updated sorting array with ${nums.length} custom elements!`);
    } else {
      toast.error("Please enter numbers separated by comma (e.g. 45, 12, 89)");
    }
  };

  const handleClearSortingArray = () => {
    setArray([15, 30, 45, 60, 75]);
    setCurrentStepIdx(0);
    setIsPlaying(false);
    toast.info("Sorting array reset.");
  };

  // Linked List Manipulations
  const handleInsertLL = () => {
    const val = parseInt(customInputVal) || Math.floor(Math.random() * 90) + 10;
    const newNode = { id: Date.now(), val };
    setLlNodes(prev => [newNode, ...prev]);
    toast.success(`Inserted node ${val} at Head!`);
  };

  const handleDeleteLL = () => {
    if (llNodes.length === 0) return;
    const removed = llNodes[0];
    setLlNodes(prev => prev.slice(1));
    toast.info(`Deleted Head node ${removed.val}`);
  };

  const handleReverseLL = () => {
    setLlNodes(prev => [...prev].reverse());
    toast.success('Linked List Reversed!');
  };

  const currentStep = steps[currentStepIdx] || { array, description: 'Ready', highlightLine: 0 };
  
  // Resolve active algorithm key for metadata
  let activeKey = sortingAlgo as string;
  if (category === 'searching') activeKey = searchAlgo;
  else if (category === 'linkedlist') activeKey = linkedListType;
  else if (category === 'stackqueue') activeKey = stackQueueMode;
  else if (category === 'arraysstrings') activeKey = arrayStringAlgo;
  else if (category === 'backtracking') activeKey = backtrackingAlgo;
  else if (category === 'bst') activeKey = 'bst';
  else if (category === 'graph') activeKey = graphAlgo;

  const currentAlgoInfo = ALGO_DETAILS[activeKey] || ALGO_DETAILS.bubble;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar isLoggedIn />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1650px] mx-auto">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                <PlaySquare className="w-6 h-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
                Interactive <span className="text-primary italic">DSA Visualizer</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-sm max-w-3xl">
              Step-by-step visual playground for Sorting, Linked Lists, Stack & Queue, Arrays & Strings, Searching, Trees, Graphs, and Backtracking algorithms.
            </p>
          </div>

          {/* Master Playback Controls */}
          <div className="flex items-center gap-2.5 bg-card border border-border/50 p-2 rounded-2xl backdrop-blur-xl shadow-lg flex-wrap">
            <Button
              variant="outline"
              size="icon"
              onClick={() => { setIsPlaying(false); setCurrentStepIdx(0); }}
              className="rounded-xl"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => { setIsPlaying(false); setCurrentStepIdx(prev => Math.max(0, prev - 1)); }}
              disabled={currentStepIdx === 0}
              className="rounded-xl"
              title="Step Back"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              variant="hero"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="rounded-xl px-5 gap-2 font-bold"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => { setIsPlaying(false); setCurrentStepIdx(prev => Math.min(steps.length - 1, prev + 1)); }}
              disabled={currentStepIdx >= steps.length - 1}
              className="rounded-xl"
              title="Step Next"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateData(arraySize)}
              className="rounded-xl text-xs font-bold text-primary hover:bg-primary/10"
            >
              Regenerate
            </Button>
          </div>
        </div>

        {/* Category Tabs Header */}
        <div className="bg-card border border-border/40 p-2.5 rounded-2xl mb-6 overflow-x-auto">
          <Tabs value={category} onValueChange={(val) => setCategory(val as Category)}>
            <TabsList className="bg-muted/40 p-1 rounded-xl flex gap-1 w-max">
              <TabsTrigger value="sorting" className="rounded-lg gap-2 text-xs font-bold px-3 py-2">
                <BarChart3 className="w-4 h-4" /> Sorting
              </TabsTrigger>
              <TabsTrigger value="linkedlist" className="rounded-lg gap-2 text-xs font-bold px-3 py-2">
                <ArrowLeftRight className="w-4 h-4" /> Linked List
              </TabsTrigger>
              <TabsTrigger value="stackqueue" className="rounded-lg gap-2 text-xs font-bold px-3 py-2">
                <Layers className="w-4 h-4" /> Stack & Queue
              </TabsTrigger>
              <TabsTrigger value="arraysstrings" className="rounded-lg gap-2 text-xs font-bold px-3 py-2">
                <Grid3X3 className="w-4 h-4" /> Arrays & Strings
              </TabsTrigger>
              <TabsTrigger value="searching" className="rounded-lg gap-2 text-xs font-bold px-3 py-2">
                <Search className="w-4 h-4" /> Searching
              </TabsTrigger>
              <TabsTrigger value="bst" className="rounded-lg gap-2 text-xs font-bold px-3 py-2">
                <GitCommit className="w-4 h-4" /> BST Tree
              </TabsTrigger>
              <TabsTrigger value="graph" className="rounded-lg gap-2 text-xs font-bold px-3 py-2">
                <Network className="w-4 h-4" /> Graph
              </TabsTrigger>
              <TabsTrigger value="backtracking" className="rounded-lg gap-2 text-xs font-bold px-3 py-2">
                <ShieldCheck className="w-4 h-4" /> Backtracking
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Sub-Topic Selection & Custom Interactive Inputs */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card/60 border border-border/40 p-4 rounded-2xl mb-8">
          
          {/* Sub-Algo Badges */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-muted-foreground mr-1">Algorithm / Subtopic:</span>
            
            {category === 'sorting' && (
              (['bubble', 'selection', 'insertion', 'quick', 'merge'] as SortingAlgo[]).map(algo => (
                <Badge
                  key={algo}
                  variant={sortingAlgo === algo ? 'default' : 'outline'}
                  onClick={() => setSortingAlgo(algo)}
                  className="cursor-pointer capitalize px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/20"
                >
                  {algo}
                </Badge>
              ))
            )}

            {category === 'linkedlist' && (
              (['singly', 'doubly', 'circular'] as LinkedListType[]).map(type => (
                <Badge
                  key={type}
                  variant={linkedListType === type ? 'default' : 'outline'}
                  onClick={() => setLinkedListType(type)}
                  className="cursor-pointer capitalize px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/20"
                >
                  {type} List
                </Badge>
              ))
            )}

            {category === 'stackqueue' && (
              (['stack', 'queue'] as StackQueueMode[]).map(mode => (
                <Badge
                  key={mode}
                  variant={stackQueueMode === mode ? 'default' : 'outline'}
                  onClick={() => setStackQueueMode(mode)}
                  className="cursor-pointer uppercase px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/20"
                >
                  {mode}
                </Badge>
              ))
            )}

            {category === 'arraysstrings' && (
              (['twopointers', 'slidingwindow', 'palindrome', 'pattern'] as ArrayStringAlgo[]).map(algo => (
                <Badge
                  key={algo}
                  variant={arrayStringAlgo === algo ? 'default' : 'outline'}
                  onClick={() => setArrayStringAlgo(algo)}
                  className="cursor-pointer capitalize px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/20"
                >
                  {algo}
                </Badge>
              ))
            )}

            {category === 'searching' && (
              (['linear', 'binary'] as SearchAlgo[]).map(algo => (
                <Badge
                  key={algo}
                  variant={searchAlgo === algo ? 'default' : 'outline'}
                  onClick={() => setSearchAlgo(algo)}
                  className="cursor-pointer capitalize px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/20"
                >
                  {algo} Search
                </Badge>
              ))
            )}

            {category === 'graph' && (
              (['bfs', 'dfs', 'dijkstra'] as GraphAlgo[]).map(algo => (
                <Badge
                  key={algo}
                  variant={graphAlgo === algo ? 'default' : 'outline'}
                  onClick={() => setGraphAlgo(algo)}
                  className="cursor-pointer uppercase px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/20"
                >
                  {algo}
                </Badge>
              ))
            )}

            {category === 'backtracking' && (
              (['nqueens', 'ratinmaze'] as BacktrackingAlgo[]).map(algo => (
                <Badge
                  key={algo}
                  variant={backtrackingAlgo === algo ? 'default' : 'outline'}
                  onClick={() => setBacktrackingAlgo(algo)}
                  className="cursor-pointer capitalize px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/20"
                >
                  {algo}
                </Badge>
              ))
            )}
          </div>

          {/* Special Controls for Sorting Array Custom Operations */}
          {category === 'sorting' && (
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                value={customInputVal}
                onChange={(e) => setCustomInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInsertSortingElement()}
                placeholder="Val (e.g. 45 or 12,89,3)"
                className="w-44 h-8 text-xs font-mono rounded-lg bg-background"
              />
              <Button size="sm" variant="outline" onClick={handleInsertSortingElement} className="rounded-lg h-8 text-xs gap-1">
                <Plus className="w-3.5 h-3.5" /> Insert Val
              </Button>
              <Button size="sm" variant="hero" onClick={handleCustomCSVArray} className="rounded-lg h-8 text-xs gap-1">
                Set Array
              </Button>
              <Button size="sm" variant="ghost" onClick={handleClearSortingArray} className="rounded-lg h-8 text-xs gap-1 text-rose-400">
                <Trash2 className="w-3.5 h-3.5" /> Reset
              </Button>
            </div>
          )}

          {/* Special Controls for Linked List Operations */}
          {category === 'linkedlist' && (
            <div className="flex items-center gap-2">
              <Input
                value={customInputVal}
                onChange={(e) => setCustomInputVal(e.target.value)}
                placeholder="Val"
                className="w-16 h-8 text-xs font-mono rounded-lg bg-background"
              />
              <Button size="sm" variant="outline" onClick={handleInsertLL} className="rounded-lg h-8 text-xs gap-1">
                <Plus className="w-3.5 h-3.5" /> Insert Head
              </Button>
              <Button size="sm" variant="outline" onClick={handleDeleteLL} className="rounded-lg h-8 text-xs gap-1 text-rose-400">
                <Trash2 className="w-3.5 h-3.5" /> Delete Head
              </Button>
              <Button size="sm" variant="ghost" onClick={handleReverseLL} className="rounded-lg h-8 text-xs gap-1 text-primary">
                <Repeat className="w-3.5 h-3.5" /> Reverse
              </Button>
            </div>
          )}

        </div>

        {/* Main Grid: Visualization Canvas & Code Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Canvas (Visualizer Display) */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="relative min-h-[440px] bg-card/60 backdrop-blur-2xl border border-border/50 rounded-3xl p-6 flex flex-col justify-between shadow-2xl overflow-hidden">
              
              {/* Top Status Bar */}
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground border-b border-border/30 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span> Active / Pointer</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Comparing / Target</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Matched / Sorted</span>
                </div>
                <div className="font-bold text-foreground">
                  Step {currentStepIdx + 1} / {steps.length}
                </div>
              </div>

              {/* 1. SORTING & ARRAYS / SEARCHING VIEW */}
              {(category === 'sorting' || category === 'searching' || category === 'arraysstrings') && (
                <div className="flex-1 flex items-end justify-center gap-2 md:gap-3 py-10 px-4 h-[320px] relative">
                  {(currentStep.array || array).map((val, idx) => {
                    const isComparing = currentStep.comparing?.includes(idx);
                    const isSwapping = currentStep.swapping?.includes(idx);
                    const isSorted = currentStep.sorted?.includes(idx);
                    const isLeft = currentStep.leftPtr === idx;
                    const isRight = currentStep.rightPtr === idx;
                    const isMid = currentStep.midPtr === idx;
                    const isInWindow = currentStep.windowRange && idx >= currentStep.windowRange[0] && idx <= currentStep.windowRange[1];

                    let bgClass = 'bg-primary/70 border-primary';
                    if (isComparing) bgClass = 'bg-amber-500 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]';
                    if (isSwapping) bgClass = 'bg-rose-500 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]';
                    if (isSorted) bgClass = 'bg-emerald-500 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
                    if (isInWindow) bgClass = 'bg-purple-500/80 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]';

                    return (
                      <motion.div
                        key={idx}
                        layout
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="flex-1 max-w-[48px] flex flex-col items-center gap-2 relative group"
                      >
                        {/* Pointer Badge Markers */}
                        <div className="absolute -top-7 flex gap-1 text-[9px] font-mono font-bold">
                          {isLeft && <span className="bg-primary text-black px-1.5 rounded">L</span>}
                          {isMid && <span className="bg-amber-400 text-black px-1.5 rounded">M</span>}
                          {isRight && <span className="bg-rose-400 text-black px-1.5 rounded">R</span>}
                        </div>

                        <span className="text-[10px] font-mono font-bold text-muted-foreground group-hover:text-primary transition-colors">
                          {val}
                        </span>
                        <div
                          style={{ height: `${val * 2.8}px` }}
                          className={`w-full rounded-t-xl border-t-2 transition-colors duration-200 ${bgClass}`}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* 2. LINKED LIST VIEW */}
              {category === 'linkedlist' && (
                <div className="flex-1 flex items-center justify-center gap-4 py-8 px-4 h-[320px] overflow-x-auto">
                  {(currentStep.nodes || llNodes).map((node, i) => {
                    const isActive = currentStep.activeNodeId === node.id;
                    const isHead = i === 0;
                    const isTail = i === (currentStep.nodes || llNodes).length - 1;

                    return (
                      <div key={node.id} className="flex items-center gap-3 shrink-0">
                        <motion.div
                          layout
                          className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-1 min-w-[76px] transition-all relative ${
                            isActive
                              ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                              : 'bg-card border-border/60'
                          }`}
                        >
                          {isHead && <span className="absolute -top-3 text-[9px] font-bold uppercase bg-cq-cyan text-cq-dark px-2 rounded-full">Head</span>}
                          {isTail && <span className="absolute -bottom-3 text-[9px] font-bold uppercase bg-cq-purple text-white px-2 rounded-full">Tail</span>}
                          
                          <span className="text-sm font-mono font-bold text-foreground">{node.val}</span>
                          <span className="text-[9px] font-mono text-muted-foreground">next ➔</span>
                        </motion.div>

                        {!isTail && (
                          <div className="flex items-center text-primary">
                            <ArrowRight className="w-5 h-5" />
                            {linkedListType === 'doubly' && <span className="text-[10px] font-mono text-muted-foreground -ml-4 mr-1">⇇</span>}
                          </div>
                        )}

                        {isTail && linkedListType === 'circular' && (
                          <span className="text-xs font-mono font-bold text-amber-400 border border-amber-400/40 px-2 py-1 rounded-lg">
                            ↺ to Head
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 3. STACK & QUEUE VIEW */}
              {category === 'stackqueue' && (
                <div className="flex-1 flex items-center justify-center py-8 h-[320px]">
                  {stackQueueMode === 'stack' ? (
                    <div className="w-48 border-2 border-t-0 border-primary/50 rounded-b-2xl p-3 flex flex-col-reverse gap-2 bg-muted/20 min-h-[220px]">
                      {(currentStep.array || array.slice(0, 5)).map((val, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ scale: 0.8, y: -20 }}
                          animate={{ scale: 1, y: 0 }}
                          className="bg-primary/20 border border-primary/40 rounded-xl p-2.5 text-center font-mono font-bold text-sm text-primary shadow-sm"
                        >
                          {val} {idx === (currentStep.array || array.slice(0, 5)).length - 1 && <span className="text-[9px] bg-primary text-cq-dark px-1.5 rounded ml-2">TOP</span>}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full max-w-md border-2 border-r-0 border-l-0 border-amber-500/50 p-3 flex gap-2 bg-muted/20 items-center overflow-x-auto rounded-xl">
                      {(currentStep.array || array.slice(0, 5)).map((val, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ scale: 0.8, x: 20 }}
                          animate={{ scale: 1, x: 0 }}
                          className="bg-amber-500/20 border border-amber-500/40 rounded-xl p-3 text-center font-mono font-bold text-sm text-amber-400 shrink-0 min-w-[60px]"
                        >
                          {val}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 4. BACKTRACKING N-QUEENS CHESSBOARD VIEW */}
              {category === 'backtracking' && (
                <div className="flex-1 flex items-center justify-center py-6 h-[320px]">
                  <div className="grid grid-cols-4 gap-1.5 p-3 bg-card border-2 border-border/60 rounded-2xl shadow-xl">
                    {Array.from({ length: 16 }).map((_, i) => {
                      const row = Math.floor(i / 4);
                      const col = i % 4;
                      const hasQueen = currentStep.queenPositions?.some(([r, c]) => r === row && c === col);
                      const isDark = (row + col) % 2 === 1;

                      return (
                        <div
                          key={i}
                          className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl transition-all ${
                            isDark ? 'bg-muted/60' : 'bg-card'
                          } ${hasQueen ? 'bg-amber-500/30 border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : ''}`}
                        >
                          {hasQueen ? '👑' : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Natural Language Step Description Box */}
              <div className="bg-background/80 border border-border/50 rounded-2xl p-4 flex items-center gap-3 text-xs font-medium text-foreground">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <span>{currentStep.description}</span>
              </div>

            </div>

            {/* Sliders Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card border border-border/40 p-4 rounded-2xl">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Data Elements Count:</span>
                  <span className="text-primary">{arraySize}</span>
                </div>
                <Slider value={[arraySize]} min={5} max={20} step={1} onValueChange={([val]) => setArraySize(val)} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Animation Speed:</span>
                  <span className="text-primary">{speed} ms</span>
                </div>
                <Slider value={[speed]} min={50} max={550} step={25} onValueChange={([val]) => setSpeed(val)} />
              </div>
            </div>

          </div>

          {/* Right Column: Code Tracker & Metadata */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Algorithm Info */}
            <div className="bg-card border border-border/50 rounded-3xl p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <h3 className="font-display font-bold text-lg">{currentAlgoInfo.name}</h3>
                <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/30">
                  {currentAlgoInfo.time}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">{currentAlgoInfo.desc}</p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-muted/30 border border-border/40 p-3 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Time Complexity</span>
                  <span className="text-sm font-mono font-bold text-foreground">{currentAlgoInfo.time}</span>
                </div>
                <div className="bg-muted/30 border border-border/40 p-3 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Space Complexity</span>
                  <span className="text-sm font-mono font-bold text-foreground">{currentAlgoInfo.space}</span>
                </div>
              </div>
            </div>

            {/* Pseudocode Line Tracker */}
            <div className="bg-card dark:bg-[#0c0d0e] border border-border/60 rounded-3xl p-6 space-y-4 shadow-xl transition-colors duration-300">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-primary" /> Pseudocode Tracker
                </span>
                <span className="text-[10px] font-mono text-primary font-bold">
                  Line {currentStep.highlightLine !== undefined ? currentStep.highlightLine + 1 : 1}
                </span>
              </div>

              <div className="font-mono text-xs space-y-1.5 py-2">
                {currentAlgoInfo.code.map((line, idx) => {
                  const isHighlighted = currentStep.highlightLine === idx;
                  return (
                    <div
                      key={idx}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center justify-between ${
                        isHighlighted
                          ? 'bg-primary/15 text-primary border border-primary/40 font-bold shadow-sm'
                          : 'text-muted-foreground hover:text-foreground bg-muted/30 dark:bg-transparent'
                      }`}
                    >
                      <span>{line}</span>
                      {isHighlighted && <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default AlgorithmVisualizer;
