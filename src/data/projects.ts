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
  videoUrl?: string;
  dmgUrl?: string;
}

export const projects = [
  {
    id: "idx-trading-optimizer",
    title: "Automated IDX Trading",
    description:
      "Autonomous parameter optimization system for Indonesian stock market (IDX) focused on end-of-day broker flow and accumulation analysis.",
    longDescription:
      "An intelligent trading strategy optimizer that follows the big players in the Indonesian stock market. The system autonomously collects historical EOD (End-of-Day) accumulation and broker flow data, optimizes strategy parameters using grid search on historical data, and applies the best-performing parameters to maximize returns.\n\nThe core strategy detects when large brokers accumulate stocks, indicating institutional buying. It analyzes key metrics including Big Player Net Value (total net buying from top N brokers), Concentration (percentage of total value from top brokers indicating conviction level), and daily liquidity requirements.\n\nThe optimizer uses grid search to test thousands of parameter combinations, simulating trades for each combination and calculating metrics like win rate, Sharpe ratio, and P&L to identify the optimal parameters for the current market conditions.",
    technologies: ["Python", "SQLite", "Click", "YAML"],
    features: [
      "Follow-the-big-players strategy detecting institutional accumulation",
      "Grid search optimization testing ~1,000 parameter combinations",
      "Sharpe ratio-based parameter selection for risk-adjusted returns",
      "Automated data collection with 12,500+ historical signal data points",
      "Smart position management with configurable stop-loss and take-profit",
      "Out-of-sample validation to prevent overfitting",
    ],
    github: undefined,
    demo: "https://indo-stonks-trading.s3.ap-southeast-1.amazonaws.com/signals.html",
    image: "/stonks.png",
    howItWorks: `

### Strategy Core: Follow the Big Players

The algorithm detects when large institutional brokers accumulate stocks, indicating smart money buying. It tracks three key metrics:

**1. Big Player Net Value**
- Total net buying from top N brokers (e.g., top 3 brokers)
- Threshold filters for significant institutional interest
- Example: ≥1B IDR indicates serious accumulation

**2. Concentration Percentage**
- % of total daily value from top brokers
- Higher concentration = stronger conviction
- Example: 50% concentration means top 3 brokers account for half of all buying

**3. Daily Liquidity**
- Minimum daily trading value requirement
- Ensures sufficient market depth for position entry/exit
- Prevents illiquid stocks with unreliable signals

## Algorithm Architecture

### Phase 1: Data Collection
1. Fetch historical EOD broker flow data via Invezgo API
2. Collect 12+ months of data (~12,500 signals)
3. Store in SQLite database with indexed timestamps
4. Track API budget (30,000 call allocation)

### Phase 2: Grid Search Optimization
For each parameter combination:
1. **Define Parameter Space**:
   - \`big_player_threshold\`: [500M, 750M, 1B, 1.5B IDR]
   - \`min_concentration\`: [0.35, 0.40, 0.45, 0.50, 0.55]
   - \`stop_loss_pct\`: [0.03, 0.05, 0.07]
   - \`take_profit_pct\`: [0.08, 0.10, 0.12, 0.15]
   - \`max_hold_days\`: [2, 3, 5, 7]

2. **Simulate Trades**:
   - For each historical signal matching parameters
   - Enter position at next day's open
   - Track P&L until stop-loss, take-profit, or max hold days
   - Record win rate, avg return, Sharpe ratio

3. **Calculate Metrics**:
   - Win Rate: % of profitable trades
   - Average P&L: Mean return per trade
   - Sharpe Ratio: Risk-adjusted returns (return / volatility)

### Phase 3: Parameter Selection
1. Rank all combinations by Sharpe ratio (risk-adjusted performance)
2. Validate best parameters on out-of-sample period
3. Ensure sufficient signal count (avoid overfitting to rare events)
4. Select final parameters maximizing Sharpe with >30 signals

### Phase 4: Daily Execution
1. **EOD Scan**: Run daily after market close
2. **Filter Stocks**: Apply optimized parameters to today's broker data
3. **Generate Signals**: Output stocks meeting all criteria
4. **Position Management**:
   - Enter at tomorrow's open
   - Set stop-loss and take-profit levels
   - Exit after max hold days or when targets hit

## Optimization Example

Before optimization:
\`\`\`
Params: threshold=1B, concentration=0.50, stop_loss=5%, take_profit=10%
Signals: 45 | Win Rate: 62.2% | Avg P&L: +4.1% | Sharpe: 1.42
\`\`\`

After grid search (testing 945 combinations):
\`\`\`
Params: threshold=750M, concentration=0.45, stop_loss=5%, take_profit=12%
Signals: 187 | Win Rate: 67.4% | Avg P&L: +5.8% | Sharpe: 2.34
\`\`\`

**Improvement**: +316% more signals, +5.2pp win rate, +41% avg P&L, +65% Sharpe ratio

## Time & Space Complexity

- **Data Collection**: O(n × m) where n = days, m = stocks per day
- **Grid Search**: O(p × s) where p = parameter combinations (~1,000), s = signals (~12,500)
- **Daily Scan**: O(m) where m = stocks scanned (~50)
- **Space Complexity**: O(n × m) for historical database storage

## Key Implementation Details

### Risk Management
- **Stop-Loss**: Auto-exit at 3-7% loss to limit downside
- **Take-Profit**: Lock in gains at 8-15% profit
- **Max Hold**: Force exit after 2-7 days to avoid dead capital

### Validation Strategy
- **Training Period**: 60% of historical data for optimization
- **Validation Period**: 20% for parameter validation
- **Test Period**: 20% held out for final performance check
- **Walk-Forward**: Reoptimize monthly as market regime changes

### Performance Metrics
- **Sharpe Ratio**: Primary optimization target (balances return vs risk)
- **Win Rate**: Secondary check (prefer >60%)
- **Signal Count**: Ensure sufficient opportunities (>30 signals)
- **Max Drawdown**: Monitor largest peak-to-trough decline`,
  },
  {
    id: "habit-reminder",
    title: "HabitReminder",
    description:
      "A macOS menu bar app that detects mouth breathing in real-time using computer vision, alerting you to breathe through your nose after ~5 seconds.",
    longDescription:
      "HabitReminder is a passive health monitor that runs silently in the macOS menu bar. It uses your webcam and MediaPipe's 468-point face landmarker model to compute the Mouth Aspect Ratio (MAR) on every frame. When your mouth has been open for ~5 seconds, it fires a macOS system notification and an audio cue to remind you to breathe through your nose.\n\nThe app features a live 320×180 camera preview embedded directly in the menu bar dropdown, complete with face landmark overlays, an OPEN/CLOSED status label, a countdown bar, and a \"CLOSE YOUR MOUTH\" alert banner. The menu bar icon updates in real-time: HR (idle), a 5/4/3/2/1 countdown (warning), and !!! when an alert fires.\n\nBuilding this required solving several macOS-specific engineering challenges: a camera permission race condition with AVFoundation's TCC system, keeping NSTimers alive while the menu is open, and re-applying the hardened runtime code signature after PyInstaller strips it during the app bundle step.",
    technologies: [
      "Python",
      "MediaPipe",
      "OpenCV",
      "NumPy",
      "rumps",
      "PyObjC",
      "PyInstaller",
    ],
    features: [
      "Mouth Aspect Ratio (MAR) detection via MediaPipe 468-point face landmarks",
      "Live 320×180 camera preview embedded in the menu bar dropdown",
      "Visual overlays: face landmarks, OPEN/CLOSED status, countdown bar, alert banner",
      "Menu bar icon updates in real-time (idle → countdown → alert)",
      "macOS system notifications via osascript + Sosumi/Glass audio cues",
      "60-second cooldown between alerts to prevent notification fatigue",
      "Toggle detection on/off from the menu without quitting",
      "Distributed as a signed .dmg for end-user installation",
    ],
    github: "https://github.com/jbw9/HabitReminder",
    demo: undefined,
    videoUrl: "/ht_demo.mp4",
    dmgUrl: "https://drive.google.com/uc?export=download&id=1sOWpxBZVLRALjHhmPOwoJvWf_edi7Mzz",
    howItWorks: `
### Mouth Aspect Ratio (MAR)

The core detection algorithm computes the **Mouth Aspect Ratio** from MediaPipe's 468 facial landmarks. MAR measures the vertical opening of the mouth relative to its horizontal width:

\`\`\`
MAR = (‖p2 - p8‖ + ‖p3 - p7‖ + ‖p4 - p6‖) / (2 × ‖p1 - p5‖)
\`\`\`

Where p1–p8 are key mouth landmark coordinates. A MAR above the configured threshold for ~5 consecutive seconds triggers an alert.

## Architecture

\`\`\`
main.py
  └── HealthMonitorApp (menu_bar_app.py)
        ├── CameraThread         — 30fps capture loop (background thread)
        ├── DetectorManager      — MediaPipe init, routes frames to detectors
        │     └── MouthBreathingDetector  — MAR algorithm
        ├── AlertSystem          — notifications + audio, 60s cooldown
        └── PreviewWindow        — draws OpenCV overlays, converts to NSImage
\`\`\`

### Threading Model

Two threads work in parallel:
- **Camera thread** — captures frames at 30fps, runs MAR detection, queues alerts
- **Main thread** — two NSTimers: 15Hz preview refresh, 0.5Hz alert processing

### Data Flow

\`\`\`
Camera → BGR frame → RGB convert → MediaPipe (468 landmarks)
  → MAR calculation → alert queue → macOS notification + sound
                    → overlay drawing → JPEG → NSImage → menu bar preview
\`\`\`

## Key Engineering Challenges

### 1. Camera Permission Race Condition
macOS TCC doesn't authorize OpenCV's AVFoundation session fast enough on first launch. Fixed by explicitly calling \`AVCaptureDevice.requestAccessForMediaType_completionHandler_\` via PyObjC before opening the capture session, then auto-restarting the camera thread after a 1.5s delay.

### 2. NSTimer Pausing During Menu Open
Standard rumps timers are scheduled in the default run loop mode and pause when the menu is open, freezing the live preview. Fixed by scheduling NSTimers in \`NSRunLoopCommonModes\` so they fire regardless of UI state.

### 3. PyInstaller + Hardened Runtime
PyInstaller's BUNDLE step strips the hardened runtime flag, which is required for camera access on macOS 12+. Fixed with a post-build \`codesign --options runtime\` pass using a custom \`entitlements.plist\` that grants the camera usage entitlement.

### 4. Alert Spam Prevention
Two mechanisms prevent alert fatigue:
- An \`alert_triggered\` boolean suppresses re-alerting within the same continuous open-mouth event
- A 60-second cooldown timer between separate events prevents notification overload`,
  },
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
    github: "https://github.com/jbw9/MovieRecommendation",
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
