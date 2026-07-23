import type { Topic } from "./types";

export const TOPICS: Topic[] = [
  {
    id: "javascript",
    title: "JavaScript",
    description: "Master the language of the web",
    icon: "🟨",
    color: "amber",
    bgClass: "bg-amber-500",
    borderClass: "border-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
    lessons: [
      {
        id: "js-variables",
        title: "Variables & Types",
        icon: "📦",
        xpReward: 20,
        questions: [
          {
            id: "js-v1",
            type: "multiple-choice",
            prompt: "What does `typeof null` return in JavaScript?",
            code: `console.log(typeof null);`,
            options: ["null", "undefined", "object", "boolean"],
            correctIndex: 2,
            explanation:
              "`typeof null` returns `'object'` — this is a famous JavaScript bug from 1995 that was never fixed to avoid breaking existing code.",
          },
          {
            id: "js-v2",
            type: "multiple-choice",
            prompt: "Which keyword creates a block-scoped variable?",
            options: ["var", "let", "const", "function"],
            correctIndex: 1,
            explanation:
              "`let` is block-scoped (limited to `{}`). `var` is function-scoped and can leak out of blocks.",
          },
          {
            id: "js-v3",
            type: "multiple-choice",
            prompt: "What is the result of this expression?",
            code: `0.1 + 0.2 === 0.3`,
            options: ["true", "false", "NaN", "undefined"],
            correctIndex: 1,
            explanation:
              "Floating-point arithmetic in JavaScript (and most languages) isn't exact. `0.1 + 0.2` equals `0.30000000000000004`, not `0.3`.",
          },
          {
            id: "js-v4",
            type: "multiple-choice",
            prompt: "Which of these is NOT a JavaScript primitive?",
            options: ["string", "number", "Array", "boolean"],
            correctIndex: 2,
            explanation:
              "`Array` is an object (reference type), not a primitive. Primitives include: string, number, boolean, null, undefined, symbol, bigint.",
          },
          {
            id: "js-v5",
            type: "multiple-choice",
            prompt: "What does `===` check that `==` does not?",
            options: [
              "Only the value",
              "Only the type",
              "Both value and type",
              "Reference equality",
            ],
            correctIndex: 2,
            explanation:
              "`===` (strict equality) checks both value AND type, so `'5' === 5` is `false`. `==` coerces types first, so `'5' == 5` is `true`.",
          },
        ],
      },
      {
        id: "js-functions",
        title: "Functions & Scope",
        icon: "⚙️",
        xpReward: 20,
        questions: [
          {
            id: "js-f1",
            type: "multiple-choice",
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
            id: "js-f2",
            type: "multiple-choice",
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
            id: "js-f3",
            type: "multiple-choice",
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
            id: "js-f4",
            type: "multiple-choice",
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
            id: "js-f5",
            type: "multiple-choice",
            prompt: "What does this code log?",
            code: `for (var i = 0; i < 3; i++) {}
console.log(i);`,
            options: ["0", "2", "3", "ReferenceError"],
            correctIndex: 2,
            explanation:
              "`var` is function-scoped, so `i` leaks out of the `for` block. After the loop, `i` is `3` (the value that failed the `i < 3` condition).",
          },
        ],
      },
      {
        id: "js-arrays",
        title: "Arrays & Objects",
        icon: "🗂️",
        xpReward: 25,
        questions: [
          {
            id: "js-a1",
            type: "multiple-choice",
            prompt: "Which method adds an element to the END of an array?",
            options: [".push()", ".pop()", ".shift()", ".unshift()"],
            correctIndex: 0,
            explanation:
              "`.push()` appends to the end. `.pop()` removes from the end. `.unshift()` prepends to the beginning. `.shift()` removes from the beginning.",
          },
          {
            id: "js-a2",
            type: "multiple-choice",
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
            id: "js-a3",
            type: "multiple-choice",
            prompt: "What does this destructuring do?",
            code: `const { name, age } = person;`,
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
            id: "js-a4",
            type: "multiple-choice",
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
            id: "js-a5",
            type: "multiple-choice",
            prompt: "What does the spread operator do here?",
            code: `const b = [...a, 4, 5];`,
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
        ],
      },
    ],
  },
  {
    id: "git",
    title: "Git",
    description: "Version control like a pro",
    icon: "🌿",
    color: "orange",
    bgClass: "bg-orange-500",
    borderClass: "border-orange-500",
    textClass: "text-orange-600 dark:text-orange-400",
    lessons: [
      {
        id: "git-basics",
        title: "Core Commands",
        icon: "🔧",
        xpReward: 20,
        questions: [
          {
            id: "git-b1",
            type: "multiple-choice",
            prompt: "Which command initializes a new Git repository?",
            options: ["git start", "git init", "git create", "git new"],
            correctIndex: 1,
            explanation:
              "`git init` creates a new `.git` directory in your current folder, turning it into a Git repository.",
          },
          {
            id: "git-b2",
            type: "multiple-choice",
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
            id: "git-b3",
            type: "multiple-choice",
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
            id: "git-b4",
            type: "multiple-choice",
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
            id: "git-b5",
            type: "multiple-choice",
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
        ],
      },
      {
        id: "git-branching",
        title: "Branching",
        icon: "🌿",
        xpReward: 20,
        questions: [
          {
            id: "git-br1",
            type: "multiple-choice",
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
            id: "git-br2",
            type: "multiple-choice",
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
            id: "git-br3",
            type: "multiple-choice",
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
            id: "git-br4",
            type: "multiple-choice",
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
            id: "git-br5",
            type: "multiple-choice",
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
        ],
      },
      {
        id: "git-remote",
        title: "Working with Remotes",
        icon: "☁️",
        xpReward: 25,
        questions: [
          {
            id: "git-r1",
            type: "multiple-choice",
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
            id: "git-r2",
            type: "multiple-choice",
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
            id: "git-r3",
            type: "multiple-choice",
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
            id: "git-r4",
            type: "multiple-choice",
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
            id: "git-r5",
            type: "multiple-choice",
            prompt:
              "You pushed a commit with a bug. What's the SAFE way to undo it on a shared branch?",
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
        ],
      },
    ],
  },
  {
    id: "python",
    title: "Python",
    description: "Simple syntax, infinite power",
    icon: "🐍",
    color: "blue",
    bgClass: "bg-blue-500",
    borderClass: "border-blue-500",
    textClass: "text-blue-600 dark:text-blue-400",
    lessons: [
      {
        id: "py-syntax",
        title: "Syntax & Types",
        icon: "📝",
        xpReward: 20,
        questions: [
          {
            id: "py-s1",
            type: "multiple-choice",
            prompt: "What is Python's equivalent of `null`?",
            options: ["null", "nil", "None", "undefined"],
            correctIndex: 2,
            explanation:
              "`None` is Python's null value. It's a singleton object of type `NoneType`. You check for it with `is None`, not `== None`.",
          },
          {
            id: "py-s2",
            type: "multiple-choice",
            prompt: "What is the output of this code?",
            code: `print(type([]))`,
            options: ["<class 'array'>", "<class 'list'>", "<class 'tuple'>", "list"],
            correctIndex: 1,
            explanation:
              "In Python, `[]` creates a `list`. `type([])` returns `<class 'list'>`. Python's `list` is a dynamic array — the most common sequence type.",
          },
          {
            id: "py-s3",
            type: "multiple-choice",
            prompt: "How do you write a single-line comment in Python?",
            options: ["// comment", "/* comment */", "# comment", "-- comment"],
            correctIndex: 2,
            explanation:
              "Python uses `#` for single-line comments. There are no built-in multi-line comment syntax — use triple-quoted strings `'''...'''` as a workaround.",
          },
          {
            id: "py-s4",
            type: "multiple-choice",
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
            id: "py-s5",
            type: "multiple-choice",
            prompt: "What is a Python f-string?",
            code: `name = "world"\nprint(f"Hello, {name}!")`,
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
        ],
      },
      {
        id: "py-collections",
        title: "Lists & Dicts",
        icon: "📚",
        xpReward: 20,
        questions: [
          {
            id: "py-c1",
            type: "multiple-choice",
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
            id: "py-c2",
            type: "multiple-choice",
            prompt: "What does this list comprehension produce?",
            code: `[x**2 for x in range(4)]`,
            options: ["[0, 1, 2, 3]", "[1, 4, 9, 16]", "[0, 1, 4, 9]", "[4, 9, 16, 25]"],
            correctIndex: 2,
            explanation:
              "`range(4)` yields 0, 1, 2, 3. Squaring each: 0²=0, 1²=1, 2²=4, 3²=9. Result: `[0, 1, 4, 9]`. List comprehensions are a concise, Pythonic way to create lists.",
          },
          {
            id: "py-c3",
            type: "multiple-choice",
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
            id: "py-c4",
            type: "multiple-choice",
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
            id: "py-c5",
            type: "multiple-choice",
            prompt: "Which built-in function iterates over a list with its index?",
            options: ["zip()", "map()", "enumerate()", "index()"],
            correctIndex: 2,
            explanation:
              "`enumerate(iterable)` yields `(index, value)` pairs. Use it instead of `for i in range(len(list))` — it's more Pythonic and works on any iterable.",
          },
        ],
      },
      {
        id: "py-functions",
        title: "Functions & OOP",
        icon: "🏗️",
        xpReward: 25,
        questions: [
          {
            id: "py-fn1",
            type: "multiple-choice",
            prompt: "What does `*args` allow in a function definition?",
            options: [
              "Only keyword arguments",
              "A variable number of positional arguments as a tuple",
              "A dictionary of named arguments",
              "Arguments with default values",
            ],
            correctIndex: 1,
            explanation:
              "`*args` collects any number of positional arguments into a tuple. `**kwargs` does the same for keyword arguments into a dict. They let you write flexible APIs.",
          },
          {
            id: "py-fn2",
            type: "multiple-choice",
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
            id: "py-fn3",
            type: "multiple-choice",
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
            id: "py-fn4",
            type: "multiple-choice",
            prompt: "What is the output?",
            code: `def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Alice"))`,
            options: [
              "Hello, Alice!",
              "Alice, Hello!",
              "TypeError: missing argument",
              "greeting, name!",
            ],
            correctIndex: 0,
            explanation:
              "`greeting` has a default value of `'Hello'`, so calling `greet('Alice')` without it uses the default. Output: `Hello, Alice!`",
          },
          {
            id: "py-fn5",
            type: "multiple-choice",
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
        ],
      },
    ],
  },
  {
    id: "sql",
    title: "SQL",
    description: "Speak fluently to databases",
    icon: "🗄️",
    color: "violet",
    bgClass: "bg-violet-500",
    borderClass: "border-violet-500",
    textClass: "text-violet-600 dark:text-violet-400",
    lessons: [
      {
        id: "sql-select",
        title: "SELECT & Filtering",
        icon: "🔍",
        xpReward: 20,
        questions: [
          {
            id: "sql-s1",
            type: "multiple-choice",
            prompt: "Which clause filters rows in a SELECT query?",
            options: ["FILTER", "WHERE", "HAVING", "LIMIT"],
            correctIndex: 1,
            explanation:
              "`WHERE` filters individual rows before any grouping. `HAVING` filters after grouping (used with `GROUP BY`). Remember: WHERE → GROUP BY → HAVING → ORDER BY.",
          },
          {
            id: "sql-s2",
            type: "multiple-choice",
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
            id: "sql-s3",
            type: "multiple-choice",
            prompt: "Which operator checks for a range of values?",
            code: `SELECT * FROM products WHERE price ??? 10 AND 50;`,
            options: ["IN", "BETWEEN", "LIKE", "EXISTS"],
            correctIndex: 1,
            explanation:
              "`BETWEEN x AND y` is inclusive — it matches values from x to y. It's equivalent to `>= x AND <= y`. Works on numbers, dates, and strings.",
          },
          {
            id: "sql-s4",
            type: "multiple-choice",
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
            id: "sql-s5",
            type: "multiple-choice",
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
        ],
      },
      {
        id: "sql-joins",
        title: "JOINs",
        icon: "🔗",
        xpReward: 25,
        questions: [
          {
            id: "sql-j1",
            type: "multiple-choice",
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
            id: "sql-j2",
            type: "multiple-choice",
            prompt: "What does a LEFT JOIN guarantee?",
            options: [
              "All rows from the right table appear",
              "All rows from the left table appear, with NULLs for non-matching right rows",
              "Only matching rows appear",
              "The result is sorted left to right",
            ],
            correctIndex: 1,
            explanation:
              "`LEFT JOIN` (or `LEFT OUTER JOIN`) keeps ALL rows from the left table. For right-table columns with no match, it fills with NULL. Use it when the left table's data is primary.",
          },
          {
            id: "sql-j3",
            type: "multiple-choice",
            prompt: "When would you use a self-join?",
            options: [
              "To join a table to itself to compare rows within the same table",
              "To improve query performance",
              "To join more than two tables",
              "To join tables with different column types",
            ],
            correctIndex: 0,
            explanation:
              "A self-join joins a table to itself using aliases. Classic example: finding an employee's manager when both employee and manager are rows in the same `employees` table.",
          },
          {
            id: "sql-j4",
            type: "multiple-choice",
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
            id: "sql-j5",
            type: "multiple-choice",
            prompt: "What's the risk of a CROSS JOIN?",
            options: [
              "It only works on indexed columns",
              "It produces a Cartesian product — every row × every row — which can be enormous",
              "It requires both tables to have the same number of columns",
              "It deletes duplicate rows",
            ],
            correctIndex: 1,
            explanation:
              "A `CROSS JOIN` returns every combination of rows from both tables (Cartesian product). 1,000 rows × 1,000 rows = 1,000,000 result rows. Use only intentionally.",
          },
        ],
      },
      {
        id: "sql-aggregates",
        title: "Aggregations",
        icon: "📊",
        xpReward: 25,
        questions: [
          {
            id: "sql-ag1",
            type: "multiple-choice",
            prompt: "What does GROUP BY do?",
            options: [
              "Sorts the result set",
              "Groups rows with the same value in a column so aggregate functions apply per group",
              "Filters rows by group membership",
              "Joins tables by a common column",
            ],
            correctIndex: 1,
            explanation:
              "`GROUP BY column` collapses rows with identical values in `column` into a single row, letting you apply aggregates (COUNT, SUM, AVG, etc.) per group.",
          },
          {
            id: "sql-ag2",
            type: "multiple-choice",
            prompt: "What is the difference between COUNT(*) and COUNT(column)?",
            options: [
              "They are identical",
              "COUNT(*) counts all rows including NULLs; COUNT(column) ignores NULL values",
              "COUNT(*) is faster for large tables",
              "COUNT(column) counts distinct values only",
            ],
            correctIndex: 1,
            explanation:
              "`COUNT(*)` counts ALL rows in the group. `COUNT(column)` counts only rows where that column is NOT NULL. This matters when columns can be null.",
          },
          {
            id: "sql-ag3",
            type: "multiple-choice",
            prompt: "Why can't you use WHERE to filter on an aggregate like SUM()?",
            options: [
              "You can — WHERE works with any expression",
              "WHERE runs before GROUP BY, so aggregate results don't exist yet",
              "SUM() is only valid in SELECT",
              "WHERE only works with text columns",
            ],
            correctIndex: 1,
            explanation:
              "Execution order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. `WHERE` filters rows BEFORE aggregation. Use `HAVING` to filter AFTER aggregation.",
          },
          {
            id: "sql-ag4",
            type: "multiple-choice",
            prompt: "What does this query return?",
            code: `SELECT department, AVG(salary)
FROM employees
GROUP BY department
HAVING AVG(salary) > 70000;`,
            options: [
              "All employees earning more than 70000",
              "Departments where the average salary exceeds 70000",
              "The single highest-paid department",
              "All employees grouped by department",
            ],
            correctIndex: 1,
            explanation:
              "This returns each department and its average salary, but only for departments where that average is above 70,000. `HAVING` filters the grouped (aggregated) results.",
          },
          {
            id: "sql-ag5",
            type: "multiple-choice",
            prompt: "What does a window function like ROW_NUMBER() OVER (PARTITION BY ...) do?",
            options: [
              "Filters rows by window size",
              "Assigns a row number within each partition without collapsing rows",
              "Deletes rows outside the window",
              "Sorts rows and removes duplicates",
            ],
            correctIndex: 1,
            explanation:
              "Window functions compute values across a set of rows related to the current row without collapsing them into a single group. `ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC)` ranks employees within each department.",
          },
        ],
      },
    ],
  },
];

export const getTopic = (id: string) => TOPICS.find((t) => t.id === id);

export const getLesson = (topicId: string, lessonId: string) =>
  getTopic(topicId)?.lessons.find((l) => l.id === lessonId);

export const TOTAL_LESSONS = TOPICS.reduce((acc, t) => acc + t.lessons.length, 0);
