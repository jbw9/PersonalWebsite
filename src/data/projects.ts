export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  features: string[];
  github?: string;
  demo: string;
  image?: string;
  howItWorks?: string;
  notebookUrl?: string;
}

export const projects = [
  {
    id: "movie-recommendation",
    title: "Movie Recommendation System",
    description:
      "A collaborative filtering system using Matrix Factorization and Neural Networks to predict movie ratings and generate personalized recommendations.",
    longDescription:
      "This project explores different approaches to building movie recommendation systems, comparing traditional matrix factorization techniques with modern neural network architectures. Built using PyTorch and trained on the MovieLens dataset containing 100,000+ ratings.\n\nThe system implements three models: basic Matrix Factorization using embedding layers, Matrix Factorization with user/item bias terms, and a Neural Collaborative Filtering network that learns non-linear interactions. Each model progressively improves prediction accuracy while demonstrating different trade-offs between simplicity and performance.\n\nThe final section includes a personalized recommendation engine that finds similar users based on your ratings and generates tailored movie suggestions, showcasing the practical application of collaborative filtering in real-world recommendation systems.",
    technologies: ["Python", "PyTorch", "Pandas", "NumPy", "Jupyter Notebook"],
    features: [
      "Matrix Factorization using embedding layers with 100-dimensional latent factors",
      "User and item bias terms to normalize rating tendencies",
      "Neural Collaborative Filtering with fully connected layers and dropout",
      "Trained on MovieLens 100K dataset (100,836 ratings from 610 users)",
      "Achieved test loss of 1.05 with neural network approach",
      "Hyperparameter tuning with various learning rates and weight decay",
      "Personalized recommendation engine based on user taste profiles",
      "Interactive rating system for generating custom recommendations",
    ],
    github: undefined,
    demo: undefined,
    notebookUrl: "/notebooks/movie_recommendation.html",
  },
  {
    id: "seam-carving",
    title: "Image Resizing Program",
    description:
      "Quickly resize images without losing information with the Seam Carving Algorithm.",
    longDescription:
      "This project implements the seam carving algorithm, a content-aware image resizing technique that intelligently removes or adds pixels while preserving important visual features. Unlike traditional scaling methods that uniformly stretch or compress images, seam carving identifies and removes the least visually important paths through the image.\n\nThe algorithm uses dynamic programming to find optimal seams - connected paths of pixels with minimal visual importance. By calculating energy values for each pixel based on color gradients, the algorithm can preserve edges, textures, and other important visual elements while changing image dimensions.",
    technologies: ["C++"],
    features: [
      "Content-aware image resizing that preserves important visual features",
      "Dynamic programming implementation for O(h × w) time complexity",
      "Energy function based on RGB color gradients to identify important pixels",
      "Intelligent seam selection using cumulative energy tables",
      "Border handling with pixel wrapping for edge cases",
      "Tie-breaking rules for optimal path selection when energies are equal",
    ],
    github: "https://github.com/jbw9/ImageResizing",
    demo: undefined,
    image: "/SeamCarving.png",
    howItWorks: `

  ### Energy Function
  The algorithm begins by calculating an **energy value** for each pixel, which represents its visual importance. The equation for calculating energy E of one pixel at (row, col) is as follows:

  \`\`\`
  E(row, col) = Δ²col(row, col) + Δ²row(row, col)

  Δ²col(row, col) = R²col(row, col) + G²col(row, col) + B²col(row, col)

  Rcol(row, col) = R(row, col - 1) - R(row, col + 1)
  Gcol(row, col) = G(row, col - 1) - G(row, col + 1)
  Bcol(row, col) = B(row, col - 1) - B(row, col + 1)

  Δ²row(row, col) = R²row(row, col) + G²row(row, col) + B²row(row, col)

  Rrow(row, col) = R(row - 1, col) - R(row + 1, col)
  Grow(row, col) = G(row - 1, col) - G(row + 1, col)
  Brow(row, col) = B(row - 1, col) - B(row + 1, col)
  \`\`\`

  Where R(row, col) is the red value of the pixel at (row, col) and G(row, col) and B(row, col) are the green and blue values, respectively.

  Where:
  - \`Δ²col\` measures horizontal color gradients (left-right pixel differences)
  - \`Δ²row\` measures vertical color gradients (up-down pixel differences)
  - Higher energy indicates more visual importance (edges, textures, etc.)

  ### Seam Definition
  A **seam** is a connected path of pixels that:
  - **Vertical seam**: Spans image height using one pixel per column
  - **Horizontal seam**: Spans image width using one pixel per row
  - Adjacent pixels in the path are connected (including diagonally)

  ## Algorithm Architecture

  ### Phase 1: Energy Calculation
  For each pixel (row, col):
  1. Calculate color differences with adjacent pixels
  2. Compute energy = sum of squared RGB differences
  3. Store in energy matrix

  ### Phase 2: Dynamic Programming Solution
  Create cumulative energy table working bottom-up:
  - For last row: \`cumulative[row][col] = energy[row][col]\`
  - For each previous row:
    - For each column:
      - Find minimum of three possible paths below
      - \`cumulative[row][col] = energy[row][col] + min(paths)\`

  ### Phase 3: Seam Identification
  1. Find starting point: \`minimum_column = argmin(cumulative[0])\`
  2. Trace optimal path:
     - For each subsequent row:
     - Choose adjacent pixel with minimum cumulative energy
     - Handle tie-breaking (prefer middle > left > right)

  ### Phase 4: Seam Removal
  For each row in the seam:
  1. Remove the identified pixel
  2. Shift remaining pixels to fill gap
  3. Update image dimensions

  ## Time & Space Complexity

  - **Time Complexity**: O(h × w) where h = height, w = width
  - **Space Complexity**: O(h × w) for the cumulative energy table
  - **Optimization**: Dynamic programming reduces naive O(3^h × w) recursive solution

  ## Algorithm Flow

  \`\`\`
  Input Image
      ↓
  Energy Calculation (gradient-based)
      ↓
  Dynamic Programming Table
      ↓
  Find Minimum Energy Seam
      ↓
  Trace Optimal Path
      ↓
  Remove Seam Pixels
      ↓
  Output Resized Image
  \`\`\`

  ## Key Implementation Details

  ### Border Handling
  For pixels at image boundaries, the algorithm "wraps around":
  - **Left edge**: Use rightmost pixel as left neighbor
  - **Right edge**: Use leftmost pixel as right neighbor
  - **Top/bottom**: Similar wrapping for vertical calculations

  ### Tie-Breaking Rules
  When multiple paths have equal minimum energy:
  1. **Starting position**: Choose leftmost (vertical) or topmost (horizontal)
  2. **Path tracing**: Prefer middle > left/top > right/bottom

  ### Optimization Techniques
  1. **Naive Recursion**: O(3^h × w) - calculates overlapping subproblems
  2. **Memoization**: O(h × w) - caches recursive results
  3. **Dynamic Programming**: O(h × w) - iterative bottom-up approach (optimal)`,
  },
  {
    id: "explorify",
    title: "Explorify",
    description:
      "A full-stack IOS app that simplifies the process of finding events around the UIUC campus. With a built in RSVP feature, allowing users to RSVP in less than 3 seconds",
    longDescription:
      "I first came up with the idea after noticing the difficulty in finding events on the UIUC campus. As theres over 1800 student organizations across the campus, but there is no single platform for organizations to post their events. Therefore, organizations posts events on their individual Instagram accounts. It was also annoying to RSVP for events as we need to fill out a seperate google forms and fill in all of our details from scratch everytime we want to RSVP for an event.\n\nTherefore, I developed explorify! An app that allows our users to easily find events in a all in one platform that aggregates all events throughout the UIUC campus. Our built in RSVP system also allows users to RSVP for events in under 3 seconds, also storing previous answers so users don't need to fill in the form from scratch everytime.",
    technologies: ["React Native", "Supabase", "Nativewind"],
    features: [
      "Explore events posted by 1800+ organizations across UIUC",
      "RSVP for events in under 3 seconds (no third party forms are required anymore)",
      "Let organizers know your dietary restrictions, contact and party size",
      "Allowing organizers to check in users in the app",
      "RSVP and Saved events tab",
    ],
    github: undefined,
    demo: "https://apps.apple.com/us/app/explorifyy/id6739402841",
    image: "/explorify.png",
  },
  {
    id: "illinois-marketplace",
    title: "Illinois Marketplace",
    description:
      "A Facebook Marketplace-style platform exclusively for University of Illinois students with anonymous browsing and manual transaction verification.",
    longDescription:
      "A secure marketplace platform built exclusively for University of Illinois students using @illinois.edu email verification. The platform features anonymous browsing where non-authenticated users can view products with blurred seller details to maintain privacy while encouraging sign-ups.\n\nThe platform includes comprehensive safety features like content reporting, manual transaction verification for reviews, and a robust authentication system. Built with modern web technologies including React, Supabase for backend services, and deployed on GitHub Pages with comprehensive Playwright testing.",
    technologies: ["React", "Supabase", "TailwindCSS", "Vite", "Playwright"],
    features: [
      "Anonymous browsing with blurred seller contact details",
      "@illinois.edu email verification for exclusive access",
      "Manual transaction verification for authentic reviews",
      "Comprehensive product filtering and search functionality",
      "Like/save items for later viewing",
      "Content reporting and moderation system",
      "Responsive mobile-first design",
      "Comprehensive end-to-end testing with Playwright",
    ],
    github: undefined,
    demo: "https://illinoismarketplace.xyz/",
    image: "/illinoismarketplace.png",
  },
  {
    id: "spending-tracker",
    title: "Spending Tracker",
    description:
      "Simple spending tracker website, developed from scratch in 2 hours.",
    longDescription:
      "I wanted to easily track my monthly spendings but I can't find an app that allowed to manually add transactions. The only alternative is using Google Sheets / Excel or Notion, but these 2 applications are not practical to use on mobile.\n\nTherefore, I developed this website in 2 hours! Feel free to contact me at jonathanbernard265@gmail.com for any feature requests.",
    technologies: ["React", "Typescript", "TailwindCSS", "Supabase"],
    features: [
      "Pie chart breaking down spendings based on categories",
      "Monthly bar graph to visualize monthly spending trends",
      "Filter transactions by category",
      "Sort transactions by date, amount and category",
      "Easily add transactions to the database",
      "Pie chart breaking down spendings based on categories",
    ],
    github: undefined,
    demo: "https://jbw9.github.io/SpendingTracker/",
    image: "/spendingtracker.png",
  },
  {
    id: "GoBites",
    title: "GoBites",
    description:
      "A simple IOS app that allows people to quickly track and navigate to food trucks around the UIUC campus.",
    longDescription:
      "I found it hard to find food trucks around campus, as nobody really knows their schedule and where they will park. \n\nTherefore, I took a weekend to develop this app, allowing users to easily locate food trucks around the UIUC campus using the app's built in map. Users can also search for their favorite food trucks and navigate to it using Google / Apple maps.\n\nFor food truck drivers, this will help them gain more customers. I also added features to make this app easier to use such as customizable sessions to indicate how long will they be in their current position and notes to make it even easier for users to locate them.",
    technologies: ["React Native", "Supabase", "Nativewind"],
    features: [
      "Use the built in map to locate food trucks",
      "Search your favorite food trucks",
      "Check walking time to food truck",
      "One tap navigation",
      "Customizable sessions for food truck owners",
      "Adding notes if food truck is still hard to locate",
    ],
    github: undefined,
    demo: "https://apps.apple.com/au/app/gobites/id6596764965",
    image: "/gobites.png",
  },
  {
    id: "akar",
    title: "akar.study",
    description:
      "An open-source flashcard platform utilizing spaced repetition to optimize learning, integrated a Pomodoro timer to boost productivity,",
    longDescription:
      "I'm a fan of using flashcards to study, however the current best flashcard platform is Anki. Although Anki is a great platform, it has a outdated UI/UX making it quite difficult to use especially for the non technical people.\n\nTherefore, I developed akar which has better UI/UX and an integrated Pomodoro timer to further improve user's productivity,",
    technologies: ["React", "Typescript", "TailwindCSS", "Supabase"],
    features: [
      "Built in Pomodoro timer to enhance productivity",
      "Statistics dashboard to track learning progress",
      "Utilizes spaced repetition algorithm",
    ],
    github: undefined,
    demo: "https://akar.study/",
    image: "/akar.png",
  },
];
