export interface Experience {
  title: string;
  company: string;
  companyIcon: string;
  period: string;
  description: string;
  website?: string;
  technologies: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  features: string[];
  github: string;
  demo: string;
  image: string;
}

export interface Guide {
  id: string;
  title: string;
  description: string;
  category: string;
  publishDate: string;
  content: string;
}

export interface Education {
  degree: string;
  school: string;
  image: string;
  period: string;
  gpa?: string;
  description?: string;
  relevantCourses?: string[];
}

export interface Involvement {
  role: string;
  organization: string;
  period: string;
  description: string;
  image: string;
}

export const experiences = [
  {
    title: "Software Engineer Intern",
    company: "Kredivo Group",
    companyIcon:
      "https://media.licdn.com/dms/image/v2/D560BAQEcTpBN5xjLQQ/company-logo_200_200/company-logo_200_200/0/1693461125877/kredivo_group_logo?e=1754524800&v=beta&t=KuobEwkUY_KV9dnjITlcVJMRwO1KZIgUOP9vniH6NXo",
    period: "Summer 2025",
    description:
      "Developing an MCP server, and integrating it with the company's LLM and customer support system",
    technologies: ["Python", "Ollama", "Flask", "MCP"],
  },
  {
    title: "Co-Founder & CTO",
    company: "Tulip",
    companyIcon:
      "https://media.licdn.com/dms/image/v2/D560BAQGwgNKT8En_Fw/company-logo_200_200/company-logo_200_200/0/1729296904460/tulipestate_logo?e=1754524800&v=beta&t=aS4WoWT6VvmIVhbPysGi5ZSbaZd9AQLlt2F_8HXRki0",
    period: "Jan 2024 - May 2025",
    description:
      "Led development of Tulip's mobile app, beta website and Automated Market Maker (AMM) algorithm.",
    website: "https://www.tulip.markets/",
    technologies: ["Python", "AWS", "React Native", "React", "Flask"],
  },
  {
    title: "Founder in Residence (iV10)",
    company: "Iventure Accelerator",
    companyIcon:
      "https://media.licdn.com/dms/image/v2/C4D0BAQGxjXbhDRFjRw/company-logo_100_100/company-logo_100_100/0/1663165310322/iventureaccelerator_logo?e=1754524800&v=beta&t=XmqJmtwGRMC7MhOVqEs5CU4YMfN_GjhcWs_U66cMCoc",
    period: "Jan 2024 - May 2025",
    description: "Building Tulip",
    technologies: [],
  },
  {
    title: "Software Engineer Intern",
    company: "We Hear You, Inc",
    companyIcon:
      "https://media.licdn.com/dms/image/v2/D560BAQFvP6vMuT95LA/company-logo_200_200/company-logo_200_200/0/1726942046647?e=1754524800&v=beta&t=eyNEd3jiRfir4MXf2vf6KMY6YUCrgkovsWswWWXHSLw",
    period: "Summer 2024",
    description:
      "Developed a real time American Sign Language to English Android application. Optimized translation system through machine learning.",
    technologies: ["Python", "TensorFlow", "Android Studio"],
  },
];

export const projects = [
  {
    id: "explorify",
    title: "explorify",
    description:
      "A full-stack IOS app that simplifies the process of finding events around the UIUC campus. With a built in RSVP feature, allowing users to RSVP in less than 3 seconds",
    longDescription:
      "This comprehensive task management application was built to address the need for efficient team collaboration. The application features real-time updates using Socket.io, allowing team members to see changes instantly. Users can create projects, assign tasks with due dates, set priorities, and track progress through various stages. The application includes user authentication, role-based permissions, and a responsive design that works seamlessly across desktop and mobile devices.",
    technologies: ["React Native", "Supabase", "Nativewind"],
    features: [
      "Explore events posted by 1800+ organizations across UIUC",
      "RSVP for events in under 3 seconds (no third party forms are required anymore)",
      "Let organizers know your dietary restrictions, contact and party size",
    ],
    github: "#",
    demo: "https://apps.apple.com/us/app/explorifyy/id6739402841",
    image: "/placeholder.svg",
  },
];

export const guides = [
  {
    id: "scalable-react-apps",
    title: "Building Scalable React Applications",
    description:
      "A comprehensive guide on structuring large React applications with best practices for state management, component organization, and performance optimization.",
    category: "React",
    publishDate: "Nov 2024",
    content: `# Building Scalable React Applications
  
  In this comprehensive guide, we'll explore the best practices for structuring large React applications. As your application grows, maintaining clean architecture becomes crucial for long-term success.
  
  ## Table of Contents
  1. Project Structure
  2. State Management
  3. Component Organization
  4. Performance Optimization
  5. Testing Strategies
  
  ## Project Structure
  
  A well-organized project structure is the foundation of any scalable React application. Here's a recommended structure:
  
  \`\`\`
  src/
  ├── components/
  │   ├── common/
  │   ├── layout/
  │   └── ui/
  ├── pages/
  ├── hooks/
  ├── services/
  ├── utils/
  └── types/
  \`\`\`
  
  ## State Management
  
  Choosing the right state management solution depends on your application's complexity:
  
  - **Local State**: Use React's built-in \`useState\` and \`useReducer\`
  - **Global State**: Consider Redux Toolkit, Zustand, or Context API
  - **Server State**: React Query or SWR for data fetching
  
  ## Component Organization
  
  Follow these principles for better component organization:
  
  1. **Single Responsibility**: Each component should have one clear purpose
  2. **Composition over Inheritance**: Use composition patterns
  3. **Prop Drilling**: Avoid deep prop drilling with Context or state management
  
  ## Performance Optimization
  
  Key strategies for optimizing React applications:
  
  - Use React.memo for expensive components
  - Implement code splitting with React.lazy
  - Optimize bundle size with tree shaking
  - Use useCallback and useMemo appropriately
  
  ## Testing Strategies
  
  A comprehensive testing approach includes:
  
  - Unit tests for individual components
  - Integration tests for component interactions
  - End-to-end tests for critical user flows
  
  ## Conclusion
  
  Building scalable React applications requires careful planning and adherence to best practices. By following these guidelines, you'll create maintainable and performant applications that can grow with your needs.`,
  },
  {
    id: "ml-python-intro",
    title: "Introduction to Machine Learning with Python",
    description:
      "Learn the fundamentals of machine learning using Python, covering algorithms, data preprocessing, and model evaluation techniques.",
    category: "Machine Learning",
    publishDate: "Oct 2024",
    content: `# Introduction to Machine Learning with Python
  
  Machine learning has become one of the most powerful tools in data science. This guide will introduce you to the fundamentals using Python.
  
  ## What is Machine Learning?
  
  Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.
  
  ## Types of Machine Learning
  
  ### 1. Supervised Learning
  - **Classification**: Predicting categories or classes
  - **Regression**: Predicting continuous values
  
  ### 2. Unsupervised Learning
  - **Clustering**: Grouping similar data points
  - **Dimensionality Reduction**: Reducing feature space
  
  ### 3. Reinforcement Learning
  - Learning through rewards and penalties
  
  ## Essential Python Libraries
  
  \`\`\`python
  import pandas as pd           # Data manipulation
  import numpy as np            # Numerical computing
  import matplotlib.pyplot as plt  # Visualization
  import seaborn as sns         # Statistical visualization
  from sklearn import datasets, model_selection, metrics
  \`\`\`
  
  ## Data Preprocessing
  
  Data preprocessing is crucial for successful machine learning:
  
  \`\`\`python
  # Load data
  data = pd.read_csv('dataset.csv')
  
  # Handle missing values
  data.fillna(data.mean(), inplace=True)
  
  # Feature scaling
  from sklearn.preprocessing import StandardScaler
  scaler = StandardScaler()
  X_scaled = scaler.fit_transform(X)
  \`\`\`
  
  ## Building Your First Model
  
  Let's create a simple classification model:
  
  \`\`\`python
  from sklearn.model_selection import train_test_split
  from sklearn.linear_model import LogisticRegression
  from sklearn.metrics import accuracy_score
  
  # Split data
  X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
  
  # Train model
  model = LogisticRegression()
  model.fit(X_train, y_train)
  
  # Make predictions
  y_pred = model.predict(X_test)
  
  # Evaluate
  accuracy = accuracy_score(y_test, y_pred)
  print(f"Accuracy: {accuracy:.2f}")
  \`\`\`
  
  ## Model Evaluation
  
  Key metrics for evaluating models:
  
  - **Accuracy**: Correct predictions / Total predictions
  - **Precision**: True positives / (True positives + False positives)
  - **Recall**: True positives / (True positives + False negatives)
  - **F1-Score**: Harmonic mean of precision and recall
  
  ## Next Steps
  
  To advance your machine learning journey:
  
  1. Practice with real datasets
  2. Learn advanced algorithms
  3. Explore deep learning frameworks
  4. Work on end-to-end projects
  
  Machine learning is a vast field with endless possibilities. Start with these fundamentals and gradually build your expertise!`,
  },
  {
    id: "database-design",
    title: "Database Design Principles",
    description:
      "Essential database design concepts including normalization, indexing, and query optimization for better application performance.",
    category: "Database",
    publishDate: "Sep 2024",
    content: `# Database Design Principles
  
  Effective database design is crucial for building scalable and efficient applications. This guide covers the fundamental principles every developer should know.
  
  ## Core Design Principles
  
  ### 1. Data Integrity
  Ensure data accuracy and consistency through:
  - Primary keys for unique identification
  - Foreign keys for referential integrity
  - Constraints for data validation
  
  ### 2. Normalization
  Organize data to reduce redundancy:
  
  **First Normal Form (1NF)**
  - Eliminate repeating groups
  - Each cell contains atomic values
  
  **Second Normal Form (2NF)**
  - Meet 1NF requirements
  - Remove partial dependencies
  
  **Third Normal Form (3NF)**
  - Meet 2NF requirements
  - Remove transitive dependencies
  
  ## Entity Relationship Design
  
  ### Identifying Entities
  - **Strong Entities**: Independent existence
  - **Weak Entities**: Dependent on other entities
  
  ### Relationship Types
  - **One-to-One**: Single record relates to single record
  - **One-to-Many**: Single record relates to multiple records
  - **Many-to-Many**: Multiple records relate to multiple records
  
  ## Indexing Strategies
  
  Indexes improve query performance:
  
  \`\`\`sql
  -- Create index on frequently queried column
  CREATE INDEX idx_user_email ON users(email);
  
  -- Composite index for multi-column queries
  CREATE INDEX idx_order_date_status ON orders(order_date, status);
  \`\`\`
  
  ### Index Types
  - **Clustered**: Physical order of data
  - **Non-clustered**: Logical order separate from physical
  - **Unique**: Ensures uniqueness
  - **Partial**: Index with WHERE condition
  
  ## Query Optimization
  
  ### Best Practices
  1. **Use appropriate WHERE clauses**
  2. **Limit result sets with LIMIT/TOP**
  3. **Avoid SELECT *** in production
  4. **Use JOINs instead of subqueries when possible**
  
  ### Example Optimization
  \`\`\`sql
  -- Inefficient
  SELECT * FROM users WHERE UPPER(name) = 'JOHN';
  
  -- Efficient
  SELECT id, name, email FROM users WHERE name = 'John';
  CREATE INDEX idx_users_name ON users(name);
  \`\`\`
  
  ## Performance Considerations
  
  ### Connection Pooling
  - Reuse database connections
  - Configure appropriate pool sizes
  - Monitor connection usage
  
  ### Caching Strategies
  - **Query Result Caching**: Cache frequent query results
  - **Application-Level Caching**: Redis, Memcached
  - **Database-Level Caching**: Built-in query caches
  
  ## Security Best Practices
  
  ### Access Control
  - Principle of least privilege
  - Role-based access control
  - Regular security audits
  
  ### SQL Injection Prevention
  \`\`\`sql
  -- Vulnerable
  SELECT * FROM users WHERE id = ' + userId + ';
  
  -- Secure (parameterized query)
  SELECT * FROM users WHERE id = ?;
  \`\`\`
  
  ## Backup and Recovery
  
  ### Backup Strategies
  - **Full Backups**: Complete database copy
  - **Incremental Backups**: Changes since last backup
  - **Transaction Log Backups**: For point-in-time recovery
  
  ### Recovery Planning
  - Define Recovery Point Objective (RPO)
  - Define Recovery Time Objective (RTO)
  - Regular recovery testing
  
  ## Conclusion
  
  Good database design is an investment in your application's future. By following these principles, you'll create databases that are efficient, maintainable, and scalable.
  
  Remember: Database design is both an art and a science. Start with solid principles and refine based on your specific requirements and performance metrics.`,
  },
];

export const education = [
  {
    degree: "Bachelor of Science in Computer Science",
    school: "University of Illinois at Urbana - Champaign",
    image:
      "https://media.licdn.com/dms/image/v2/C4E0BAQGFFDl_Z9pIAA/company-logo_100_100/company-logo_100_100/0/1630611684443/university_of_illinois_at_urbana_champaign_logo?e=1754524800&v=beta&t=yXHWVm7AICqQokMi7Aj7XGmgzURFf3ltojHzoaq3EnQ",
    period: "2022 - 2026",
    gpa: "3.87/4.0",
    relevantCourses: [
      "Data Structures & Algorithms",
      "Database Systems",
      "Data Mining",
      "Discrete Math",
    ],
  },
  {
    degree: "YC AI Startup School",
    school: "Y Combinator",
    period: "2025",
    image:
      "https://media.licdn.com/dms/image/v2/C4D0BAQGPzdBPNxrmEg/company-logo_100_100/company-logo_100_100/0/1673555093250/y_combinator_logo?e=1754524800&v=beta&t=Zaeq6nS7bCLmXIoIScDFQ_CS78JmcrLyTM9l-d6w_Ro",
    description:
      "One of 2000 undergrad and grad students selected for the first ever YC AI Startup School. Link - https://events.ycombinator.com/ai-sus",
  },
];

export const involvements = [
  {
    role: "Consultant",
    organization: "OTCR Consulting",
    period: "Aug 2023 - June 2024",
    description:
      "The university's premier consulting organization with a 5% acceptance rate. Led an engagement with a startup to develop and evaluate expansion strategies, resulting in a validated go-to-market plan.",
    image:
      "https://media.licdn.com/dms/image/v2/C4E0BAQEjAlC8LwihOQ/company-logo_100_100/company-logo_100_100/0/1631348661882?e=1754524800&v=beta&t=jHh41QTnM_D_uw0HHgi_rc9thn5iFlrp8OyyL8pS5Ks",
  },
  {
    role: "Technology & Fundraising Officer",
    organization: "Permias UIUC",
    period: "Aug 2023 - May 2025",
    description:
      "Led development of the official https://permiasuiuc.org/ website. Built with React, Typescript, and Tailwind CSS.",
    image:
      "https://media.licdn.com/dms/image/v2/C510BAQGHwSXiJ6nXjA/company-logo_100_100/company-logo_100_100/0/1631353110459?e=1754524800&v=beta&t=Sc0tsniMiGKbag6fxN3tFmekQEJoWCZ6BVpVkuZqBV4",
  },
  {
    role: "CS128 Course Assistant",
    organization: "Siebel School of Computing and Data Science",
    period: "Jan 2025 - Present",
    description:
      "Assisting students with course material through hosting office hours and answering forum questions.",
    image:
      "https://media.licdn.com/dms/image/v2/D4D0BAQHnn2vmCGlTeg/company-logo_100_100/B4DZYQ355YHsAg-/0/1744039813085/illinoiscds_logo?e=1754524800&v=beta&t=7kKDSDh2F7Gk23eGryH1AT8UB9M9l4gK8_9T82rKcQY",
  },
];
