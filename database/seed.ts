import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { skills, questions, questionVersions, questionOptions } from "./schema";

const url = process.env["DIRECT_DATABASE_URL"];
if (!url) throw new Error("DIRECT_DATABASE_URL is required");

const client = postgres(url, { max: 1 });
const db = drizzle(client);

// ── Seed data definitions ──

interface SeedSkill {
  code: string;
  name: string;
  category: string;
}

interface SeedQuestion {
  slug: string;
  skillCode: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  reasoningLevel: "RECOGNIZE" | "APPLY" | "ANALYZE" | "COMBINE";
  prompt: string;
  code?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SKILLS: SeedSkill[] = [
  { code: "js-variables", name: "Variables & Types", category: "JavaScript" },
  { code: "js-functions", name: "Functions & Scope", category: "JavaScript" },
  { code: "js-arrays", name: "Arrays & Objects", category: "JavaScript" },
  { code: "js-closures", name: "Closures", category: "JavaScript" },
  { code: "js-async", name: "Async & Promises", category: "JavaScript" },
  { code: "js-prototypes", name: "Prototypes & Inheritance", category: "JavaScript" },
  { code: "js-operators", name: "Operators & Coercion", category: "JavaScript" },
  { code: "js-collections", name: "Collections & Iteration", category: "JavaScript" },
  { code: "git-basics", name: "Core Commands", category: "Git" },
  { code: "git-branching", name: "Branching", category: "Git" },
  { code: "git-remote", name: "Working with Remotes", category: "Git" },
  { code: "py-syntax", name: "Syntax & Types", category: "Python" },
  { code: "py-collections", name: "Lists & Dicts", category: "Python" },
  { code: "py-functions", name: "Functions & OOP", category: "Python" },
  { code: "sql-select", name: "SELECT & Filtering", category: "SQL" },
  { code: "sql-joins", name: "JOINs", category: "SQL" },
  { code: "sql-aggregates", name: "Aggregations", category: "SQL" },
  { code: "sd-fundamentals", name: "Systems Design Fundamentals", category: "Systems Design" },
  { code: "sd-data", name: "Data & Storage Patterns", category: "Systems Design" },
  { code: "sd-patterns", name: "Architecture Patterns", category: "Systems Design" },
  { code: "java-core", name: "Core Language", category: "Java" },
  { code: "java-collections", name: "Collections & Streams", category: "Java" },
  { code: "java-oop", name: "OOP & Design Patterns", category: "Java" },
  { code: "java-concurrency", name: "Concurrency & Resources", category: "Java" },
  { code: "java-spring", name: "Spring Framework", category: "Java" },
];

const QUESTIONS: SeedQuestion[] = [
  // ── JavaScript: Variables & Types ──
  {
    slug: "js-v1-typeof-null",
    skillCode: "js-variables",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does `typeof null` return in JavaScript?",
    code: "console.log(typeof null);",
    options: ["null", "undefined", "object", "boolean"],
    correctIndex: 2,
    explanation:
      "`typeof null` returns `'object'` — this is a famous JavaScript bug from 1995 that was never fixed to avoid breaking existing code.",
  },
  {
    slug: "js-v2-block-scope",
    skillCode: "js-variables",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "Which keyword creates a block-scoped variable?",
    options: ["var", "let", "const", "function"],
    correctIndex: 1,
    explanation:
      "`let` is block-scoped (limited to `{}`). `var` is function-scoped and can leak out of blocks.",
  },
  {
    slug: "js-v3-float-equality",
    skillCode: "js-variables",
    difficulty: "MEDIUM",
    reasoningLevel: "APPLY",
    prompt: "What is the result of this expression?",
    code: "0.1 + 0.2 === 0.3",
    options: ["true", "false", "NaN", "undefined"],
    correctIndex: 1,
    explanation:
      "Floating-point arithmetic in JavaScript (and most languages) isn't exact. `0.1 + 0.2` equals `0.30000000000000004`, not `0.3`.",
  },
  {
    slug: "js-v4-not-primitive",
    skillCode: "js-variables",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "Which of these is NOT a JavaScript primitive?",
    options: ["string", "number", "Array", "boolean"],
    correctIndex: 2,
    explanation:
      "`Array` is an object (reference type), not a primitive. Primitives include: string, number, boolean, null, undefined, symbol, bigint.",
  },
  {
    slug: "js-v5-strict-equality",
    skillCode: "js-variables",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does `===` check that `==` does not?",
    options: ["Only the value", "Only the type", "Both value and type", "Reference equality"],
    correctIndex: 2,
    explanation:
      "`===` (strict equality) checks both value AND type, so `'5' === 5` is `false`. `==` coerces types first, so `'5' == 5` is `true`.",
  },

  // ── JavaScript: Functions & Scope ──
  {
    slug: "js-f1-closure",
    skillCode: "js-closures",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is a closure?",
    options: [
      "A function with no parameters",
      "A function that remembers variables from its outer scope",
      "An immediately invoked function",
      "A function that returns another function",
    ],
    correctIndex: 1,
    explanation:
      "A closure is a function that retains access to variables from its outer (enclosing) scope even after that outer function has returned.",
  },
  {
    slug: "js-f2-arrow-this",
    skillCode: "js-functions",
    difficulty: "MEDIUM",
    reasoningLevel: "APPLY",
    prompt: "What does `this` refer to inside an arrow function?",
    options: [
      "The arrow function itself",
      "The global object",
      "The enclosing lexical context",
      "undefined",
    ],
    correctIndex: 2,
    explanation:
      "Arrow functions don't have their own `this`. They inherit `this` from the enclosing lexical scope — unlike regular functions, which define their own `this`.",
  },
  {
    slug: "js-f3-hoisting",
    skillCode: "js-functions",
    difficulty: "MEDIUM",
    reasoningLevel: "APPLY",
    prompt: "What does hoisting do?",
    options: [
      "Moves all code to a CDN",
      "Moves variable and function declarations to the top of their scope",
      "Optimizes loops for performance",
      "Removes unused variables",
    ],
    correctIndex: 1,
    explanation:
      "Hoisting moves `var` declarations and `function` declarations to the top of their scope before execution. `let` and `const` are hoisted but not initialized (temporal dead zone).",
  },
  {
    slug: "js-f4-pure-function",
    skillCode: "js-functions",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is a pure function?",
    options: [
      "A function with no return value",
      "A function that only uses global variables",
      "A function that always returns the same output for the same input and has no side effects",
      "A function written in strict mode",
    ],
    correctIndex: 2,
    explanation:
      "A pure function is deterministic (same input → same output) and has no side effects (doesn't modify external state). Pure functions are the foundation of functional programming.",
  },
  {
    slug: "js-f5-var-loop-leak",
    skillCode: "js-functions",
    difficulty: "MEDIUM",
    reasoningLevel: "ANALYZE",
    prompt: "What does this code log?",
    code: "for (var i = 0; i < 3; i++) {}\nconsole.log(i);",
    options: ["0", "2", "3", "ReferenceError"],
    correctIndex: 2,
    explanation:
      "`var` is function-scoped, so `i` leaks out of the `for` block. After the loop, `i` is `3` (the value that failed the `i < 3` condition).",
  },

  // ── JavaScript: Arrays & Objects ──
  {
    slug: "js-a1-push",
    skillCode: "js-arrays",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "Which method adds an element to the END of an array?",
    options: [".push()", ".pop()", ".shift()", ".unshift()"],
    correctIndex: 0,
    explanation:
      "`.push()` appends to the end. `.pop()` removes from the end. `.unshift()` prepends to the beginning. `.shift()` removes from the beginning.",
  },
  {
    slug: "js-a2-map",
    skillCode: "js-arrays",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does `.map()` return?",
    options: [
      "The first matching element",
      "A new array with transformed elements",
      "A boolean",
      "The original array, modified",
    ],
    correctIndex: 1,
    explanation:
      "`.map()` always returns a **new** array of the same length, where each element is the result of the callback. It never mutates the original.",
  },
  {
    slug: "js-a3-destructuring",
    skillCode: "js-arrays",
    difficulty: "EASY",
    reasoningLevel: "APPLY",
    prompt: "What does this destructuring do?",
    code: "const { name, age } = person;",
    options: [
      "Creates a copy of person",
      "Extracts `name` and `age` properties into variables",
      "Merges two objects",
      "Deletes properties from person",
    ],
    correctIndex: 1,
    explanation:
      "Object destructuring extracts properties into local variables. It's equivalent to `const name = person.name; const age = person.age;`",
  },
  {
    slug: "js-a4-object-keys",
    skillCode: "js-arrays",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does `Object.keys(obj)` return?",
    options: [
      "An array of the object's values",
      "An array of the object's property names",
      "The number of properties",
      "A copy of the object",
    ],
    correctIndex: 1,
    explanation:
      "`Object.keys()` returns an array of an object's own enumerable property names (keys). Use `Object.values()` for values or `Object.entries()` for both.",
  },
  {
    slug: "js-a5-spread",
    skillCode: "js-arrays",
    difficulty: "EASY",
    reasoningLevel: "APPLY",
    prompt: "What does the spread operator do here?",
    code: "const b = [...a, 4, 5];",
    options: [
      "Deletes elements from `a`",
      "Creates a shallow copy of `a` and appends 4 and 5",
      "Sorts the array",
      "Flattens nested arrays",
    ],
    correctIndex: 1,
    explanation:
      "The spread operator `...` expands the iterable `a` into individual elements. This creates a new array containing all elements of `a` followed by `4` and `5`.",
  },

  // ── Git: Core Commands ──
  {
    slug: "git-b1-init",
    skillCode: "git-basics",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "Which command initializes a new Git repository?",
    options: ["git start", "git init", "git create", "git new"],
    correctIndex: 1,
    explanation:
      "`git init` creates a new `.git` directory in your current folder, turning it into a Git repository.",
  },
  {
    slug: "git-b2-add",
    skillCode: "git-basics",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does `git add .` do?",
    options: [
      "Commits all changes",
      "Stages all changes in the current directory",
      "Pulls from remote",
      "Creates a new branch",
    ],
    correctIndex: 1,
    explanation:
      "`git add .` stages all modified and new files in the current directory. Staging prepares changes to be included in the next commit.",
  },
  {
    slug: "git-b3-status",
    skillCode: "git-basics",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does `git status` show?",
    options: [
      "The commit history",
      "The remote repository URL",
      "Staged, unstaged, and untracked files",
      "The current user's name",
    ],
    correctIndex: 2,
    explanation:
      "`git status` shows which files are staged (ready to commit), unstaged (modified but not staged), and untracked (new files Git doesn't know about).",
  },
  {
    slug: "git-b4-log",
    skillCode: "git-basics",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does `git log` show?",
    options: [
      "Uncommitted changes",
      "The commit history with hashes, authors, and messages",
      "A list of branches",
      "Remote repositories",
    ],
    correctIndex: 1,
    explanation:
      "`git log` displays the commit history — each commit's SHA hash, author, date, and message. Use `git log --oneline` for a compact view.",
  },
  {
    slug: "git-b5-reset-soft",
    skillCode: "git-basics",
    difficulty: "MEDIUM",
    reasoningLevel: "APPLY",
    prompt:
      "You want to undo your last commit but KEEP the file changes. Which command do you use?",
    options: [
      "git revert HEAD",
      "git reset --soft HEAD~1",
      "git reset --hard HEAD~1",
      "git checkout HEAD~1",
    ],
    correctIndex: 1,
    explanation:
      "`git reset --soft HEAD~1` moves HEAD back one commit but leaves your files and staged changes intact. `--hard` would discard all changes.",
  },

  // ── Git: Branching ──
  {
    slug: "git-br1-checkout-b",
    skillCode: "git-branching",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "How do you create AND switch to a new branch in one command?",
    options: [
      "git branch new-branch",
      "git checkout new-branch",
      "git checkout -b new-branch",
      "git switch new-branch --create",
    ],
    correctIndex: 2,
    explanation:
      "`git checkout -b <name>` creates the branch and immediately switches to it. The modern equivalent is `git switch -c <name>`.",
  },
  {
    slug: "git-br2-merge-conflict",
    skillCode: "git-branching",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is a merge conflict?",
    options: [
      "When two branches have the same name",
      "When a push is rejected by the remote",
      "When Git can't auto-merge because two branches changed the same lines",
      "When a commit message is too long",
    ],
    correctIndex: 2,
    explanation:
      "A merge conflict occurs when two branches modified the same part of a file differently, and Git can't determine which change to keep. You must resolve it manually.",
  },
  {
    slug: "git-br3-stash",
    skillCode: "git-branching",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does `git stash` do?",
    options: [
      "Deletes uncommitted changes permanently",
      "Commits changes with a temporary message",
      "Temporarily saves uncommitted changes so you can switch branches cleanly",
      "Pushes a draft commit to remote",
    ],
    correctIndex: 2,
    explanation:
      "`git stash` saves your working directory changes to a stack and reverts to a clean state. Use `git stash pop` to restore them.",
  },
  {
    slug: "git-br4-merge-vs-rebase",
    skillCode: "git-branching",
    difficulty: "MEDIUM",
    reasoningLevel: "ANALYZE",
    prompt: "What is the difference between `git merge` and `git rebase`?",
    options: [
      "They are identical",
      "Merge creates a new merge commit; rebase rewrites commits onto a new base",
      "Rebase is only for remote branches",
      "Merge can only be done on the main branch",
    ],
    correctIndex: 1,
    explanation:
      "`git merge` preserves history with a merge commit. `git rebase` rewrites your commits to appear as if they started from the tip of the target branch, creating a cleaner linear history.",
  },
  {
    slug: "git-br5-delete-branch",
    skillCode: "git-branching",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "How do you delete a local branch that has been merged?",
    options: [
      "git branch --delete",
      "git branch -d branch-name",
      "git remove branch branch-name",
      "git branch -D branch-name",
    ],
    correctIndex: 1,
    explanation:
      "`git branch -d <name>` safely deletes a merged branch. `-D` (uppercase) force-deletes even if unmerged — use with caution!",
  },

  // ── Git: Working with Remotes ──
  {
    slug: "git-r1-origin",
    skillCode: "git-remote",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does `origin` refer to?",
    options: [
      "The first commit in the repository",
      "The main/master branch",
      "The default name for the remote repository URL",
      "The repository owner",
    ],
    correctIndex: 2,
    explanation:
      "`origin` is just the conventional name given to the remote repository when you `git clone` or `git remote add origin <url>`. You can name remotes anything.",
  },
  {
    slug: "git-r2-fetch-vs-pull",
    skillCode: "git-remote",
    difficulty: "MEDIUM",
    reasoningLevel: "ANALYZE",
    prompt: "What is the difference between `git fetch` and `git pull`?",
    options: [
      "They are the same command",
      "`git fetch` downloads changes but doesn't merge; `git pull` downloads AND merges",
      "`git fetch` only works on branches named `main`",
      "`git pull` only downloads commit metadata",
    ],
    correctIndex: 1,
    explanation:
      "`git fetch` safely downloads remote changes into your local repo without touching your working files. `git pull` = `git fetch` + `git merge`. Fetching first gives you more control.",
  },
  {
    slug: "git-r3-push-u",
    skillCode: "git-remote",
    difficulty: "EASY",
    reasoningLevel: "APPLY",
    prompt: "What does `git push -u origin main` do?",
    options: [
      "Deletes the main branch on origin",
      "Pushes and sets origin/main as the upstream tracking branch",
      "Forces a push, overwriting remote history",
      "Pulls from origin/main",
    ],
    correctIndex: 1,
    explanation:
      "The `-u` flag sets the upstream tracking relationship so future `git push` and `git pull` commands know which remote branch to use without specifying it.",
  },
  {
    slug: "git-r4-pull-request",
    skillCode: "git-remote",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is a Pull Request (PR)?",
    options: [
      "A command to download code from remote",
      "A Git command for merging branches locally",
      "A platform feature to propose merging a branch, enabling code review",
      "A request to pull updates from a teammate",
    ],
    correctIndex: 2,
    explanation:
      "A Pull Request is a GitHub/GitLab/Bitbucket feature (not a Git command) that lets you propose changes, request code review, and discuss before merging a branch.",
  },
  {
    slug: "git-r5-safe-undo",
    skillCode: "git-remote",
    difficulty: "MEDIUM",
    reasoningLevel: "APPLY",
    prompt: "You pushed a commit with a bug. What's the SAFE way to undo it on a shared branch?",
    options: [
      "git reset --hard and force push",
      "Delete the remote branch and recreate it",
      "git revert <commit-hash> and push the revert commit",
      "git checkout to a previous commit",
    ],
    correctIndex: 2,
    explanation:
      "`git revert` creates a NEW commit that undoes the changes — it preserves history. Force-pushing rewrites shared history and is dangerous on branches others depend on.",
  },

  // ── Python: Syntax & Types ──
  {
    slug: "py-s1-none",
    skillCode: "py-syntax",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is Python's equivalent of `null`?",
    options: ["null", "nil", "None", "undefined"],
    correctIndex: 2,
    explanation:
      "`None` is Python's null value. It's a singleton object of type `NoneType`. You check for it with `is None`, not `== None`.",
  },
  {
    slug: "py-s2-type-list",
    skillCode: "py-syntax",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is the output of this code?",
    code: "print(type([]))",
    options: ["<class 'array'>", "<class 'list'>", "<class 'tuple'>", "list"],
    correctIndex: 1,
    explanation:
      "In Python, `[]` creates a `list`. `type([])` returns `<class 'list'>`. Python's `list` is a dynamic array — the most common sequence type.",
  },
  {
    slug: "py-s3-comments",
    skillCode: "py-syntax",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "How do you write a single-line comment in Python?",
    options: ["// comment", "/* comment */", "# comment", "-- comment"],
    correctIndex: 2,
    explanation:
      "Python uses `#` for single-line comments. There are no built-in multi-line comment syntax — use triple-quoted strings `'''...'''` as a workaround.",
  },
  {
    slug: "py-s4-indentation",
    skillCode: "py-syntax",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What makes Python indentation special?",
    options: [
      "It's optional — Python ignores whitespace",
      "It defines code blocks (required, not decorative)",
      "Only tabs are allowed, not spaces",
      "It only matters inside functions",
    ],
    correctIndex: 1,
    explanation:
      "Python uses indentation to define code blocks — it's syntactically required. Mixing tabs and spaces, or inconsistent indentation, causes `IndentationError`.",
  },
  {
    slug: "py-s5-fstring",
    skillCode: "py-syntax",
    difficulty: "EASY",
    reasoningLevel: "APPLY",
    prompt: "What is a Python f-string?",
    code: 'name = "world"\nprint(f"Hello, {name}!")',
    options: [
      "A file string for reading files",
      "A formatted string literal that embeds expressions",
      "A string with special escape characters",
      "A frozen (immutable) string",
    ],
    correctIndex: 1,
    explanation:
      "f-strings (formatted string literals) embed Python expressions inside `{}` within a string prefixed with `f`. They're the fastest and most readable way to format strings.",
  },

  // ── Python: Lists & Dicts ──
  {
    slug: "py-c1-list-vs-tuple",
    skillCode: "py-collections",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is the difference between a list and a tuple in Python?",
    options: [
      "Lists hold strings, tuples hold numbers",
      "Lists are mutable (changeable); tuples are immutable",
      "Tuples are faster for large datasets, lists for small",
      "Lists use [], tuples use {} — they work identically",
    ],
    correctIndex: 1,
    explanation:
      "Lists `[]` are mutable — you can add, remove, or change elements. Tuples `()` are immutable — once created, they can't be modified. Use tuples for data that shouldn't change.",
  },
  {
    slug: "py-c2-list-comp",
    skillCode: "py-collections",
    difficulty: "MEDIUM",
    reasoningLevel: "APPLY",
    prompt: "What does this list comprehension produce?",
    code: "[x**2 for x in range(4)]",
    options: ["[0, 1, 2, 3]", "[1, 4, 9, 16]", "[0, 1, 4, 9]", "[4, 9, 16, 25]"],
    correctIndex: 2,
    explanation:
      "`range(4)` yields 0, 1, 2, 3. Squaring each: 0²=0, 1²=1, 2²=4, 3²=9. Result: `[0, 1, 4, 9]`.",
  },
  {
    slug: "py-c3-dict-get",
    skillCode: "py-collections",
    difficulty: "EASY",
    reasoningLevel: "APPLY",
    prompt: "How do you safely get a value from a dict that might not exist?",
    options: [
      "d[key] — it returns None if missing",
      "d.get(key) — returns None if missing instead of raising KeyError",
      "d.find(key) — returns -1 if missing",
      "d[key] with a try/except",
    ],
    correctIndex: 1,
    explanation:
      "`dict.get(key)` returns `None` (or a default you specify: `dict.get(key, default)`) if the key doesn't exist. `d[key]` raises `KeyError` if the key is missing.",
  },
  {
    slug: "py-c4-set",
    skillCode: "py-collections",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does `set()` give you that `list` doesn't?",
    options: [
      "Ordered elements",
      "Integer indices",
      "Automatic deduplication — no duplicate values",
      "Fixed size",
    ],
    correctIndex: 2,
    explanation:
      "A `set` is an unordered collection of unique elements — duplicates are automatically removed. Great for membership tests (`in` is O(1) vs O(n) for lists) and deduplication.",
  },
  {
    slug: "py-c5-enumerate",
    skillCode: "py-collections",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "Which built-in function iterates over a list with its index?",
    options: ["zip()", "map()", "enumerate()", "index()"],
    correctIndex: 2,
    explanation:
      "`enumerate(iterable)` yields `(index, value)` pairs. Use it instead of `for i in range(len(list))` — it's more Pythonic and works on any iterable.",
  },

  // ── Python: Functions & OOP ──
  {
    slug: "py-fn1-args",
    skillCode: "py-functions",
    difficulty: "MEDIUM",
    reasoningLevel: "APPLY",
    prompt: "What does `*args` allow in a function definition?",
    options: [
      "Only keyword arguments",
      "A variable number of positional arguments as a tuple",
      "A dictionary of named arguments",
      "Arguments with default values",
    ],
    correctIndex: 1,
    explanation:
      "`*args` collects any number of positional arguments into a tuple. `**kwargs` does the same for keyword arguments into a dict.",
  },
  {
    slug: "py-fn2-decorator",
    skillCode: "py-functions",
    difficulty: "MEDIUM",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is a decorator in Python?",
    options: [
      "A way to add colors to terminal output",
      "A design pattern for building UIs",
      "A function that wraps another function to add behavior",
      "A class method that returns self",
    ],
    correctIndex: 2,
    explanation:
      "A decorator is a function that takes a function and returns a modified version of it, using the `@decorator` syntax. Common uses: logging, authentication, caching, timing.",
  },
  {
    slug: "py-fn3-init",
    skillCode: "py-functions",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does `__init__` do in a Python class?",
    options: [
      "Imports the class from a module",
      "Destroys an object when it's no longer used",
      "Initializes a new instance with attributes",
      "Makes the class iterable",
    ],
    correctIndex: 2,
    explanation:
      "`__init__` is the constructor — it runs when you create a new instance with `MyClass()`. It sets up the object's initial state by defining `self.attribute = value`.",
  },
  {
    slug: "py-fn4-default-args",
    skillCode: "py-functions",
    difficulty: "EASY",
    reasoningLevel: "APPLY",
    prompt: "What is the output?",
    code: 'def greet(name, greeting="Hello"):\n    return f"{greeting}, {name}!"\n\nprint(greet("Alice"))',
    options: ["Hello, Alice!", "Alice, Hello!", "TypeError: missing argument", "greeting, name!"],
    correctIndex: 0,
    explanation:
      "`greeting` has a default value of `'Hello'`, so calling `greet('Alice')` without it uses the default. Output: `Hello, Alice!`",
  },
  {
    slug: "py-fn5-lambda",
    skillCode: "py-functions",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is a lambda function?",
    options: [
      "A function defined inside a class",
      "A function that runs in parallel",
      "An anonymous, single-expression function",
      "A recursive function",
    ],
    correctIndex: 2,
    explanation:
      "`lambda args: expression` creates a small anonymous function. Example: `square = lambda x: x**2`. Use for simple, throwaway functions — prefer `def` for anything complex.",
  },

  // ── SQL: SELECT & Filtering ──
  {
    slug: "sql-s1-where",
    skillCode: "sql-select",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "Which clause filters rows in a SELECT query?",
    options: ["FILTER", "WHERE", "HAVING", "LIMIT"],
    correctIndex: 1,
    explanation:
      "`WHERE` filters individual rows before any grouping. `HAVING` filters after grouping (used with `GROUP BY`). Remember: WHERE → GROUP BY → HAVING → ORDER BY.",
  },
  {
    slug: "sql-s2-distinct",
    skillCode: "sql-select",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does `SELECT DISTINCT` do?",
    options: [
      "Sorts results alphabetically",
      "Returns only unique rows, removing duplicates",
      "Returns only the first row",
      "Returns rows with non-null values",
    ],
    correctIndex: 1,
    explanation:
      "`SELECT DISTINCT` eliminates duplicate rows from the result set. It evaluates uniqueness across all selected columns.",
  },
  {
    slug: "sql-s3-between",
    skillCode: "sql-select",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "Which operator checks for a range of values?",
    code: "SELECT * FROM products WHERE price ??? 10 AND 50;",
    options: ["IN", "BETWEEN", "LIKE", "EXISTS"],
    correctIndex: 1,
    explanation:
      "`BETWEEN x AND y` is inclusive — it matches values from x to y. It's equivalent to `>= x AND <= y`. Works on numbers, dates, and strings.",
  },
  {
    slug: "sql-s4-like-wildcard",
    skillCode: "sql-select",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does `%` mean in a LIKE pattern?",
    options: [
      "Exactly one character",
      "A percentage calculation",
      "Zero or more characters (wildcard)",
      "A literal percent sign",
    ],
    correctIndex: 2,
    explanation:
      "In SQL, `%` is a wildcard matching zero or more characters. `_` matches exactly one character. `LIKE 'A%'` matches anything starting with 'A'.",
  },
  {
    slug: "sql-s5-order-desc",
    skillCode: "sql-select",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does `ORDER BY name DESC` do?",
    options: [
      "Sorts by name from A to Z",
      "Sorts by name from Z to A",
      "Groups rows by name",
      "Removes rows without a name",
    ],
    correctIndex: 1,
    explanation:
      "`DESC` sorts in descending order (Z→A for text, high→low for numbers). `ASC` (the default) sorts in ascending order.",
  },

  // ── SQL: JOINs ──
  {
    slug: "sql-j1-inner-join",
    skillCode: "sql-joins",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does an INNER JOIN return?",
    options: [
      "All rows from the left table",
      "All rows from both tables",
      "Only rows where the join condition matches in BOTH tables",
      "Rows that exist in one table but not the other",
    ],
    correctIndex: 2,
    explanation:
      "`INNER JOIN` returns only the rows where the join condition is satisfied in both tables. Rows with no match in either table are excluded.",
  },
  {
    slug: "sql-j2-left-join",
    skillCode: "sql-joins",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does a LEFT JOIN guarantee?",
    options: [
      "All rows from the right table appear",
      "All rows from the left table appear, with NULLs for non-matching right rows",
      "Only matching rows appear",
      "The result is sorted left to right",
    ],
    correctIndex: 1,
    explanation:
      "`LEFT JOIN` keeps ALL rows from the left table. For right-table columns with no match, it fills with NULL.",
  },
  {
    slug: "sql-j3-self-join",
    skillCode: "sql-joins",
    difficulty: "MEDIUM",
    reasoningLevel: "APPLY",
    prompt: "When would you use a self-join?",
    options: [
      "To join a table to itself to compare rows within the same table",
      "To improve query performance",
      "To join more than two tables",
      "To join tables with different column types",
    ],
    correctIndex: 0,
    explanation:
      "A self-join joins a table to itself using aliases. Classic example: finding an employee's manager when both are rows in the same `employees` table.",
  },
  {
    slug: "sql-j4-on-clause",
    skillCode: "sql-joins",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is the ON clause in a JOIN?",
    options: [
      "Specifies which columns to SELECT",
      "Specifies the join condition — how the two tables relate",
      "Specifies the sort order",
      "Limits the number of results",
    ],
    correctIndex: 1,
    explanation:
      "`ON table1.column = table2.column` defines the relationship between the tables. Most commonly, this links a foreign key to a primary key.",
  },
  {
    slug: "sql-j5-cross-join",
    skillCode: "sql-joins",
    difficulty: "MEDIUM",
    reasoningLevel: "ANALYZE",
    prompt: "What's the risk of a CROSS JOIN?",
    options: [
      "It only works on indexed columns",
      "It produces a Cartesian product — every row × every row — which can be enormous",
      "It requires both tables to have the same number of columns",
      "It deletes duplicate rows",
    ],
    correctIndex: 1,
    explanation:
      "A `CROSS JOIN` returns every combination of rows from both tables (Cartesian product). 1,000 rows × 1,000 rows = 1,000,000 result rows.",
  },

  // ── SQL: Aggregations ──
  {
    slug: "sql-ag1-group-by",
    skillCode: "sql-aggregates",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does GROUP BY do?",
    options: [
      "Sorts the result set",
      "Groups rows with the same value in a column so aggregate functions apply per group",
      "Filters rows by group membership",
      "Joins tables by a common column",
    ],
    correctIndex: 1,
    explanation:
      "`GROUP BY column` collapses rows with identical values into a single row, letting you apply aggregates (COUNT, SUM, AVG, etc.) per group.",
  },
  {
    slug: "sql-ag2-count-star",
    skillCode: "sql-aggregates",
    difficulty: "MEDIUM",
    reasoningLevel: "ANALYZE",
    prompt: "What is the difference between COUNT(*) and COUNT(column)?",
    options: [
      "They are identical",
      "COUNT(*) counts all rows including NULLs; COUNT(column) ignores NULL values",
      "COUNT(*) is faster for large tables",
      "COUNT(column) counts distinct values only",
    ],
    correctIndex: 1,
    explanation:
      "`COUNT(*)` counts ALL rows in the group. `COUNT(column)` counts only rows where that column is NOT NULL.",
  },
  {
    slug: "sql-ag3-where-vs-having",
    skillCode: "sql-aggregates",
    difficulty: "MEDIUM",
    reasoningLevel: "ANALYZE",
    prompt: "Why can't you use WHERE to filter on an aggregate like SUM()?",
    options: [
      "You can — WHERE works with any expression",
      "WHERE runs before GROUP BY, so aggregate results don't exist yet",
      "SUM() is only valid in SELECT",
      "WHERE only works with text columns",
    ],
    correctIndex: 1,
    explanation:
      "Execution order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. `WHERE` filters rows BEFORE aggregation. Use `HAVING` to filter AFTER.",
  },
  {
    slug: "sql-ag4-having",
    skillCode: "sql-aggregates",
    difficulty: "MEDIUM",
    reasoningLevel: "APPLY",
    prompt: "What does this query return?",
    code: "SELECT department, AVG(salary)\nFROM employees\nGROUP BY department\nHAVING AVG(salary) > 70000;",
    options: [
      "All employees earning more than 70000",
      "Departments where the average salary exceeds 70000",
      "The single highest-paid department",
      "All employees grouped by department",
    ],
    correctIndex: 1,
    explanation:
      "This returns each department and its average salary, but only for departments where that average is above 70,000. `HAVING` filters the grouped results.",
  },
  {
    slug: "sql-ag5-window-fn",
    skillCode: "sql-aggregates",
    difficulty: "HARD",
    reasoningLevel: "ANALYZE",
    prompt: "What does a window function like ROW_NUMBER() OVER (PARTITION BY ...) do?",
    options: [
      "Filters rows by window size",
      "Assigns a row number within each partition without collapsing rows",
      "Deletes rows outside the window",
      "Sorts rows and removes duplicates",
    ],
    correctIndex: 1,
    explanation:
      "Window functions compute values across a set of rows related to the current row without collapsing them into a single group.",
  },

  // ── Systems Design ──
  {
    slug: "sd-1-load-balancer",
    skillCode: "sd-fundamentals",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is the primary purpose of a load balancer?",
    options: [
      "To store data across multiple servers",
      "To distribute incoming traffic across multiple servers",
      "To encrypt network traffic",
      "To compress HTTP responses",
    ],
    correctIndex: 1,
    explanation:
      "A load balancer distributes incoming network traffic across multiple servers to ensure no single server bears too much load, improving availability and responsiveness.",
  },
  {
    slug: "sd-2-cap-theorem",
    skillCode: "sd-fundamentals",
    difficulty: "MEDIUM",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does CAP theorem state about distributed systems?",
    options: [
      "You can have Caching, Availability, and Performance simultaneously",
      "You can only pick two of: Consistency, Availability, Partition tolerance",
      "Complexity Always Propagates through a system",
      "Centralized And Partitioned systems are equivalent",
    ],
    correctIndex: 1,
    explanation:
      "CAP theorem states that a distributed system can only guarantee two of three properties: Consistency, Availability, and Partition tolerance.",
  },
  {
    slug: "sd-3-horizontal-scaling",
    skillCode: "sd-fundamentals",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is the main advantage of horizontal scaling over vertical scaling?",
    options: [
      "It's always cheaper",
      "It requires less code changes",
      "It has virtually no upper limit — you can keep adding machines",
      "It provides better single-request performance",
    ],
    correctIndex: 2,
    explanation:
      "Horizontal scaling (adding more machines) has no hard ceiling — you can keep adding servers. Vertical scaling (upgrading a single machine) hits hardware limits.",
  },
  {
    slug: "sd-4-cdn",
    skillCode: "sd-fundamentals",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is a CDN (Content Delivery Network) primarily used for?",
    options: [
      "Running server-side code closer to users",
      "Serving static content from geographically distributed edge servers",
      "Encrypting data at rest in the database",
      "Balancing load between application servers",
    ],
    correctIndex: 1,
    explanation:
      "A CDN caches and serves static assets from edge servers close to users, reducing latency and offloading traffic from origin servers.",
  },
  {
    slug: "sd-5-sharding",
    skillCode: "sd-data",
    difficulty: "MEDIUM",
    reasoningLevel: "APPLY",
    prompt: "What is database sharding?",
    options: [
      "Creating read replicas of a database",
      "Splitting data across multiple database instances based on a shard key",
      "Backing up the database to multiple locations",
      "Compressing database tables to save storage",
    ],
    correctIndex: 1,
    explanation:
      "Sharding partitions data across multiple database instances using a shard key. Each shard holds a subset of the data, enabling horizontal scaling.",
  },
  {
    slug: "sd-6-write-through",
    skillCode: "sd-data",
    difficulty: "MEDIUM",
    reasoningLevel: "RECOGNIZE",
    prompt: "What caching strategy writes data to the cache AND the database at the same time?",
    options: [
      "Cache-aside (lazy loading)",
      "Write-through",
      "Write-behind (write-back)",
      "Read-through",
    ],
    correctIndex: 1,
    explanation:
      "Write-through updates both the cache and the database synchronously on every write. This ensures consistency but adds write latency.",
  },
  {
    slug: "sd-7-message-queue",
    skillCode: "sd-patterns",
    difficulty: "MEDIUM",
    reasoningLevel: "RECOGNIZE",
    prompt: "What problem does a message queue (like Kafka or RabbitMQ) solve?",
    options: [
      "It replaces the need for a database",
      "It decouples producers from consumers and handles traffic spikes via buffering",
      "It encrypts messages between services",
      "It provides a faster alternative to HTTP",
    ],
    correctIndex: 1,
    explanation:
      "Message queues decouple services so producers don't need to wait for consumers. They buffer messages during traffic spikes and improve fault tolerance.",
  },
  {
    slug: "sd-8-sql-vs-nosql",
    skillCode: "sd-data",
    difficulty: "MEDIUM",
    reasoningLevel: "ANALYZE",
    prompt: "What is the difference between SQL and NoSQL databases?",
    options: [
      "SQL is faster; NoSQL is slower but cheaper",
      "SQL enforces a fixed schema with ACID transactions; NoSQL offers flexible schemas with horizontal scalability",
      "NoSQL doesn't support queries",
      "SQL only works with small datasets",
    ],
    correctIndex: 1,
    explanation:
      "SQL databases enforce structured schemas and provide ACID guarantees. NoSQL databases offer flexible schemas and are designed for horizontal scaling.",
  },
  {
    slug: "sd-9-rate-limiter",
    skillCode: "sd-patterns",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is an API rate limiter used for?",
    options: [
      "To speed up API responses",
      "To compress API payloads",
      "To restrict the number of requests a client can make in a time window",
      "To route API requests to the correct server",
    ],
    correctIndex: 2,
    explanation:
      "Rate limiting protects services from abuse and overload by capping how many requests a client can make per time window.",
  },
  {
    slug: "sd-10-eventual-consistency",
    skillCode: "sd-fundamentals",
    difficulty: "MEDIUM",
    reasoningLevel: "ANALYZE",
    prompt: "What is eventual consistency?",
    options: [
      "Data is always consistent across all nodes at all times",
      "Data will become consistent across all nodes given enough time, but may be stale temporarily",
      "Data is never guaranteed to be consistent",
      "Consistency is only checked when the system shuts down",
    ],
    correctIndex: 1,
    explanation:
      "Eventual consistency means that if no new updates are made, all replicas will eventually converge to the same value.",
  },
  {
    slug: "sd-11-reverse-proxy",
    skillCode: "sd-fundamentals",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is the purpose of a reverse proxy?",
    options: [
      "To hide the client's identity from the server",
      "To sit in front of servers, handling requests on their behalf (SSL termination, caching, load balancing)",
      "To proxy requests from the server to external APIs",
      "To reverse the order of HTTP headers",
    ],
    correctIndex: 1,
    explanation:
      "A reverse proxy sits in front of backend servers, handling concerns like SSL termination, caching, compression, and load balancing.",
  },
  {
    slug: "sd-12-microservices",
    skillCode: "sd-patterns",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is a microservices architecture?",
    options: [
      "Running all code in a single process for simplicity",
      "Breaking an application into small, independently deployable services that communicate over a network",
      "Using very small servers with limited CPU and memory",
      "Writing functions that are each less than 100 lines of code",
    ],
    correctIndex: 1,
    explanation:
      "Microservices decompose an application into small, focused services that can be developed, deployed, and scaled independently.",
  },
  {
    slug: "sd-13-url-shortener",
    skillCode: "sd-patterns",
    difficulty: "HARD",
    reasoningLevel: "ANALYZE",
    prompt: "You need to design a URL shortener. Which is the most critical component?",
    options: [
      "A machine learning model to predict popular URLs",
      "A key-value store mapping short codes to original URLs with high read throughput",
      "A relational database with complex JOIN queries",
      "A WebSocket server for real-time updates",
    ],
    correctIndex: 1,
    explanation:
      "A URL shortener is read-heavy. A key-value store provides O(1) lookups and high throughput, making it ideal for mapping short codes to URLs.",
  },
  {
    slug: "sd-14-circuit-breaker",
    skillCode: "sd-patterns",
    difficulty: "MEDIUM",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is the circuit breaker pattern?",
    options: [
      "A physical device that protects servers from power surges",
      "A pattern that stops calling a failing service and returns a fallback, preventing cascade failures",
      "A way to split database transactions across services",
      "A method for encrypting inter-service communication",
    ],
    correctIndex: 1,
    explanation:
      "The circuit breaker pattern monitors calls to a service. When failures exceed a threshold, it 'opens' the circuit — returning an error or fallback instead of waiting for timeouts.",
  },
  {
    slug: "sd-15-replication",
    skillCode: "sd-data",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is database replication primarily used for?",
    options: [
      "Increasing write throughput by splitting writes across replicas",
      "Improving read performance and providing fault tolerance with copies of the data",
      "Compressing data to reduce storage costs",
      "Encrypting data across multiple locations",
    ],
    correctIndex: 1,
    explanation:
      "Database replication creates copies of data on multiple servers. Read replicas handle read traffic, reducing load on the primary.",
  },

  // ── Java ──
  {
    slug: "java-1-equals-vs-eq",
    skillCode: "java-core",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is the difference between `==` and `.equals()` in Java?",
    options: [
      "They are identical for all types",
      "`==` compares references (memory addresses); `.equals()` compares values",
      "`==` is for primitives only; `.equals()` is for Strings only",
      "`.equals()` is faster than `==`",
    ],
    correctIndex: 1,
    explanation:
      "`==` checks if two references point to the same object in memory. `.equals()` checks if two objects have the same value.",
  },
  {
    slug: "java-2-final",
    skillCode: "java-core",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does the `final` keyword do when applied to a variable?",
    options: [
      "Makes it accessible from any class",
      "Makes it a static variable",
      "Prevents it from being reassigned after initialization",
      "Makes it thread-safe automatically",
    ],
    correctIndex: 2,
    explanation: "`final` prevents reassignment — the variable can only be assigned once.",
  },
  {
    slug: "java-3-abstract-vs-interface",
    skillCode: "java-oop",
    difficulty: "MEDIUM",
    reasoningLevel: "ANALYZE",
    prompt: "What is the difference between an abstract class and an interface in Java?",
    options: [
      "There is no difference since Java 8",
      "Abstract classes can have state (fields) and constructors; interfaces cannot have instance state",
      "Interfaces can extend multiple classes; abstract classes cannot",
      "Abstract classes are faster at runtime",
    ],
    correctIndex: 1,
    explanation:
      "Abstract classes can have instance fields, constructors, and both abstract and concrete methods. Interfaces define contracts with no instance state.",
  },
  {
    slug: "java-4-hashmap",
    skillCode: "java-collections",
    difficulty: "MEDIUM",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does `HashMap` use to store and retrieve entries efficiently?",
    options: [
      "A sorted binary tree",
      "A linked list scanned sequentially",
      "Hash codes to map keys to bucket indices for O(1) average access",
      "A fixed-size array indexed by insertion order",
    ],
    correctIndex: 2,
    explanation:
      "`HashMap` computes `hashCode()` on the key, maps it to a bucket index, and stores the entry there. Retrieval is O(1) on average.",
  },
  {
    slug: "java-5-gc",
    skillCode: "java-core",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is the purpose of Java's garbage collector?",
    options: [
      "To delete unused source code files",
      "To automatically free memory occupied by objects that are no longer reachable",
      "To optimize SQL queries",
      "To remove unused imports at compile time",
    ],
    correctIndex: 1,
    explanation:
      "Java's garbage collector automatically identifies and frees memory from objects that have no live references.",
  },
  {
    slug: "java-6-string-pool",
    skillCode: "java-core",
    difficulty: "MEDIUM",
    reasoningLevel: "APPLY",
    prompt: "What does this code print?",
    code: 'String a = "hello";\nString b = "hello";\nSystem.out.println(a == b);',
    options: ["true", "false", "Compilation error", "NullPointerException"],
    correctIndex: 0,
    explanation:
      'Java interns string literals — `"hello"` is stored once in the String pool. Both `a` and `b` point to the same pooled object, so `==` returns `true`.',
  },
  {
    slug: "java-7-arraylist-vs-linkedlist",
    skillCode: "java-collections",
    difficulty: "MEDIUM",
    reasoningLevel: "ANALYZE",
    prompt: "What is the difference between `ArrayList` and `LinkedList`?",
    options: [
      "ArrayList uses a linked list internally; LinkedList uses an array",
      "ArrayList provides O(1) random access; LinkedList provides O(1) insertions/deletions at the ends",
      "They are identical in performance",
      "LinkedList is thread-safe; ArrayList is not",
    ],
    correctIndex: 1,
    explanation:
      "`ArrayList` is backed by a resizable array — fast random access. `LinkedList` is a doubly-linked list — O(1) add/remove at head/tail but O(n) random access.",
  },
  {
    slug: "java-8-static",
    skillCode: "java-core",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does the `static` keyword mean on a method?",
    options: [
      "The method can't be overridden",
      "The method belongs to the class, not to instances — called without creating an object",
      "The method runs in a separate thread",
      "The method is called only once during the program's lifetime",
    ],
    correctIndex: 1,
    explanation:
      "A `static` method belongs to the class itself. You call it via `ClassName.method()` without instantiating the class.",
  },
  {
    slug: "java-9-array-oob",
    skillCode: "java-core",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What exception is thrown when you try to access index 5 of a 3-element array?",
    options: [
      "NullPointerException",
      "ArrayIndexOutOfBoundsException",
      "ClassCastException",
      "StackOverflowError",
    ],
    correctIndex: 1,
    explanation:
      "`ArrayIndexOutOfBoundsException` is thrown when you access an array with an index outside its bounds.",
  },
  {
    slug: "java-10-try-resources",
    skillCode: "java-concurrency",
    difficulty: "MEDIUM",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is the purpose of the `try-with-resources` statement introduced in Java 7?",
    options: [
      "To retry failed operations automatically",
      "To automatically close resources (files, connections) when the block exits",
      "To catch multiple exception types at once",
      "To allocate more memory for resource-intensive operations",
    ],
    correctIndex: 1,
    explanation:
      "`try-with-resources` ensures that resources implementing `AutoCloseable` are closed automatically when the try block finishes.",
  },
  {
    slug: "java-11-overloading",
    skillCode: "java-oop",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is method overloading in Java?",
    options: [
      "Defining the same method in a parent and child class",
      "Defining multiple methods with the same name but different parameter types or counts",
      "Making a method run faster by the compiler",
      "Calling a method more times than it can handle",
    ],
    correctIndex: 1,
    explanation:
      "Overloading means multiple methods share a name but differ in parameter types, count, or order. The compiler picks the right version at compile time.",
  },
  {
    slug: "java-12-stream-filter",
    skillCode: "java-collections",
    difficulty: "MEDIUM",
    reasoningLevel: "APPLY",
    prompt: "What does Java's `Stream.filter()` do?",
    code: "List<Integer> result = numbers.stream()\n    .filter(n -> n > 5)\n    .collect(Collectors.toList());",
    options: [
      "Sorts elements by the given condition",
      "Returns a new stream containing only elements that match the predicate",
      "Removes elements from the original list",
      "Groups elements by the condition",
    ],
    correctIndex: 1,
    explanation:
      "`filter()` returns a new stream with only the elements for which the predicate returns `true`. It's a lazy intermediate operation.",
  },
  {
    slug: "java-13-optional",
    skillCode: "java-collections",
    difficulty: "MEDIUM",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is the purpose of `Optional<T>` in Java?",
    options: [
      "To make any variable nullable",
      "To represent a value that may or may not be present, avoiding NullPointerException",
      "To store multiple values of type T",
      "To make methods run optionally",
    ],
    correctIndex: 1,
    explanation:
      "`Optional<T>` is a container that explicitly represents the presence or absence of a value.",
  },
  {
    slug: "java-14-synchronized",
    skillCode: "java-concurrency",
    difficulty: "MEDIUM",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does the `synchronized` keyword do?",
    options: [
      "Makes the method run faster in multi-threaded code",
      "Ensures only one thread can execute the block/method at a time, preventing race conditions",
      "Synchronizes the system clock",
      "Makes the method execute in a specific order",
    ],
    correctIndex: 1,
    explanation:
      "`synchronized` acquires a lock so that only one thread at a time can execute the synchronized block or method.",
  },
  {
    slug: "java-15-singleton",
    skillCode: "java-oop",
    difficulty: "HARD",
    reasoningLevel: "ANALYZE",
    prompt: "What design pattern does this code demonstrate?",
    code: "public class DatabaseConnection {\n    private static DatabaseConnection instance;\n    private DatabaseConnection() {}\n    public static DatabaseConnection getInstance() {\n        if (instance == null) instance = new DatabaseConnection();\n        return instance;\n    }\n}",
    options: ["Factory Pattern", "Observer Pattern", "Singleton Pattern", "Strategy Pattern"],
    correctIndex: 2,
    explanation:
      "This is the Singleton pattern — it restricts a class to a single instance. Private constructor prevents direct instantiation; `getInstance()` creates the instance only once.",
  },

  // ── Daily Quiz JavaScript (unique questions not in lesson data) ──
  {
    slug: "jsq-3-coercion-array",
    skillCode: "js-operators",
    difficulty: "HARD",
    reasoningLevel: "ANALYZE",
    prompt: "What is the output of this code?",
    code: "console.log([] == false);\nconsole.log([] === false);",
    options: ["true, true", "true, false", "false, false", "false, true"],
    correctIndex: 1,
    explanation:
      "`[] == false` is `true` because `==` coerces both sides. `[] === false` is `false` because strict equality checks type first (object vs boolean).",
  },
  {
    slug: "jsq-4-async-await",
    skillCode: "js-async",
    difficulty: "MEDIUM",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does the `async/await` syntax do?",
    options: [
      "Makes code run in parallel threads",
      "Makes asynchronous code look and behave like synchronous code using Promises",
      "Speeds up function execution",
      "Creates a new process for each async call",
    ],
    correctIndex: 1,
    explanation:
      "`async` marks a function as returning a Promise. `await` pauses execution inside that function until the Promise resolves.",
  },
  {
    slug: "jsq-5-event-loop",
    skillCode: "js-async",
    difficulty: "MEDIUM",
    reasoningLevel: "ANALYZE",
    prompt: "What does `Event Loop` do in JavaScript?",
    options: [
      "Manages DOM event handlers only",
      "Checks the call stack and task queue, pushing queued callbacks to the stack when it's empty",
      "Loops through all events on the page",
      "Runs all code in a separate thread",
    ],
    correctIndex: 1,
    explanation:
      "The event loop continuously checks: is the call stack empty? If yes, it takes the first callback from the task queue and pushes it onto the stack.",
  },
  {
    slug: "jsq-6-let-const-var",
    skillCode: "js-variables",
    difficulty: "MEDIUM",
    reasoningLevel: "ANALYZE",
    prompt: "What is the difference between `let`, `const`, and `var`?",
    options: [
      "They are all identical in modern JavaScript",
      "`var` is function-scoped; `let` and `const` are block-scoped; `const` can't be reassigned",
      "`let` is for numbers, `const` is for strings, `var` is for objects",
      "`const` creates immutable values; `let` and `var` create mutable values",
    ],
    correctIndex: 1,
    explanation:
      "`var` is function-scoped and hoisted. `let` and `const` are block-scoped. `const` prevents reassignment (but objects/arrays can still be mutated).",
  },
  {
    slug: "jsq-7-promise-all",
    skillCode: "js-async",
    difficulty: "MEDIUM",
    reasoningLevel: "RECOGNIZE",
    prompt: "What does `Promise.all()` do?",
    options: [
      "Runs Promises one after another",
      "Resolves when ALL promises resolve; rejects if ANY promise rejects",
      "Returns only the fastest Promise",
      "Catches all Promise rejections silently",
    ],
    correctIndex: 1,
    explanation:
      "`Promise.all([p1, p2, p3])` runs promises concurrently and resolves with an array of results when ALL succeed.",
  },
  {
    slug: "jsq-8-var-settimeout",
    skillCode: "js-closures",
    difficulty: "HARD",
    reasoningLevel: "ANALYZE",
    prompt: "What is the output?",
    code: "for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}",
    options: ["0, 1, 2", "3, 3, 3", "undefined, undefined, undefined", "0, 0, 0"],
    correctIndex: 1,
    explanation:
      "`var` is function-scoped, so all three callbacks share the same `i`. By the time `setTimeout` fires, the loop has finished and `i` is `3`.",
  },
  {
    slug: "jsq-9-prototypal",
    skillCode: "js-prototypes",
    difficulty: "MEDIUM",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is prototypal inheritance in JavaScript?",
    options: [
      "Classes inherit from other classes using `extends`",
      "Objects inherit directly from other objects through a prototype chain",
      "Functions inherit from the global scope",
      "Variables inherit their types from their initial value",
    ],
    correctIndex: 1,
    explanation:
      "In JavaScript, every object has a hidden `[[Prototype]]` link to another object. When you access a property that doesn't exist, JS walks up the prototype chain.",
  },
  {
    slug: "jsq-10-spread-object",
    skillCode: "js-arrays",
    difficulty: "EASY",
    reasoningLevel: "APPLY",
    prompt: "What does the spread operator do?",
    code: "const merged = { ...obj1, ...obj2 };",
    options: [
      "Deep clones both objects recursively",
      "Creates a shallow copy merging properties — later properties overwrite earlier ones",
      "Concatenates two objects into an array",
      "Compares two objects for equality",
    ],
    correctIndex: 1,
    explanation:
      "The spread operator expands an object's own enumerable properties into a new object. Properties from `obj2` overwrite matching keys from `obj1`. It's a shallow copy.",
  },
  {
    slug: "jsq-11-null-vs-undefined",
    skillCode: "js-variables",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    prompt: "What is the difference between `null` and `undefined` in JavaScript?",
    options: [
      "They are exactly the same thing",
      "`undefined` means a variable was declared but not assigned; `null` is an intentional absence of value",
      "`null` is for numbers; `undefined` is for strings",
      "`undefined` throws an error; `null` does not",
    ],
    correctIndex: 1,
    explanation:
      "`undefined` is JavaScript's default for uninitialized variables. `null` is explicitly assigned by developers to indicate 'no value'.",
  },
  {
    slug: "jsq-12-reduce",
    skillCode: "js-collections",
    difficulty: "MEDIUM",
    reasoningLevel: "APPLY",
    prompt: "What does `.reduce()` do?",
    code: "[1, 2, 3, 4].reduce((acc, val) => acc + val, 0);",
    options: [
      "Filters out values that are zero",
      "Accumulates array elements into a single value using a callback",
      "Reduces the array's length by removing duplicates",
      "Returns a new array with smaller values",
    ],
    correctIndex: 1,
    explanation:
      "`.reduce()` iterates over the array, passing an accumulator and the current value to the callback. Here it sums to `10`.",
  },
  {
    slug: "jsq-13-arrow-this",
    skillCode: "js-functions",
    difficulty: "MEDIUM",
    reasoningLevel: "APPLY",
    prompt: "What is `this` inside an arrow function?",
    options: [
      "The object that called the function",
      "The global `window` object",
      "The lexically enclosing scope's `this`",
      "Always `undefined`",
    ],
    correctIndex: 2,
    explanation:
      "Arrow functions don't have their own `this` — they inherit `this` from the enclosing lexical scope.",
  },
  {
    slug: "jsq-14-destructuring-default",
    skillCode: "js-arrays",
    difficulty: "EASY",
    reasoningLevel: "APPLY",
    prompt: "What does destructuring do here?",
    code: "const { name, age = 25 } = user;",
    options: [
      "Creates a new user with name and age",
      "Extracts properties; uses 25 as a default if `age` is undefined",
      "Deletes the name and age from user",
      "Validates that user has name and age properties",
    ],
    correctIndex: 1,
    explanation:
      "Destructuring extracts `name` and `age` from `user` into local variables. The `= 25` provides a default value for `age` if it's `undefined`.",
  },
  {
    slug: "jsq-15-weakmap",
    skillCode: "js-collections",
    difficulty: "HARD",
    reasoningLevel: "RECOGNIZE",
    prompt: "What are WeakMap and WeakSet used for?",
    options: [
      "Storing large amounts of data more efficiently",
      "Holding weak references to objects that don't prevent garbage collection",
      "Creating read-only collections",
      "Sorting data with weak comparison operators",
    ],
    correctIndex: 1,
    explanation:
      "`WeakMap` and `WeakSet` hold weak references — if nothing else references the key object, it can be garbage collected.",
  },
];

// ── Seeding logic ──

async function seed() {
  console.log(`Seeding ${SKILLS.length} skills and ${QUESTIONS.length} questions...`);

  const skillMap = new Map<string, string>();

  for (const s of SKILLS) {
    const existing = await db.select({ id: skills.id }).from(skills).where(eq(skills.code, s.code));
    if (existing.length > 0) {
      skillMap.set(s.code, existing[0]!.id);
      continue;
    }
    const [inserted] = await db.insert(skills).values(s).returning({ id: skills.id });
    skillMap.set(s.code, inserted!.id);
  }
  console.log(`  Skills: ${skillMap.size} ready`);

  let inserted = 0;
  let skipped = 0;

  for (const q of QUESTIONS) {
    const existing = await db
      .select({ id: questions.id })
      .from(questions)
      .where(eq(questions.slug, q.slug));
    if (existing.length > 0) {
      skipped++;
      continue;
    }

    const skillId = skillMap.get(q.skillCode);
    if (!skillId) {
      console.warn(`  Skipping ${q.slug}: unknown skill ${q.skillCode}`);
      skipped++;
      continue;
    }

    const optionKeys = ["A", "B", "C", "D"];
    const correctKey = optionKeys[q.correctIndex]!;

    const [question] = await db
      .insert(questions)
      .values({
        slug: q.slug,
        primarySkillId: skillId,
        questionType: "SINGLE_CHOICE",
        difficulty: q.difficulty,
        reasoningLevel: q.reasoningLevel,
        status: "PUBLISHED",
        publishedAt: new Date(),
      })
      .returning({ id: questions.id });

    const [version] = await db
      .insert(questionVersions)
      .values({
        questionId: question!.id,
        versionNumber: 1,
        prompt: q.prompt,
        content: q.code ? { code: q.code } : {},
        correctAnswer: { ids: [correctKey] },
        generalExplanation: q.explanation,
      })
      .returning({ id: questionVersions.id });

    await db.insert(questionOptions).values(
      q.options.map((text, i) => ({
        questionVersionId: version!.id,
        optionKey: optionKeys[i]!,
        content: text,
        displayOrder: i + 1,
      })),
    );

    inserted++;
  }

  console.log(`  Questions: ${inserted} inserted, ${skipped} skipped (already exist)`);
  console.log("Done.");
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => client.end());
