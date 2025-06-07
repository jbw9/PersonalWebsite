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
