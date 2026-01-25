import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEMO_USER_ID = 'demo-user-001'

// LeetCode problems with realistic data
const leetcodeProblems = [
  { slug: 'two-sum', title: 'Two Sum', difficulty: 'Easy' },
  { slug: 'add-two-numbers', title: 'Add Two Numbers', difficulty: 'Medium' },
  { slug: 'longest-substring-without-repeating-characters', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium' },
  { slug: 'median-of-two-sorted-arrays', title: 'Median of Two Sorted Arrays', difficulty: 'Hard' },
  { slug: 'reverse-integer', title: 'Reverse Integer', difficulty: 'Medium' },
  { slug: 'palindrome-number', title: 'Palindrome Number', difficulty: 'Easy' },
  { slug: 'container-with-most-water', title: 'Container With Most Water', difficulty: 'Medium' },
  { slug: 'roman-to-integer', title: 'Roman to Integer', difficulty: 'Easy' },
  { slug: 'longest-common-prefix', title: 'Longest Common Prefix', difficulty: 'Easy' },
  { slug: '3sum', title: '3Sum', difficulty: 'Medium' },
  { slug: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'Easy' },
  { slug: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists', difficulty: 'Easy' },
  { slug: 'remove-duplicates-from-sorted-array', title: 'Remove Duplicates from Sorted Array', difficulty: 'Easy' },
  { slug: 'search-insert-position', title: 'Search Insert Position', difficulty: 'Easy' },
  { slug: 'maximum-subarray', title: 'Maximum Subarray', difficulty: 'Medium' },
  { slug: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'Easy' },
  { slug: 'merge-sorted-array', title: 'Merge Sorted Array', difficulty: 'Easy' },
  { slug: 'binary-tree-inorder-traversal', title: 'Binary Tree Inorder Traversal', difficulty: 'Easy' },
  { slug: 'symmetric-tree', title: 'Symmetric Tree', difficulty: 'Easy' },
  { slug: 'maximum-depth-of-binary-tree', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy' },
  { slug: 'best-time-to-buy-and-sell-stock', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy' },
  { slug: 'valid-palindrome', title: 'Valid Palindrome', difficulty: 'Easy' },
  { slug: 'single-number', title: 'Single Number', difficulty: 'Easy' },
  { slug: 'linked-list-cycle', title: 'Linked List Cycle', difficulty: 'Easy' },
  { slug: 'intersection-of-two-linked-lists', title: 'Intersection of Two Linked Lists', difficulty: 'Easy' },
  { slug: 'majority-element', title: 'Majority Element', difficulty: 'Easy' },
  { slug: 'reverse-linked-list', title: 'Reverse Linked List', difficulty: 'Easy' },
  { slug: 'contains-duplicate', title: 'Contains Duplicate', difficulty: 'Easy' },
  { slug: 'product-of-array-except-self', title: 'Product of Array Except Self', difficulty: 'Medium' },
  { slug: 'move-zeroes', title: 'Move Zeroes', difficulty: 'Easy' },
  { slug: 'coin-change', title: 'Coin Change', difficulty: 'Medium' },
  { slug: 'house-robber', title: 'House Robber', difficulty: 'Medium' },
  { slug: 'number-of-islands', title: 'Number of Islands', difficulty: 'Medium' },
  { slug: 'course-schedule', title: 'Course Schedule', difficulty: 'Medium' },
  { slug: 'implement-trie-prefix-tree', title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium' },
  { slug: 'kth-smallest-element-in-a-bst', title: 'Kth Smallest Element in a BST', difficulty: 'Medium' },
  { slug: 'lowest-common-ancestor-of-a-binary-tree', title: 'Lowest Common Ancestor of a Binary Tree', difficulty: 'Medium' },
  { slug: 'serialize-and-deserialize-binary-tree', title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard' },
  { slug: 'word-search-ii', title: 'Word Search II', difficulty: 'Hard' },
  { slug: 'trapping-rain-water', title: 'Trapping Rain Water', difficulty: 'Hard' },
  { slug: 'merge-intervals', title: 'Merge Intervals', difficulty: 'Medium' },
  { slug: 'group-anagrams', title: 'Group Anagrams', difficulty: 'Medium' },
  { slug: 'top-k-frequent-elements', title: 'Top K Frequent Elements', difficulty: 'Medium' },
  { slug: 'find-median-from-data-stream', title: 'Find Median from Data Stream', difficulty: 'Hard' },
  { slug: 'word-ladder', title: 'Word Ladder', difficulty: 'Hard' },
]

// Sample notes for problems
const sampleNotes: Record<string, string> = {
  'two-sum': '## Approach\nUse a hashmap to store complement values.\n\n## Time Complexity\nO(n) - single pass\n\n## Key Insight\nCheck if complement exists before adding current number.',
  '3sum': '## Approach\nSort array, then use two pointers for each element.\n\n## Time Complexity\nO(n²)\n\n## Key Points\n- Skip duplicates\n- Move pointers based on sum comparison',
  'coin-change': '## Approach\nDynamic Programming - bottom up\n\n## Recurrence\ndp[i] = min(dp[i], dp[i - coin] + 1)\n\n## Base Case\ndp[0] = 0',
  'number-of-islands': '## Approach\nDFS/BFS to mark visited cells\n\n## Key Points\n- Modify grid in-place or use visited set\n- Count connected components',
  'trapping-rain-water': '## Approach\nTwo pointers or prefix max arrays\n\n## Formula\nwater[i] = min(leftMax[i], rightMax[i]) - height[i]',
}

// Sample solutions
const sampleSolutions: Record<string, string> = {
  'two-sum': `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
  'valid-parentheses': `def isValid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
        else:
            stack.append(char)
    return len(stack) == 0`,
  'climbing-stairs': `def climbStairs(n):
    if n <= 2:
        return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b`,
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function daysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(0, 0, 0, 0)
  return date
}

function daysFromNow(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(0, 0, 0, 0)
  return date
}

async function main() {
  console.log('🌱 Seeding demo user data...')

  // Update demo user with more info
  await prisma.user.update({
    where: { id: DEMO_USER_ID },
    data: {
      name: 'Demo User',
      leetcodeUsername: 'leetcode_demo',
      codeforcesUsername: 'cf_demo',
      xp: 4250,
      level: 9,
      profileVisibility: 'PUBLIC',
      showStreakToPublic: true,
      showPlatformsToPublic: true,
    },
  })
  console.log('✅ Updated demo user profile')

  // Create UserStats
  await prisma.userStats.upsert({
    where: { userId: DEMO_USER_ID },
    update: {
      currentStreak: 12,
      longestStreak: 28,
      totalReviews: 156,
      problemsTracked: 45,
      reviewsThisWeek: 18,
      lastReviewedAt: new Date(),
    },
    create: {
      userId: DEMO_USER_ID,
      currentStreak: 12,
      longestStreak: 28,
      totalReviews: 156,
      problemsTracked: 45,
      reviewsThisWeek: 18,
      lastReviewedAt: new Date(),
    },
  })
  console.log('✅ Created user stats')

  // Create Pomodoro Settings
  await prisma.pomodoroSettings.upsert({
    where: { userId: DEMO_USER_ID },
    update: {
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      autoStartBreaks: true,
      autoStartPomodoros: false,
    },
    create: {
      userId: DEMO_USER_ID,
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      autoStartBreaks: true,
      autoStartPomodoros: false,
    },
  })
  console.log('✅ Created pomodoro settings')

  // Delete existing problems for demo user
  await prisma.revisionProblem.deleteMany({
    where: { userId: DEMO_USER_ID },
  })

  // Create RevisionProblems with varied states
  const intervals = [1, 3, 7, 14, 30]
  const problems = []

  for (let i = 0; i < leetcodeProblems.length; i++) {
    const p = leetcodeProblems[i]
    const reviewCount = Math.floor(Math.random() * 5)
    const interval = intervals[Math.min(reviewCount, intervals.length - 1)]

    // Distribute problems: some due today, some overdue, some upcoming, some new
    let nextReviewAt: Date
    let lastReviewedAt: Date | null = null

    if (i < 5) {
      // Due today
      nextReviewAt = new Date()
      nextReviewAt.setHours(0, 0, 0, 0)
      lastReviewedAt = daysAgo(interval)
    } else if (i < 10) {
      // Overdue (past due)
      nextReviewAt = daysAgo(Math.floor(Math.random() * 3) + 1)
      lastReviewedAt = daysAgo(interval + Math.floor(Math.random() * 3) + 1)
    } else if (i < 25) {
      // Upcoming (1-14 days)
      nextReviewAt = daysFromNow(Math.floor(Math.random() * 14) + 1)
      lastReviewedAt = daysAgo(Math.floor(Math.random() * 7))
    } else {
      // New or recently added
      nextReviewAt = daysFromNow(Math.floor(Math.random() * 30))
      lastReviewedAt = null
    }

    const firstSolvedAt = randomDate(daysAgo(90), daysAgo(1))
    const lastSolvedAt = lastReviewedAt || firstSolvedAt

    problems.push({
      userId: DEMO_USER_ID,
      platform: 'leetcode',
      problemSlug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      url: `https://leetcode.com/problems/${p.slug}/`,
      firstSolvedAt,
      lastSolvedAt,
      nextReviewAt,
      interval,
      reviewCount,
      lastReviewedAt,
      notes: sampleNotes[p.slug] || '',
      solution: sampleSolutions[p.slug] || '',
    })
  }

  await prisma.revisionProblem.createMany({
    data: problems,
  })
  console.log(`✅ Created ${problems.length} revision problems`)

  // Get created problems for review events
  const createdProblems = await prisma.revisionProblem.findMany({
    where: { userId: DEMO_USER_ID },
  })

  // Create ReviewEvents for problems that have been reviewed
  const reviewEvents = []
  for (const problem of createdProblems) {
    if (problem.reviewCount > 0) {
      for (let r = 0; r < problem.reviewCount; r++) {
        const reviewDate = daysAgo(Math.floor(Math.random() * 60) + 1)
        reviewEvents.push({
          userId: DEMO_USER_ID,
          problemId: problem.id,
          rating: Math.floor(Math.random() * 3) + 3, // 3-5 rating
          interval: intervals[Math.min(r, intervals.length - 1)],
          xpEarned: 25 + Math.floor(Math.random() * 25),
          reviewedAt: reviewDate,
        })
      }
    }
  }

  if (reviewEvents.length > 0) {
    await prisma.reviewEvent.createMany({
      data: reviewEvents,
    })
    console.log(`✅ Created ${reviewEvents.length} review events`)
  }

  // Create ReviewLogs for the past 30 days (for streak calendar)
  await prisma.reviewLog.deleteMany({
    where: { userId: DEMO_USER_ID },
  })

  const reviewLogs = []
  for (let i = 0; i < 30; i++) {
    // Skip some days randomly to make it realistic
    if (Math.random() > 0.7 && i > 12) continue // Keep recent 12 days for streak

    const date = daysAgo(i)
    date.setHours(12, 0, 0, 0) // Set to noon

    reviewLogs.push({
      userId: DEMO_USER_ID,
      date,
      count: Math.floor(Math.random() * 8) + 1,
      xpEarned: (Math.floor(Math.random() * 8) + 1) * 25,
    })
  }

  await prisma.reviewLog.createMany({
    data: reviewLogs,
  })
  console.log(`✅ Created ${reviewLogs.length} review logs`)

  // Create some notifications
  await prisma.notification.deleteMany({
    where: { userId: DEMO_USER_ID },
  })

  const notifications = [
    {
      userId: DEMO_USER_ID,
      type: 'SYSTEM',
      title: 'Welcome to Smarana! 🎉',
      body: 'Start tracking your LeetCode problems and build a consistent practice habit.',
      createdAt: daysAgo(14),
      readAt: daysAgo(13),
    },
    {
      userId: DEMO_USER_ID,
      type: 'SYSTEM',
      title: 'New Streak Record!',
      body: 'Congratulations! You\'ve reached a 7-day streak. Keep it up!',
      createdAt: daysAgo(5),
      readAt: daysAgo(5),
    },
    {
      userId: DEMO_USER_ID,
      type: 'SYSTEM',
      title: 'Level Up! 🚀',
      body: 'You\'ve reached Level 9. You\'re making great progress!',
      createdAt: daysAgo(2),
      readAt: null,
    },
    {
      userId: DEMO_USER_ID,
      type: 'SYSTEM',
      title: '5 Problems Due Today',
      body: 'You have 5 problems scheduled for review today. Time to practice!',
      createdAt: new Date(),
      readAt: null,
    },
  ]

  await prisma.notification.createMany({
    data: notifications,
  })
  console.log(`✅ Created ${notifications.length} notifications`)

  // Create LeetCode Account
  await prisma.leetCodeAccount.upsert({
    where: { userId: DEMO_USER_ID },
    update: {
      username: 'leetcode_demo',
      authType: 'PUBLIC',
      lastSyncedAt: new Date(),
      syncStatus: 'OK',
    },
    create: {
      userId: DEMO_USER_ID,
      username: 'leetcode_demo',
      authType: 'PUBLIC',
      lastSyncedAt: new Date(),
      syncStatus: 'OK',
    },
  })
  console.log('✅ Created LeetCode account')

  // Create some LeetCode submissions (for activity history)
  await prisma.leetCodeSubmission.deleteMany({
    where: { userId: DEMO_USER_ID },
  })

  const submissions = []
  const langs = ['python3', 'javascript', 'typescript', 'java', 'cpp']

  for (let i = 0; i < 50; i++) {
    const problem = leetcodeProblems[Math.floor(Math.random() * leetcodeProblems.length)]
    const submittedAt = randomDate(daysAgo(60), new Date())

    submissions.push({
      userId: DEMO_USER_ID,
      submissionId: `sub_${Date.now()}_${i}`,
      problemSlug: problem.slug,
      problemTitle: problem.title,
      status: 'ACCEPTED',
      lang: langs[Math.floor(Math.random() * langs.length)],
      runtime: `${Math.floor(Math.random() * 100) + 20}ms`,
      memory: `${(Math.random() * 20 + 10).toFixed(1)}MB`,
      submittedAt,
    })
  }

  await prisma.leetCodeSubmission.createMany({
    data: submissions,
  })
  console.log(`✅ Created ${submissions.length} LeetCode submissions`)

  console.log('\n🎉 Demo user seeding complete!')
  console.log('📧 Email: demo2@smarana.app')
  console.log('🔑 Password: demo123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
