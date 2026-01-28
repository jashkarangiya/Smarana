export type DailyTip = {
    id: string;
    text: string;
    tags?: string[];
    mood?: "serious" | "pun";
};

export const DAILY_TIPS: DailyTip[] = [
    { id: "tip-001", text: "Recall first, then reveal. Your brain learns from the gap.", tags: ["recall"], mood: "serious" },
    { id: "tip-002", text: "Write the invariant before writing the code.", tags: ["thinking"], mood: "serious" },
    { id: "tip-003", text: "If you can explain it simply, you understand it.", tags: ["learning"], mood: "serious" },
    { id: "tip-004", text: "Don’t memorize solutions—memorize problem patterns.", tags: ["patterns"], mood: "serious" },
    { id: "tip-005", text: "Before coding, name the data structure you’ll use.", tags: ["planning"], mood: "serious" },
    { id: "tip-006", text: "Start with brute force, then optimize intentionally.", tags: ["strategy"], mood: "serious" },
    { id: "tip-007", text: "When stuck, re-read constraints. They usually hint the approach.", tags: ["strategy"], mood: "serious" },
    { id: "tip-008", text: "If input size screams O(n log n), don’t ship O(n²).", tags: ["complexity"], mood: "serious" },
    { id: "tip-009", text: "Edge cases: empty, single, duplicates, negatives, max values.", tags: ["testing"], mood: "serious" },
    { id: "tip-010", text: "Write a 3-line plan in comments before implementation.", tags: ["planning"], mood: "serious" },

    { id: "tip-011", text: "Two pointers love sorted arrays—sort with purpose.", tags: ["two-pointers"], mood: "serious" },
    { id: "tip-012", text: "Sliding window: define what makes the window valid.", tags: ["sliding-window"], mood: "serious" },
    { id: "tip-013", text: "Hash maps trade memory for speed—use them boldly.", tags: ["hashmap"], mood: "serious" },
    { id: "tip-014", text: "Stacks solve 'next greater' problems like magic.", tags: ["stack"], mood: "serious" },
    { id: "tip-015", text: "Queues shine in BFS. If it’s shortest path unweighted, BFS first.", tags: ["graphs"], mood: "serious" },
    { id: "tip-016", text: "Recursion is just a stack you didn’t write yourself.", tags: ["recursion"], mood: "serious" },
    { id: "tip-017", text: "DP starts by defining the state in one sentence.", tags: ["dp"], mood: "serious" },
    { id: "tip-018", text: "If DP state is unclear, try drawing small transitions.", tags: ["dp"], mood: "serious" },
    { id: "tip-019", text: "Greedy works when local optimal leads to global optimal—prove it.", tags: ["greedy"], mood: "serious" },
    { id: "tip-020", text: "Binary search isn’t for arrays—it's for monotonic answers.", tags: ["binary-search"], mood: "serious" },

    { id: "tip-021", text: "When a problem says 'k', think heap, window, or counting.", tags: ["patterns"], mood: "serious" },
    { id: "tip-022", text: "When a problem says 'minimum', think BFS/DP/binary search.", tags: ["patterns"], mood: "serious" },
    { id: "tip-023", text: "When a problem says 'subarray', think prefix sums or sliding window.", tags: ["patterns"], mood: "serious" },
    { id: "tip-024", text: "When a problem says 'substring', think window + frequency map.", tags: ["patterns"], mood: "serious" },
    { id: "tip-025", text: "When a problem says 'range queries', think prefix sums or segment tree.", tags: ["patterns"], mood: "serious" },

    { id: "tip-026", text: "Keep a “mistake journal” and review it weekly.", tags: ["learning"], mood: "serious" },
    { id: "tip-027", text: "If you failed a problem, revisit it in 1 day, not 1 week.", tags: ["spaced-repetition"], mood: "serious" },
    { id: "tip-028", text: "Your notes should be prompts, not full solutions.", tags: ["notes"], mood: "serious" },
    { id: "tip-029", text: "Write down the key trick in one line. Force compression.", tags: ["notes"], mood: "serious" },
    { id: "tip-030", text: "A solution outline beats a solution dump.", tags: ["notes"], mood: "serious" },

    { id: "tip-031", text: "If the code is messy, your thinking was messy. Pause and reframe.", tags: ["mindset"], mood: "serious" },
    { id: "tip-032", text: "Run through one example by hand before coding.", tags: ["debugging"], mood: "serious" },
    { id: "tip-033", text: "Print intermediate values before rewriting logic.", tags: ["debugging"], mood: "serious" },
    { id: "tip-034", text: "When debugging, isolate: reduce input to smallest failing case.", tags: ["debugging"], mood: "serious" },
    { id: "tip-035", text: "Name variables after meaning, not letters.", tags: ["clean-code"], mood: "serious" },

    { id: "tip-036", text: "If you can’t explain complexity, you don’t own the solution yet.", tags: ["complexity"], mood: "serious" },
    { id: "tip-037", text: "Always ask: time, space, and edge cases.", tags: ["interview"], mood: "serious" },
    { id: "tip-038", text: "In interviews, talk through tradeoffs while coding.", tags: ["interview"], mood: "serious" },
    { id: "tip-039", text: "State assumptions out loud. It prevents silent mistakes.", tags: ["interview"], mood: "serious" },
    { id: "tip-040", text: "After coding, test with 3 cases: normal, edge, worst-case.", tags: ["testing"], mood: "serious" },

    { id: "tip-041", text: "If recursion depth is large, consider iterative to avoid stack overflow.", tags: ["recursion"], mood: "serious" },
    { id: "tip-042", text: "Prefer early returns to reduce nested conditionals.", tags: ["clean-code"], mood: "serious" },
    { id: "tip-043", text: "If a loop is confusing, rewrite it with clearer boundaries.", tags: ["clean-code"], mood: "serious" },
    { id: "tip-044", text: "Off-by-one errors love inclusive/exclusive confusion. Be explicit.", tags: ["debugging"], mood: "serious" },
    { id: "tip-045", text: "For arrays, watch index bounds; for graphs, watch visited states.", tags: ["debugging"], mood: "serious" },

    { id: "tip-046", text: "Sort + two pointers is a cheat code—use it responsibly.", tags: ["two-pointers"], mood: "serious" },
    { id: "tip-047", text: "Prefix sums turn repeated sums into O(1) queries.", tags: ["prefix-sums"], mood: "serious" },
    { id: "tip-048", text: "Monotonic stack = stack that only goes one direction.", tags: ["stack"], mood: "serious" },
    { id: "tip-049", text: "Union-Find is for connectivity queries and dynamic components.", tags: ["graphs"], mood: "serious" },
    { id: "tip-050", text: "Dijkstra: non-negative weights. Bellman-Ford: negative weights.", tags: ["graphs"], mood: "serious" },

    { id: "tip-051", text: "If you see 'top k', think heap.", tags: ["heap"], mood: "serious" },
    { id: "tip-052", text: "If you see 'kth smallest', think heap or binary search on answer.", tags: ["heap", "binary-search"], mood: "serious" },
    { id: "tip-053", text: "If you see 'schedule', think priority queue + sorting.", tags: ["heap"], mood: "serious" },
    { id: "tip-054", text: "If you see 'minimum intervals', think greedy with sorting.", tags: ["greedy"], mood: "serious" },
    { id: "tip-055", text: "If you see 'overlapping', think sorting by end time.", tags: ["greedy"], mood: "serious" },

    { id: "tip-056", text: "Do one 'Quick 5' when motivation is low. Momentum matters.", tags: ["motivation"], mood: "serious" },
    { id: "tip-057", text: "Consistency beats intensity. 20 mins daily > 3 hours once.", tags: ["habits"], mood: "serious" },
    { id: "tip-058", text: "When tired, review notes instead of forcing new problems.", tags: ["habits"], mood: "serious" },
    { id: "tip-059", text: "Treat reviews like brushing teeth. Non-negotiable, small, daily.", tags: ["habits"], mood: "serious" },
    { id: "tip-060", text: "Set a stopping rule: finish after X problems, not after 'feeling done'.", tags: ["habits"], mood: "serious" },

    { id: "tip-061", text: "Use Pomodoro: 25 focus, 5 break. Or tune it to your brain.", tags: ["pomodoro"], mood: "serious" },
    { id: "tip-062", text: "If 25 feels short, try 40/10. If 50 feels long, try 35/5.", tags: ["pomodoro"], mood: "serious" },
    { id: "tip-063", text: "Take breaks away from the screen. Your eyes will thank you.", tags: ["health"], mood: "serious" },
    { id: "tip-064", text: "During breaks: stand up, breathe, drink water.", tags: ["health"], mood: "serious" },
    { id: "tip-065", text: "If you’re distracted, write the distraction down and return.", tags: ["focus"], mood: "serious" },

    { id: "tip-066", text: "Name your pattern: 'two pointers', 'BFS', 'DP'. Labeling helps recall.", tags: ["patterns"], mood: "serious" },
    { id: "tip-067", text: "After solving, summarize: state, transition, base case (DP).", tags: ["dp"], mood: "serious" },
    { id: "tip-068", text: "For trees: clarify if it’s BST or general binary tree.", tags: ["trees"], mood: "serious" },
    { id: "tip-069", text: "For graphs: clarify directed vs undirected, weighted vs unweighted.", tags: ["graphs"], mood: "serious" },
    { id: "tip-070", text: "When recursion repeats work, memoize or bottom-up it.", tags: ["dp"], mood: "serious" },

    { id: "tip-071", text: "Try to solve without looking for 10 minutes. Struggle builds memory.", tags: ["learning"], mood: "serious" },
    { id: "tip-072", text: "Don’t copy-paste solutions into notes. Write your own phrasing.", tags: ["notes"], mood: "serious" },
    { id: "tip-073", text: "If you peeked at hints, still do a clean re-solve tomorrow.", tags: ["spaced-repetition"], mood: "serious" },
    { id: "tip-074", text: "The best time to review is before you feel like you forgot.", tags: ["spaced-repetition"], mood: "serious" },
    { id: "tip-075", text: "Build your own recall prompts: 'Why this DS? Why this step?'", tags: ["notes"], mood: "serious" },

    { id: "tip-076", text: "If your solution uses sorting, mention it in complexity.", tags: ["complexity"], mood: "serious" },
    { id: "tip-077", text: "When scanning code, check loops + indices first. Most bugs live there.", tags: ["debugging"], mood: "serious" },
    { id: "tip-078", text: "When using sets/maps, confirm key type and uniqueness behavior.", tags: ["debugging"], mood: "serious" },
    { id: "tip-079", text: "If you mutate input, ask if it’s allowed.", tags: ["interview"], mood: "serious" },
    { id: "tip-080", text: "If you need fast lookups, reach for a hash map early.", tags: ["hashmap"], mood: "serious" },

    { id: "tip-081", text: "For linked lists: draw pointers. Seriously—draw them.", tags: ["linked-list"], mood: "serious" },
    { id: "tip-082", text: "For linked lists: dummy head reduces edge-case pain.", tags: ["linked-list"], mood: "serious" },
    { id: "tip-083", text: "For trees: think preorder/inorder/postorder as “when do I act?”", tags: ["trees"], mood: "serious" },
    { id: "tip-084", text: "For binary search: define low/high meaning before writing mid.", tags: ["binary-search"], mood: "serious" },
    { id: "tip-085", text: "Binary search template: use while (l <= r) or while (l < r) consistently.", tags: ["binary-search"], mood: "serious" },

    { id: "tip-086", text: "Don’t optimize too early. Correctness first, then speed.", tags: ["mindset"], mood: "serious" },
    { id: "tip-087", text: "If you can’t prove it, test it with counterexamples.", tags: ["strategy"], mood: "serious" },
    { id: "tip-088", text: "Always ask: what is the invariant that stays true?", tags: ["thinking"], mood: "serious" },
    { id: "tip-089", text: "If you’re stuck, change representation: array → graph, set → bitmask.", tags: ["strategy"], mood: "serious" },
    { id: "tip-090", text: "If constraints are small, brute force might be intended.", tags: ["strategy"], mood: "serious" },

    // Puns + playful tips (still useful)
    { id: "tip-091", text: "Stack your wins—one push at a time.", tags: ["pun", "stack"], mood: "pun" },
    { id: "tip-092", text: "Queue the confidence: you’re next in line for progress.", tags: ["pun", "queue"], mood: "pun" },
    { id: "tip-093", text: "Don’t be mean to your heap—keep it well-ordered.", tags: ["pun", "heap"], mood: "pun" },
    { id: "tip-094", text: "If your code is a mess, it’s time to re-factor…ial.", tags: ["pun"], mood: "pun" },
    { id: "tip-095", text: "When in doubt, binary search your feelings. Monotonic only.", tags: ["pun", "binary-search"], mood: "pun" },
    { id: "tip-096", text: "Be like a hash map: remember fast, forget collisions.", tags: ["pun", "hashmap"], mood: "pun" },
    { id: "tip-097", text: "Two pointers walked into a bar… they met in the middle.", tags: ["pun", "two-pointers"], mood: "pun" },
    { id: "tip-098", text: "Recursion: it’s what you do when you can’t stop calling yourself.", tags: ["pun", "recursion"], mood: "pun" },
    { id: "tip-099", text: "DP stands for “Definitely Practice”… okay, it doesn’t, but do it.", tags: ["pun", "dp"], mood: "pun" },
    { id: "tip-100", text: "Graphs: where every friendship is just an edge case.", tags: ["pun", "graphs"], mood: "pun" },

    // More practical tips
    { id: "tip-101", text: "If your approach needs too many cases, you’re missing a simpler invariant.", tags: ["strategy"], mood: "serious" },
    { id: "tip-102", text: "Try solving again using a different approach to deepen understanding.", tags: ["learning"], mood: "serious" },
    { id: "tip-103", text: "Don’t skip writing complexity—it forces honesty.", tags: ["complexity"], mood: "serious" },
    { id: "tip-104", text: "For frequency problems, think counting array if range is small.", tags: ["patterns"], mood: "serious" },
    { id: "tip-105", text: "For “anagrams”, think frequency vector signature.", tags: ["patterns"], mood: "serious" },
    { id: "tip-106", text: "For “palindrome”, think expand around center or two pointers.", tags: ["patterns"], mood: "serious" },
    { id: "tip-107", text: "For “intervals”, sort by start or end and be consistent.", tags: ["patterns"], mood: "serious" },
    { id: "tip-108", text: "For “merge”, think two pointers and stable progression.", tags: ["patterns"], mood: "serious" },
    { id: "tip-109", text: "For “k sorted”, a heap is usually the move.", tags: ["heap"], mood: "serious" },
    { id: "tip-110", text: "For “unique paths”, try DP grid thinking.", tags: ["dp"], mood: "serious" },

    { id: "tip-111", text: "Write down what you tried before switching strategies.", tags: ["learning"], mood: "serious" },
    { id: "tip-112", text: "After solving, ask: how would I teach this in 60 seconds?", tags: ["learning"], mood: "serious" },
    { id: "tip-113", text: "Track 1 'weak pattern' each week and intentionally drill it.", tags: ["habits"], mood: "serious" },
    { id: "tip-114", text: "If you solved it fast, review it sooner—easy wins fade quickly.", tags: ["spaced-repetition"], mood: "serious" },
    { id: "tip-115", text: "When reviewing, start by writing the approach from memory.", tags: ["recall"], mood: "serious" },

    { id: "tip-116", text: "When you see 'cycle', think Floyd’s algorithm or visited set.", tags: ["patterns"], mood: "serious" },
    { id: "tip-117", text: "When you see 'topological', think DAG + indegree queue.", tags: ["graphs"], mood: "serious" },
    { id: "tip-118", text: "When you see 'minimize max', think binary search on answer.", tags: ["binary-search"], mood: "serious" },
    { id: "tip-119", text: "When you see 'maximize min', think binary search on answer.", tags: ["binary-search"], mood: "serious" },
    { id: "tip-120", text: "When you see 'connected components', think DFS/BFS/Union-Find.", tags: ["graphs"], mood: "serious" },

    { id: "tip-121", text: "Make your notes scannable: bullets > paragraphs.", tags: ["notes"], mood: "serious" },
    { id: "tip-122", text: "Add 1 pitfall note every time you miss an edge case.", tags: ["notes"], mood: "serious" },
    { id: "tip-123", text: "Use 'Given/Goal/Approach' structure in notes.", tags: ["notes"], mood: "serious" },
    { id: "tip-124", text: "If you’re overwhelmed, do a single review. Tiny wins count.", tags: ["motivation"], mood: "serious" },
    { id: "tip-125", text: "Stop chasing new problems if old ones keep slipping.", tags: ["strategy"], mood: "serious" },

    // More puns
    { id: "tip-126", text: "Your streak is on fire—don’t let it get extinguished by procrastination.", tags: ["pun", "streak"], mood: "pun" },
    { id: "tip-127", text: "Don’t be negative—unless it’s a test case.", tags: ["pun", "testing"], mood: "pun" },
    { id: "tip-128", text: "If life feels O(n²), try optimizing your routine to O(n).", tags: ["pun"], mood: "pun" },
    { id: "tip-129", text: "Sorting out your thoughts? That’s just mental O(n log n).", tags: ["pun"], mood: "pun" },
    { id: "tip-130", text: "Remember: good habits have excellent time complexity.", tags: ["pun", "habits"], mood: "pun" },

    // Interview + CP
    { id: "tip-131", text: "In contests, first solve the easiest problem to build confidence.", tags: ["cp"], mood: "serious" },
    { id: "tip-132", text: "In contests, don’t overthink. Read the statement twice, then code.", tags: ["cp"], mood: "serious" },
    { id: "tip-133", text: "In interviews, confirm input/output format before coding.", tags: ["interview"], mood: "serious" },
    { id: "tip-134", text: "In interviews, mention alternative approaches briefly.", tags: ["interview"], mood: "serious" },
    { id: "tip-135", text: "If you can’t finish, communicate partial progress clearly.", tags: ["interview"], mood: "serious" },

    { id: "tip-136", text: "Prefer clarity over cleverness. Clever code is hard to debug.", tags: ["clean-code"], mood: "serious" },
    { id: "tip-137", text: "A correct simple solution beats a fancy buggy one.", tags: ["mindset"], mood: "serious" },
    { id: "tip-138", text: "When using recursion, write base case first.", tags: ["recursion"], mood: "serious" },
    { id: "tip-139", text: "When using DP, list base cases explicitly before transitions.", tags: ["dp"], mood: "serious" },
    { id: "tip-140", text: "When using BFS, mark visited when enqueuing, not dequeuing.", tags: ["graphs"], mood: "serious" },

    { id: "tip-141", text: "When using DFS, watch recursion depth on large graphs.", tags: ["graphs"], mood: "serious" },
    { id: "tip-142", text: "For mod arithmetic, normalize negatives: (x % MOD + MOD) % MOD.", tags: ["cp"], mood: "serious" },
    { id: "tip-143", text: "For integer overflow, use long/BigInt where needed.", tags: ["debugging"], mood: "serious" },
    { id: "tip-144", text: "Use examples to validate monotonicity before binary search.", tags: ["binary-search"], mood: "serious" },
    { id: "tip-145", text: "If it’s about intervals, consider a sweep line.", tags: ["patterns"], mood: "serious" },

    { id: "tip-146", text: "If you see 'parentheses', think stack + balance counters.", tags: ["stack"], mood: "serious" },
    { id: "tip-147", text: "If you see 'median', think two heaps.", tags: ["heap"], mood: "serious" },
    { id: "tip-148", text: "If you see 'cache', think LRU = hashmap + doubly linked list.", tags: ["design"], mood: "serious" },
    { id: "tip-149", text: "If you see 'stream', think incremental updates; avoid recomputation.", tags: ["design"], mood: "serious" },
    { id: "tip-150", text: "If you see 'min stack', think storing extra info per push.", tags: ["stack"], mood: "serious" },

    // More “micro tips”
    { id: "tip-151", text: "Write the function signature first. It anchors your thinking.", tags: ["planning"], mood: "serious" },
    { id: "tip-152", text: "Use small helper functions to keep logic readable.", tags: ["clean-code"], mood: "serious" },
    { id: "tip-153", text: "Avoid premature micro-optimizations. Optimize after it works.", tags: ["mindset"], mood: "serious" },
    { id: "tip-154", text: "If your solution has many nested loops, look for a data structure.", tags: ["strategy"], mood: "serious" },
    { id: "tip-155", text: "Before rewriting, add a failing test and keep it.", tags: ["debugging"], mood: "serious" },

    { id: "tip-156", text: "For graphs, draw nodes/edges. Your brain loves pictures.", tags: ["graphs"], mood: "serious" },
    { id: "tip-157", text: "For DP, try small n and compute by hand to see patterns.", tags: ["dp"], mood: "serious" },
    { id: "tip-158", text: "For strings, watch off-by-one around substr boundaries.", tags: ["debugging"], mood: "serious" },
    { id: "tip-159", text: "For arrays, always consider sorting + scanning.", tags: ["patterns"], mood: "serious" },
    { id: "tip-160", text: "For big inputs, favor O(n) or O(n log n) approaches.", tags: ["complexity"], mood: "serious" },

    // Even more puns
    { id: "tip-161", text: "Don’t let your progress go out of scope.", tags: ["pun"], mood: "pun" },
    { id: "tip-162", text: "Keep calm and carry a pointer.", tags: ["pun", "two-pointers"], mood: "pun" },
    { id: "tip-163", text: "You’re not lost—just exploring the state space.", tags: ["pun", "graphs"], mood: "pun" },
    { id: "tip-164", text: "If you feel stuck, take a break—then come back with fresh cache.", tags: ["pun"], mood: "pun" },
    { id: "tip-165", text: "Be persistent. Even BFS visits everything eventually.", tags: ["pun"], mood: "pun" },

    // Spaced repetition + Smarana-specific
    { id: "tip-166", text: "Review the hardest missed problems first. That’s where growth happens.", tags: ["spaced-repetition"], mood: "serious" },
    { id: "tip-167", text: "If you forgot the trick, don’t panic—rebuild it step-by-step.", tags: ["recall"], mood: "serious" },
    { id: "tip-168", text: "Rate honestly. Overrating makes intervals too long and memory decays.", tags: ["spaced-repetition"], mood: "serious" },
    { id: "tip-169", text: "A great review note is: 'When I see X, I do Y because Z.'", tags: ["notes"], mood: "serious" },
    { id: "tip-170", text: "Your future self will thank you for writing one clean pitfall.", tags: ["notes"], mood: "serious" },

    { id: "tip-171", text: "If you only have 10 minutes, do a Quick 5 instead of nothing.", tags: ["habits"], mood: "serious" },
    { id: "tip-172", text: "Set a daily minimum: 1 review. Keep the chain alive.", tags: ["habits"], mood: "serious" },
    { id: "tip-173", text: "You don’t need more problems—you need more retention.", tags: ["mindset"], mood: "serious" },
    { id: "tip-174", text: "If you can’t recall, re-derive. That’s the real learning.", tags: ["recall"], mood: "serious" },
    { id: "tip-175", text: "Practice describing solutions out loud. Interviews reward clarity.", tags: ["interview"], mood: "serious" },

    { id: "tip-176", text: "When tracking friends, compare consistency, not just streak length.", tags: ["friends"], mood: "serious" },
    { id: "tip-177", text: "Healthy competition: race your yesterday, not someone else’s day 300.", tags: ["friends"], mood: "serious" },
    { id: "tip-178", text: "If you miss a day, restart immediately. Don’t wait for Monday.", tags: ["habits"], mood: "serious" },
    { id: "tip-179", text: "Momentum is fragile. Protect it with tiny daily wins.", tags: ["habits"], mood: "serious" },
    { id: "tip-180", text: "Speed comes from patterns. Patterns come from reviews.", tags: ["patterns"], mood: "serious" },

    // Extra set to get you well into “hundreds”
    { id: "tip-181", text: "Think in constraints: time limit, memory limit, input size.", tags: ["strategy"], mood: "serious" },
    { id: "tip-182", text: "Prefer deterministic approaches over brute randomness.", tags: ["strategy"], mood: "serious" },
    { id: "tip-183", text: "If you used a trick, note *why* it works—not just the trick.", tags: ["notes"], mood: "serious" },
    { id: "tip-184", text: "For bit problems, write a truth table for small cases.", tags: ["bit"], mood: "serious" },
    { id: "tip-185", text: "For “count of subarrays”, prefix sums + hashmap is your friend.", tags: ["prefix-sums"], mood: "serious" },
    { id: "tip-186", text: "For “distinct in window”, use a frequency map and slide.", tags: ["sliding-window"], mood: "serious" },
    { id: "tip-187", text: "For “merge k lists”, heap or divide-and-conquer.", tags: ["heap"], mood: "serious" },
    { id: "tip-188", text: "For “lowest common ancestor”, think parent pointers or recursion.", tags: ["trees"], mood: "serious" },
    { id: "tip-189", text: "For “min cost”, be suspicious of greedy—DP often hides here.", tags: ["dp"], mood: "serious" },
    { id: "tip-190", text: "If you can’t find the pattern, restate the problem in your own words.", tags: ["thinking"], mood: "serious" },

    { id: "tip-191", text: "Don’t fight the input format—parse cleanly, then solve.", tags: ["clean-code"], mood: "serious" },
    { id: "tip-192", text: "Make your review notes searchable: keywords like 'window', 'heap'.", tags: ["notes"], mood: "serious" },
    { id: "tip-193", text: "If the solution feels long, look for a data structure shortcut.", tags: ["strategy"], mood: "serious" },
    { id: "tip-194", text: "Start with the simplest correct approach, then refine.", tags: ["strategy"], mood: "serious" },
    { id: "tip-195", text: "Correctness is a feature. Optimize only after proving it correct.", tags: ["mindset"], mood: "serious" },

    { id: "tip-196", text: "Be like a monotonic stack: remove what’s not useful.", tags: ["pun", "stack"], mood: "pun" },
    { id: "tip-197", text: "Your bugs are just undocumented features. Document, then delete.", tags: ["pun", "debugging"], mood: "pun" },
    { id: "tip-198", text: "If you’re looping endlessly, break. (In code and in life.)", tags: ["pun"], mood: "pun" },
    { id: "tip-199", text: "Don’t let your streak become a null pointer.", tags: ["pun", "streak"], mood: "pun" },
    { id: "tip-200", text: "Keep it simple: the best solutions are often the shortest path.", tags: ["pun"], mood: "pun" },
];

function hashString(s: string) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
}

export function tipForUserTodayWithMix(userId: string) {
    const day = Math.floor(Date.now() / 86_400_000);
    const seed = hashString(`${userId}:${day}`);

    const punChance = 0.18; // 18% puns
    const isPun = (seed % 1000) / 1000 < punChance;

    const pool = DAILY_TIPS.filter(t => (isPun ? t.mood === "pun" : t.mood !== "pun"));
    return pool[seed % pool.length];
}
