import type { Question } from "./types";

export interface StudyTrack {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  questions: Question[];
}

export const STUDY_TRACKS: StudyTrack[] = [
  {
    id: "systems-design",
    title: "Systems Design",
    description: "Learn to design scalable, reliable distributed systems",
    icon: "🏗️",
    color: "indigo",
    bgClass: "bg-indigo-500",
    borderClass: "border-indigo-500",
    textClass: "text-indigo-600 dark:text-indigo-400",
    questions: [
      {
        id: "sd-1",
        type: "multiple-choice",
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
        id: "sd-2",
        type: "multiple-choice",
        prompt: "What does CAP theorem state about distributed systems?",
        options: [
          "You can have Caching, Availability, and Performance simultaneously",
          "You can only pick two of: Consistency, Availability, Partition tolerance",
          "Complexity Always Propagates through a system",
          "Centralized And Partitioned systems are equivalent",
        ],
        correctIndex: 1,
        explanation:
          "CAP theorem states that a distributed system can only guarantee two of three properties: Consistency (every read gets the most recent write), Availability (every request gets a response), and Partition tolerance (system works despite network failures).",
      },
      {
        id: "sd-3",
        type: "multiple-choice",
        prompt: "What is the main advantage of horizontal scaling over vertical scaling?",
        options: [
          "It's always cheaper",
          "It requires less code changes",
          "It has virtually no upper limit — you can keep adding machines",
          "It provides better single-request performance",
        ],
        correctIndex: 2,
        explanation:
          "Horizontal scaling (adding more machines) has no hard ceiling — you can keep adding servers. Vertical scaling (upgrading a single machine) hits hardware limits. However, horizontal scaling requires your application to handle distributed state.",
      },
      {
        id: "sd-4",
        type: "multiple-choice",
        prompt: "What is a CDN (Content Delivery Network) primarily used for?",
        options: [
          "Running server-side code closer to users",
          "Serving static content from geographically distributed edge servers",
          "Encrypting data at rest in the database",
          "Balancing load between application servers",
        ],
        correctIndex: 1,
        explanation:
          "A CDN caches and serves static assets (images, CSS, JS) from edge servers close to users, reducing latency and offloading traffic from origin servers.",
      },
      {
        id: "sd-5",
        type: "multiple-choice",
        prompt: "What is database sharding?",
        options: [
          "Creating read replicas of a database",
          "Splitting data across multiple database instances based on a shard key",
          "Backing up the database to multiple locations",
          "Compressing database tables to save storage",
        ],
        correctIndex: 1,
        explanation:
          "Sharding partitions data across multiple database instances using a shard key (e.g., user ID). Each shard holds a subset of the data, enabling horizontal scaling of the database layer.",
      },
      {
        id: "sd-6",
        type: "multiple-choice",
        prompt: "What caching strategy writes data to the cache AND the database at the same time?",
        options: [
          "Cache-aside (lazy loading)",
          "Write-through",
          "Write-behind (write-back)",
          "Read-through",
        ],
        correctIndex: 1,
        explanation:
          "Write-through updates both the cache and the database synchronously on every write. This ensures consistency but adds write latency. Write-behind batches writes to the database asynchronously for better performance.",
      },
      {
        id: "sd-7",
        type: "multiple-choice",
        prompt: "What problem does a message queue (like Kafka or RabbitMQ) solve?",
        options: [
          "It replaces the need for a database",
          "It decouples producers from consumers and handles traffic spikes via buffering",
          "It encrypts messages between services",
          "It provides a faster alternative to HTTP",
        ],
        correctIndex: 1,
        explanation:
          "Message queues decouple services so producers don't need to wait for consumers. They buffer messages during traffic spikes, enable async processing, and improve fault tolerance — if a consumer is down, messages wait in the queue.",
      },
      {
        id: "sd-8",
        type: "multiple-choice",
        prompt: "What is the difference between SQL and NoSQL databases?",
        options: [
          "SQL is faster; NoSQL is slower but cheaper",
          "SQL enforces a fixed schema with ACID transactions; NoSQL offers flexible schemas with horizontal scalability",
          "NoSQL doesn't support queries",
          "SQL only works with small datasets",
        ],
        correctIndex: 1,
        explanation:
          "SQL databases (PostgreSQL, MySQL) enforce structured schemas and provide ACID guarantees. NoSQL databases (MongoDB, DynamoDB, Cassandra) offer flexible schemas and are designed for horizontal scaling, often trading strict consistency for availability.",
      },
      {
        id: "sd-9",
        type: "multiple-choice",
        prompt: "What is an API rate limiter used for?",
        options: [
          "To speed up API responses",
          "To compress API payloads",
          "To restrict the number of requests a client can make in a time window",
          "To route API requests to the correct server",
        ],
        correctIndex: 2,
        explanation:
          "Rate limiting protects services from abuse and overload by capping how many requests a client can make per time window (e.g., 100 requests/minute). Common algorithms include token bucket, leaky bucket, and sliding window.",
      },
      {
        id: "sd-10",
        type: "multiple-choice",
        prompt: "What is eventual consistency?",
        options: [
          "Data is always consistent across all nodes at all times",
          "Data will become consistent across all nodes given enough time, but may be stale temporarily",
          "Data is never guaranteed to be consistent",
          "Consistency is only checked when the system shuts down",
        ],
        correctIndex: 1,
        explanation:
          "Eventual consistency means that if no new updates are made, all replicas will eventually converge to the same value. It's a trade-off: you get higher availability and lower latency, but reads might return stale data temporarily.",
      },
      {
        id: "sd-11",
        type: "multiple-choice",
        prompt: "What is the purpose of a reverse proxy?",
        options: [
          "To hide the client's identity from the server",
          "To sit in front of servers, handling requests on their behalf (SSL termination, caching, load balancing)",
          "To proxy requests from the server to external APIs",
          "To reverse the order of HTTP headers",
        ],
        correctIndex: 1,
        explanation:
          "A reverse proxy (like Nginx or HAProxy) sits in front of backend servers, handling concerns like SSL termination, caching, compression, and load balancing — shielding servers from direct client access.",
      },
      {
        id: "sd-12",
        type: "multiple-choice",
        prompt: "What is a microservices architecture?",
        options: [
          "Running all code in a single process for simplicity",
          "Breaking an application into small, independently deployable services that communicate over a network",
          "Using very small servers with limited CPU and memory",
          "Writing functions that are each less than 100 lines of code",
        ],
        correctIndex: 1,
        explanation:
          "Microservices decompose an application into small, focused services that can be developed, deployed, and scaled independently. Each service owns its data and communicates via APIs or messaging. The trade-off is increased operational complexity.",
      },
      {
        id: "sd-13",
        type: "multiple-choice",
        prompt: "You need to design a URL shortener. Which is the most critical component?",
        options: [
          "A machine learning model to predict popular URLs",
          "A key-value store mapping short codes to original URLs with high read throughput",
          "A relational database with complex JOIN queries",
          "A WebSocket server for real-time updates",
        ],
        correctIndex: 1,
        explanation:
          "A URL shortener is read-heavy — most operations are redirects (reads), not creates (writes). A key-value store (like Redis or DynamoDB) provides O(1) lookups and high throughput, making it ideal for mapping short codes → URLs.",
      },
      {
        id: "sd-14",
        type: "multiple-choice",
        prompt: "What is the circuit breaker pattern?",
        options: [
          "A physical device that protects servers from power surges",
          "A pattern that stops calling a failing service and returns a fallback, preventing cascade failures",
          "A way to split database transactions across services",
          "A method for encrypting inter-service communication",
        ],
        correctIndex: 1,
        explanation:
          "The circuit breaker pattern monitors calls to a service. When failures exceed a threshold, it 'opens' the circuit — immediately returning an error or fallback instead of waiting for timeouts. This prevents cascading failures across the system.",
      },
      {
        id: "sd-15",
        type: "multiple-choice",
        prompt: "What is database replication primarily used for?",
        options: [
          "Increasing write throughput by splitting writes across replicas",
          "Improving read performance and providing fault tolerance with copies of the data",
          "Compressing data to reduce storage costs",
          "Encrypting data across multiple locations",
        ],
        correctIndex: 1,
        explanation:
          "Database replication creates copies (replicas) of data on multiple servers. Read replicas handle read traffic, reducing load on the primary. If the primary fails, a replica can be promoted — providing fault tolerance.",
      },
    ],
  },
  {
    id: "java",
    title: "Java",
    description: "Master the enterprise powerhouse language",
    icon: "☕",
    color: "red",
    bgClass: "bg-red-500",
    borderClass: "border-red-500",
    textClass: "text-red-600 dark:text-red-400",
    questions: [
      {
        id: "java-1",
        type: "multiple-choice",
        prompt: "What is the difference between `==` and `.equals()` in Java?",
        options: [
          "They are identical for all types",
          "`==` compares references (memory addresses); `.equals()` compares values",
          "`==` is for primitives only; `.equals()` is for Strings only",
          "`.equals()` is faster than `==`",
        ],
        correctIndex: 1,
        explanation:
          '`==` checks if two references point to the same object in memory. `.equals()` checks if two objects have the same value. For Strings: `new String("hi") == new String("hi")` is `false`, but `.equals()` returns `true`.',
      },
      {
        id: "java-2",
        type: "multiple-choice",
        prompt: "What does the `final` keyword do when applied to a variable?",
        options: [
          "Makes it accessible from any class",
          "Makes it a static variable",
          "Prevents it from being reassigned after initialization",
          "Makes it thread-safe automatically",
        ],
        correctIndex: 2,
        explanation:
          "`final` prevents reassignment — the variable can only be assigned once. For references, the reference can't change but the object it points to can still be modified (e.g., you can add to a `final List`).",
      },
      {
        id: "java-3",
        type: "multiple-choice",
        prompt: "What is the difference between an abstract class and an interface in Java?",
        options: [
          "There is no difference since Java 8",
          "Abstract classes can have state (fields) and constructors; interfaces cannot have instance state",
          "Interfaces can extend multiple classes; abstract classes cannot",
          "Abstract classes are faster at runtime",
        ],
        correctIndex: 1,
        explanation:
          "Abstract classes can have instance fields, constructors, and both abstract and concrete methods. Interfaces define contracts — they can have default methods (since Java 8) but no instance state. A class can implement multiple interfaces but extend only one class.",
      },
      {
        id: "java-4",
        type: "multiple-choice",
        prompt: "What does `HashMap` use to store and retrieve entries efficiently?",
        options: [
          "A sorted binary tree",
          "A linked list scanned sequentially",
          "Hash codes to map keys to bucket indices for O(1) average access",
          "A fixed-size array indexed by insertion order",
        ],
        correctIndex: 2,
        explanation:
          "`HashMap` computes `hashCode()` on the key, maps it to a bucket index, and stores the entry there. Retrieval is O(1) on average. Collisions are handled with linked lists (or trees for long chains since Java 8).",
      },
      {
        id: "java-5",
        type: "multiple-choice",
        prompt: "What is the purpose of Java's garbage collector?",
        options: [
          "To delete unused source code files",
          "To automatically free memory occupied by objects that are no longer reachable",
          "To optimize SQL queries",
          "To remove unused imports at compile time",
        ],
        correctIndex: 1,
        explanation:
          "Java's garbage collector (GC) automatically identifies and frees memory from objects that have no live references. This prevents memory leaks and eliminates manual memory management (no `free()` or `delete` like in C/C++).",
      },
      {
        id: "java-6",
        type: "multiple-choice",
        prompt: "What does this code print?",
        code: `String a = "hello";
String b = "hello";
System.out.println(a == b);`,
        options: ["true", "false", "Compilation error", "NullPointerException"],
        correctIndex: 0,
        explanation:
          'Java interns string literals — `"hello"` is stored once in the String pool. Both `a` and `b` point to the same pooled object, so `==` returns `true`. Using `new String("hello")` would bypass the pool and return `false`.',
      },
      {
        id: "java-7",
        type: "multiple-choice",
        prompt: "What is the difference between `ArrayList` and `LinkedList`?",
        options: [
          "ArrayList uses a linked list internally; LinkedList uses an array",
          "ArrayList provides O(1) random access; LinkedList provides O(1) insertions/deletions at the ends",
          "They are identical in performance",
          "LinkedList is thread-safe; ArrayList is not",
        ],
        correctIndex: 1,
        explanation:
          "`ArrayList` is backed by a resizable array — fast random access (`get(i)` is O(1)) but slow insertions in the middle (O(n)). `LinkedList` is a doubly-linked list — O(1) add/remove at head/tail but O(n) random access.",
      },
      {
        id: "java-8",
        type: "multiple-choice",
        prompt: "What does the `static` keyword mean on a method?",
        options: [
          "The method can't be overridden",
          "The method belongs to the class, not to instances — called without creating an object",
          "The method runs in a separate thread",
          "The method is called only once during the program's lifetime",
        ],
        correctIndex: 1,
        explanation:
          "A `static` method belongs to the class itself. You call it via `ClassName.method()` without instantiating the class. It can't access instance fields or `this`. The `main` method is static because it runs before any objects exist.",
      },
      {
        id: "java-9",
        type: "multiple-choice",
        prompt: "What exception is thrown when you try to access index 5 of a 3-element array?",
        options: [
          "NullPointerException",
          "ArrayIndexOutOfBoundsException",
          "ClassCastException",
          "StackOverflowError",
        ],
        correctIndex: 1,
        explanation:
          "`ArrayIndexOutOfBoundsException` is thrown when you access an array with an index outside its bounds (negative or >= length). For a 3-element array, valid indices are 0, 1, and 2.",
      },
      {
        id: "java-10",
        type: "multiple-choice",
        prompt: "What is the purpose of the `try-with-resources` statement introduced in Java 7?",
        options: [
          "To retry failed operations automatically",
          "To automatically close resources (files, connections) when the block exits",
          "To catch multiple exception types at once",
          "To allocate more memory for resource-intensive operations",
        ],
        correctIndex: 1,
        explanation:
          "`try-with-resources` ensures that resources implementing `AutoCloseable` (files, streams, connections) are closed automatically when the try block finishes — even if an exception is thrown. No more forgetting `close()` in `finally` blocks.",
      },
      {
        id: "java-11",
        type: "multiple-choice",
        prompt: "What is method overloading in Java?",
        options: [
          "Defining the same method in a parent and child class",
          "Defining multiple methods with the same name but different parameter types or counts",
          "Making a method run faster by the compiler",
          "Calling a method more times than it can handle",
        ],
        correctIndex: 1,
        explanation:
          "Overloading means multiple methods share a name but differ in parameter types, count, or order. The compiler picks the right version at compile time. Example: `print(int)`, `print(String)`, `print(int, String)` can coexist.",
      },
      {
        id: "java-12",
        type: "multiple-choice",
        prompt: "What does Java's `Stream.filter()` do?",
        code: `List<Integer> result = numbers.stream()
    .filter(n -> n > 5)
    .collect(Collectors.toList());`,
        options: [
          "Sorts elements by the given condition",
          "Returns a new stream containing only elements that match the predicate",
          "Removes elements from the original list",
          "Groups elements by the condition",
        ],
        correctIndex: 1,
        explanation:
          "`filter()` returns a new stream with only the elements for which the predicate returns `true`. It's a lazy intermediate operation — nothing executes until a terminal operation (like `collect()`) is called. The original collection is unchanged.",
      },
      {
        id: "java-13",
        type: "multiple-choice",
        prompt: "What is the purpose of `Optional<T>` in Java?",
        options: [
          "To make any variable nullable",
          "To represent a value that may or may not be present, avoiding NullPointerException",
          "To store multiple values of type T",
          "To make methods run optionally",
        ],
        correctIndex: 1,
        explanation:
          "`Optional<T>` is a container that explicitly represents the presence or absence of a value. Instead of returning `null` (which can cause NPE), return `Optional.empty()`. Use `isPresent()`, `orElse()`, or `map()` to handle both cases safely.",
      },
      {
        id: "java-14",
        type: "multiple-choice",
        prompt: "What does the `synchronized` keyword do?",
        options: [
          "Makes the method run faster in multi-threaded code",
          "Ensures only one thread can execute the block/method at a time, preventing race conditions",
          "Synchronizes the system clock",
          "Makes the method execute in a specific order",
        ],
        correctIndex: 1,
        explanation:
          "`synchronized` acquires a lock so that only one thread at a time can execute the synchronized block or method. This prevents race conditions when multiple threads access shared mutable state. The trade-off is reduced parallelism.",
      },
      {
        id: "java-15",
        type: "multiple-choice",
        prompt: "What design pattern does this code demonstrate?",
        code: `public class DatabaseConnection {
    private static DatabaseConnection instance;
    private DatabaseConnection() {}
    public static DatabaseConnection getInstance() {
        if (instance == null) instance = new DatabaseConnection();
        return instance;
    }
}`,
        options: ["Factory Pattern", "Observer Pattern", "Singleton Pattern", "Strategy Pattern"],
        correctIndex: 2,
        explanation:
          "This is the Singleton pattern — it restricts a class to a single instance. Private constructor prevents direct instantiation; `getInstance()` creates the instance only once. Note: this basic version is not thread-safe; use double-checked locking or an enum for thread safety.",
      },
    ],
  },
  {
    id: "javascript",
    title: "JavaScript",
    description: "Master the language of the web",
    icon: "🟨",
    color: "amber",
    bgClass: "bg-amber-500",
    borderClass: "border-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
    questions: [
      {
        id: "jsq-1",
        type: "multiple-choice",
        prompt: "What does `typeof null` return in JavaScript?",
        code: `console.log(typeof null);`,
        options: ["null", "undefined", "object", "boolean"],
        correctIndex: 2,
        explanation:
          "`typeof null` returns `'object'` — this is a famous JavaScript bug from 1995 that was never fixed to avoid breaking existing code.",
      },
      {
        id: "jsq-2",
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
          "A closure is a function that retains access to variables from its outer (enclosing) scope even after that outer function has returned. This is how private variables and data encapsulation work in JavaScript.",
      },
      {
        id: "jsq-3",
        type: "multiple-choice",
        prompt: "What is the output of this code?",
        code: `console.log([] == false);
console.log([] === false);`,
        options: ["true, true", "true, false", "false, false", "false, true"],
        correctIndex: 1,
        explanation:
          "`[] == false` is `true` because `==` coerces both sides — the empty array becomes `''` which becomes `0`, and `false` becomes `0`. `[] === false` is `false` because strict equality checks type first (object vs boolean).",
      },
      {
        id: "jsq-4",
        type: "multiple-choice",
        prompt: "What does the `async/await` syntax do?",
        options: [
          "Makes code run in parallel threads",
          "Makes asynchronous code look and behave like synchronous code using Promises",
          "Speeds up function execution",
          "Creates a new process for each async call",
        ],
        correctIndex: 1,
        explanation:
          "`async` marks a function as returning a Promise. `await` pauses execution inside that function until the Promise resolves. It's syntactic sugar over `.then()` chains, making async code more readable.",
      },
      {
        id: "jsq-5",
        type: "multiple-choice",
        prompt: "What does `Event Loop` do in JavaScript?",
        options: [
          "Manages DOM event handlers only",
          "Checks the call stack and task queue, pushing queued callbacks to the stack when it's empty",
          "Loops through all events on the page",
          "Runs all code in a separate thread",
        ],
        correctIndex: 1,
        explanation:
          "The event loop continuously checks: is the call stack empty? If yes, it takes the first callback from the task queue and pushes it onto the stack. This is how JavaScript handles async operations with a single thread.",
      },
      {
        id: "jsq-6",
        type: "multiple-choice",
        prompt: "What is the difference between `let`, `const`, and `var`?",
        options: [
          "They are all identical in modern JavaScript",
          "`var` is function-scoped; `let` and `const` are block-scoped; `const` can't be reassigned",
          "`let` is for numbers, `const` is for strings, `var` is for objects",
          "`const` creates immutable values; `let` and `var` create mutable values",
        ],
        correctIndex: 1,
        explanation:
          "`var` is function-scoped and hoisted. `let` and `const` are block-scoped (`{}`) and sit in the temporal dead zone until declared. `const` prevents reassignment (but objects/arrays can still be mutated).",
      },
      {
        id: "jsq-7",
        type: "multiple-choice",
        prompt: "What does `Promise.all()` do?",
        options: [
          "Runs Promises one after another",
          "Resolves when ALL promises resolve; rejects if ANY promise rejects",
          "Returns only the fastest Promise",
          "Catches all Promise rejections silently",
        ],
        correctIndex: 1,
        explanation:
          "`Promise.all([p1, p2, p3])` runs promises concurrently and resolves with an array of results when ALL succeed. If any single promise rejects, the whole `Promise.all` rejects. Use `Promise.allSettled()` if you want results regardless of failures.",
      },
      {
        id: "jsq-8",
        type: "multiple-choice",
        prompt: "What is the output?",
        code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
        options: ["0, 1, 2", "3, 3, 3", "undefined, undefined, undefined", "0, 0, 0"],
        correctIndex: 1,
        explanation:
          "`var` is function-scoped, so all three callbacks share the same `i`. By the time `setTimeout` fires, the loop has finished and `i` is `3`. Using `let` instead of `var` would create a new `i` per iteration, logging `0, 1, 2`.",
      },
      {
        id: "jsq-9",
        type: "multiple-choice",
        prompt: "What is prototypal inheritance in JavaScript?",
        options: [
          "Classes inherit from other classes using `extends`",
          "Objects inherit directly from other objects through a prototype chain",
          "Functions inherit from the global scope",
          "Variables inherit their types from their initial value",
        ],
        correctIndex: 1,
        explanation:
          "In JavaScript, every object has a hidden `[[Prototype]]` link to another object. When you access a property that doesn't exist on the object, JS walks up the prototype chain. `class` syntax is syntactic sugar over this prototypal system.",
      },
      {
        id: "jsq-10",
        type: "multiple-choice",
        prompt: "What does the spread operator do?",
        code: `const merged = { ...obj1, ...obj2 };`,
        options: [
          "Deep clones both objects recursively",
          "Creates a shallow copy merging properties — later properties overwrite earlier ones",
          "Concatenates two objects into an array",
          "Compares two objects for equality",
        ],
        correctIndex: 1,
        explanation:
          "The spread operator `...` expands an object's own enumerable properties into a new object. Properties from `obj2` overwrite matching keys from `obj1`. It's a shallow copy — nested objects are still shared references.",
      },
      {
        id: "jsq-11",
        type: "multiple-choice",
        prompt: "What is the difference between `null` and `undefined` in JavaScript?",
        options: [
          "They are exactly the same thing",
          "`undefined` means a variable was declared but not assigned; `null` is an intentional absence of value",
          "`null` is for numbers; `undefined` is for strings",
          "`undefined` throws an error; `null` does not",
        ],
        correctIndex: 1,
        explanation:
          "`undefined` is JavaScript's default for uninitialized variables, missing function arguments, and missing object properties. `null` is explicitly assigned by developers to indicate 'no value'. `typeof undefined` is `'undefined'`; `typeof null` is `'object'`.",
      },
      {
        id: "jsq-12",
        type: "multiple-choice",
        prompt: "What does `.reduce()` do?",
        code: `[1, 2, 3, 4].reduce((acc, val) => acc + val, 0);`,
        options: [
          "Filters out values that are zero",
          "Accumulates array elements into a single value using a callback",
          "Reduces the array's length by removing duplicates",
          "Returns a new array with smaller values",
        ],
        correctIndex: 1,
        explanation:
          "`.reduce()` iterates over the array, passing an accumulator and the current value to the callback. The return value becomes the next accumulator. Here it sums: 0+1=1, 1+2=3, 3+3=6, 6+4=10. Final result: `10`.",
      },
      {
        id: "jsq-13",
        type: "multiple-choice",
        prompt: "What is `this` inside an arrow function?",
        options: [
          "The object that called the function",
          "The global `window` object",
          "The lexically enclosing scope's `this`",
          "Always `undefined`",
        ],
        correctIndex: 2,
        explanation:
          "Arrow functions don't have their own `this` — they inherit `this` from the enclosing lexical scope (where they were defined). Regular functions get `this` based on how they're called. This makes arrow functions ideal for callbacks inside methods.",
      },
      {
        id: "jsq-14",
        type: "multiple-choice",
        prompt: "What does destructuring do here?",
        code: `const { name, age = 25 } = user;`,
        options: [
          "Creates a new user with name and age",
          "Extracts properties; uses 25 as a default if `age` is undefined",
          "Deletes the name and age from user",
          "Validates that user has name and age properties",
        ],
        correctIndex: 1,
        explanation:
          "Destructuring extracts `name` and `age` from `user` into local variables. The `= 25` provides a default value for `age` if it's `undefined` in the object. It won't apply if `age` is `null` or `0` — only `undefined`.",
      },
      {
        id: "jsq-15",
        type: "multiple-choice",
        prompt: "What are WeakMap and WeakSet used for?",
        options: [
          "Storing large amounts of data more efficiently",
          "Holding weak references to objects that don't prevent garbage collection",
          "Creating read-only collections",
          "Sorting data with weak comparison operators",
        ],
        correctIndex: 1,
        explanation:
          "`WeakMap` and `WeakSet` hold weak references — if nothing else references the key object, it can be garbage collected even though it's in the WeakMap/WeakSet. Use cases: caching metadata, associating private data with DOM elements without memory leaks.",
      },
    ],
  },
];

export const DAILY_QUIZ_SIZE = 5;
export const XP_PER_CORRECT = 10;
export const XP_PERFECT_BONUS = 25;

export function getStudyTrack(id: string): StudyTrack | undefined {
  return STUDY_TRACKS.find((t) => t.id === id);
}

export function getDailyQuizQuestions(trackId: string, dateStr: string): Question[] {
  const track = getStudyTrack(trackId);
  if (!track) return [];

  const seed = dateStr.split("-").reduce((acc, part) => acc * 31 + parseInt(part, 10), 0);
  const pool = [...track.questions];

  // Fisher-Yates shuffle with deterministic seed
  let rng = seed;
  for (let i = pool.length - 1; i > 0; i--) {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    const j = rng % (i + 1);
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }

  return pool.slice(0, DAILY_QUIZ_SIZE);
}
