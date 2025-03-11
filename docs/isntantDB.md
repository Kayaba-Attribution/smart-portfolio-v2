# InstantDB Integration with Next.js: A Practical Guide

This tutorial walks you through integrating InstantDB with a Next.js application, based on real-world lessons and best practices from the TaskWise project.

## 1. Initial Setup

### Installation

```bash
# Install core package
npm install @instantdb/react

# Required peer dependencies 
npm install @tanstack/react-query
```

### Environment Configuration

Create a `.env.local` file:

```env
# Required for InstantDB connection
NEXT_PUBLIC_INSTANT_APP_ID=your-instant-app-id

# Required for Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## 2. Schema Definition

Create `instant.schema.ts` at your project root:

```typescript
import { i } from '@instantdb/react';

// Define your schema - this is the core data model
export const schema = i.schema({
  entities: {
    // User entity (built-in, don't modify the entity name)
    $users: i.entity({
      email: i.string().unique().indexed(),
      // Note: InstantDB manages auth fields, don't add password/token fields
    }),
    
    // Project entity (custom defined)
    projects: i.entity({
      title: i.string(), // Required field
      description: i.string(), // Required field
      priority: i.string(), // String is more flexible than enum for future expansion
      dueDate: i.string().optional(), // Optional field with .optional()
      tags: i.json().optional(), // Array will be stored as JSON
      createdAt: i.number().indexed(), // Index fields you'll sort/filter by
      userId: i.string().indexed(), // Foreign key reference (manual)
    }),
    
    // Task entity (custom defined)
    tasks: i.entity({
      title: i.string(),
      description: i.string().optional(),
      priority: i.string(),
      status: i.string(),
      projectId: i.string().indexed(), // For filtering tasks by project
      userId: i.string().indexed(), // For user ownership queries
      estimatedTime: i.number().optional(),
      timeSpent: i.number().optional(),
      isComplete: i.boolean(), 
      createdAt: i.number().indexed(), // For sorting
      order: i.number(), // For manual reordering
      dependencyIds: i.json().optional(), // Array of task IDs as JSON
      notes: i.string().optional(),
      subtasks: i.json().optional(), // Complex nested data as JSON
    }),
  },
  
  // Define relationships between entities (critical for proper querying)
  links: {
    // Project ownership relationship
    projectOwner: {
      forward: { on: 'projects', has: 'one', label: 'owner' }, // Each project has one owner
      reverse: { on: '$users', has: 'many', label: 'projects' }, // Each user has many projects
    },
    // Project-Tasks relationship
    projectTasks: {
      forward: { on: 'tasks', has: 'many', label: 'project' }, // Each task belongs to one project
      reverse: { on: 'projects', has: 'many', label: 'tasks' }, // Each project has many tasks
    },
    // Task ownership relationship
    taskOwner: {
      forward: { on: 'tasks', has: 'one', label: 'owner' }, // Each task has one owner
      reverse: { on: '$users', has: 'many', label: 'tasks' }, // Each user has many tasks
    },
  },
});

// Export type for type checking
export type InstantSchema = typeof schema;
```

### Key Schema Design Principles

1. **Avoid defaults in schema** - Define defaults in your code instead (InstantDB doesn't handle defaults well)
2. **Use simple types** - Stick to string, number, boolean, json (avoid complex types)
3. **Index fields for filtering** - Use `.indexed()` for fields you'll query by (improves performance)
4. **Use optional for nullable fields** - Add `.optional()` for non-required fields (prevents validation errors)
5. **Use json for arrays/objects** - Complex data should use `i.json()` (required for nested structures)

## 3. Database Connection

Create `lib/db.ts`:

```typescript
import { init } from '@instantdb/react';
import { schema } from '../instant.schema'; // Adjust path as needed

// Export the schema type for TypeScript
export type AppSchema = typeof schema;

// Get app ID from environment variables
const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;

// Validate environment is properly set up
if (!appId) {
  throw new Error("NEXT_PUBLIC_INSTANT_APP_ID is not defined in environment variables");
}

// Initialize InstantDB with the schema
// This creates a connection singleton that should be imported where needed
export const db = init<AppSchema>({
  appId,
  schema,
  // Add any other options here (like logging)
});

// Export tx and id for convenience
export { tx, id } from '@instantdb/react';
```

## 4. Authentication Setup

### Auth Provider in `app/layout.tsx`

```typescript
'use client';

import { ReactNode } from 'react';
import { db } from '@/lib/db';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/components/AuthProvider';

// Required for Google OAuth integration
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Error if environment variable missing
if (!GOOGLE_CLIENT_ID) {
  throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined");
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Google OAuth provider must wrap the auth component */}
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
```

### Auth Provider Component

```typescript
// components/AuthProvider.tsx
'use client';

import { useEffect, useState, ReactNode } from 'react';
import { db } from '@/lib/db';
import LoginPage from '@/app/login/page';

export function AuthProvider({ children }: { children: ReactNode }) {
  // Track when auth state is initialized
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // Get auth state from InstantDB
  const { isLoading, user, error } = db.useAuth();

  // Wait for auth to initialize
  useEffect(() => {
    if (!isLoading) {
      setIsAuthReady(true);
    }
  }, [isLoading]);

  // Show loading state while auth initializes
  if (!isAuthReady) {
    return <div>Initializing...</div>;
  }

  // Conditional rendering based on auth state
  return user ? children : <LoginPage />;
}
```

### Login Page

```typescript
// app/login/page.tsx
'use client';

import { useState } from 'react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button'; // Use your UI library

export default function LoginPage() {
  // Create nonce for OAuth security
  const [nonce] = useState(crypto.randomUUID());

  // Redirect to Google OAuth flow
  const handleGoogleLogin = () => {
    const url = db.auth.createAuthorizationURL({
      clientName: 'google', // Must match the client name in InstantDB dashboard
      redirectURL: window.location.href, // Return to current page after auth
    });
    window.location.href = url; // Redirect to OAuth flow
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Welcome</h1>
        <Button onClick={handleGoogleLogin}>Sign in with Google</Button>
      </div>
    </div>
  );
}
```

### Logout Functionality

```typescript
// Implement this in a navbar or user menu component
const handleLogout = async () => {
  try {
    // Call InstantDB signOut method
    await db.auth.signOut();
    
    // Provide user feedback
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
  } catch (err) {
    // Error handling is critical
    console.error("Logout error:", err);
    toast({
      title: "Error",
      description: "Failed to logout",
      variant: "destructive",
    });
  }
};
```

## 5. Data Querying

### Basic Query Pattern

```typescript
'use client';

import { db } from '@/lib/db';

export default function ProjectsList() {
  // Always get current user from auth
  const { user } = db.useAuth();
  
  // Query data conditionally based on user
  const { data, isLoading, error } = db.useQuery(
    // Only query if user exists
    user ? {
      // Start with users entity (hierarchical query)
      $users: {
        $: { where: { id: user.id } }, // Filter to current user
        projects: {}, // Get all projects for the user (empty means all fields)
      },
    } : null // Null means no query if no user
  );
  
  // Handle loading state
  if (isLoading) return <div>Loading...</div>;
  
  // Handle error state
  if (error) return <div>Error: {error.message}</div>;
  
  // Access data safely with optional chaining
  const projects = data?.$users?.[0]?.projects || [];
  
  return (
    <div>
      <h1>My Projects</h1>
      <ul>
        {projects.map(project => (
          <li key={project.id}>{project.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Filtered Query with Ordering

```typescript
// Use this pattern for more specific queries
const { data } = db.useQuery(
  // Only run query if both user and projectId exist
  user && projectId ? {
    $users: {
      $: { where: { id: user.id } }, // Filter by user ID
      projects: {
        $: { where: { id: projectId } }, // Filter to specific project
        tasks: {
          $: { order: { createdAt: "desc" } }, // Order tasks by creation date
        },
      },
    },
  } : null // Important: use null for conditional queries
);

// Access the data safely
const project = data?.$users?.[0]?.projects?.[0];
const tasks = project?.tasks || [];
```

## 6. Transactions

### Create Record

```typescript
// Import tx and id helpers
import { tx, id } from '@instantdb/react';
// Or import from your db file if you re-exported them
// import { db, tx, id } from '@/lib/db';

const handleCreateProject = async () => {
  try {
    // Validate inputs first
    if (!title.trim() || !user) {
      toast({ title: "Error", description: "Title required" });
      return;
    }

    // Generate UUID for new entity
    const projectId = id();

    // Execute transaction with multiple operations
    await db.transact([
      // Create project with update operation
      tx.projects[projectId].update({
        title,
        description,
        priority,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        createdAt: Date.now(), // Use current timestamp
        userId: user.id, // Store user reference
      }),
      // Create ownership relationship with link operation
      tx.projects[projectId].link({ owner: user.id }),
    ]);

    // Provide user feedback
    toast({ title: "Success", description: "Project created" });
  } catch (err) {
    // Always handle errors
    console.error("Creation error:", err);
    toast({ title: "Error", description: "Failed to create" });
  }
};
```

### Update Record

```typescript
const handleToggleTaskComplete = async (taskId) => {
  try {
    // Find the task by ID
    const task = tasks.find(t => t.id === taskId);
    if (!task) return; // Exit if not found

    // Execute transaction
    await db.transact([
      // Update a single field (toggle boolean)
      tx.tasks[taskId].update({
        isComplete: !task.isComplete,
      }),
    ]);

    // Provide user feedback
    toast({ title: "Success", description: "Task updated" });
  } catch (err) {
    // Handle errors
    console.error("Update error:", err);
    toast({ title: "Error", description: "Update failed" });
  }
};
```

### Delete Record

```typescript
const handleDeleteTask = async (taskId) => {
  try {
    // Simple delete transaction
    await db.transact([
      // Delete the entity by ID
      tx.tasks[taskId].delete()
    ]);

    // Provide user feedback
    toast({ title: "Success", description: "Task deleted" });
  } catch (err) {
    // Handle errors
    console.error("Deletion error:", err);
    toast({ title: "Error", description: "Deletion failed" });
  }
};
```

## 7. Advanced Patterns

### Debounced Updates

```typescript
import { useRef, useCallback, useEffect } from 'react';

// This pattern is essential for text inputs or other frequent updates
const debounceTimeout = useRef(null);

const handleUpdateNotes = useCallback((notes) => {
  // Clear any previous timeout
  if (debounceTimeout.current) {
    clearTimeout(debounceTimeout.current);
  }

  // Update local state immediately for responsive UI
  setLocalNotes(notes);
  
  // Delay database update until typing pause
  debounceTimeout.current = setTimeout(async () => {
    try {
      // Update database after debounce period
      await db.transact([
        tx.tasks[taskId].update({ notes }),
      ]);
    } catch (err) {
      console.error("Update error:", err);
      // Optionally revert local state on error
    }
  }, 500); // 500ms debounce period
}, [taskId]); // Include dependencies

// Critical: Clean up on unmount
useEffect(() => {
  return () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
  };
}, []);
```

### Complex Nested Data

```typescript
// Add a subtask to a task - example of nested data
const handleAddSubtask = async (taskId, subtaskTitle) => {
  try {
    // Find current task
    const task = tasks.find(t => t.id === taskId);
    
    // Create new subtask object with ID
    const newSubtask = {
      id: id(), // Generate UUID for subtask
      title: subtaskTitle,
      isComplete: false,
    };
    
    // Create updated subtasks array with new item
    const updatedSubtasks = [...(task?.subtasks || []), newSubtask];

    // Update the task with new subtasks array
    await db.transact([
      tx.tasks[taskId].update({
        subtasks: updatedSubtasks, // Store entire array as JSON
      }),
    ]);
  } catch (err) {
    console.error("Subtask creation error:", err);
  }
};
```

## 8. Type Safety

### Type Interfaces

```typescript
// types/project.ts
// Define these interfaces to use throughout your app

// Task interface matching schema
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  projectId: string;
  userId: string;
  estimatedTime?: number;
  timeSpent?: number;
  isComplete: boolean;
  createdAt: number;
  order: number;
  dependencyIds?: string[]; // Array of task IDs
  notes?: string;
  subtasks?: SubTask[]; // Array of subtask objects
}

// Subtask interface for nested data
export interface SubTask {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'done'; // String union for type safety
}

// Project interface matching schema
export interface Project {
  id: string;
  title: string;
  description: string;
  priority: string;
  dueDate?: string;
  tags?: string[];
  tasks: Task[]; // Related tasks
  createdAt: number;
  userId: string;
}

// Optional: create a type for db query results
export type ProjectWithTasks = {
  id: string;
  title: string;
  description: string;
  // Other project fields
  tasks: Task[]; // Joined tasks
};
```

## 9. Best Practices & Lessons Learned

1. **Schema Design**
   - Keep schema flat and simple
   - Don't use defaults in schema - they don't work reliably
   - Use proper types (string, number, boolean)
   - Use json for arrays/complex data
   - Index fields that will be used in queries

2. **Data Relationships**
   - Define clear entity relationships in the schema
   - Always use links for related data in transactions
   - Query through relationships for proper data access
   - Include link operations in create transactions

3. **State Management**
   - Use local state for UI responsiveness
   - Debounce frequent updates to reduce API calls
   - Apply optimistic updates for better UX
   - Maintain consistent update patterns

4. **Error Handling**
   - Wrap all transactions in try/catch
   - Provide user feedback for both success and failure
   - Log detailed errors for debugging
   - Handle all loading and error states in UI

5. **Performance**
   - Debounce frequent updates (text inputs)
   - Use proper indexing for queries
   - Handle loading states with skeletons
   - Use conditional queries (null when data not needed)

6. **Type Safety**
   - Define interfaces matching schema structure
   - Use type assertions carefully
   - Validate data before saving
   - Use optional chaining for query results

7. **Security**
   - Store sensitive data in environment variables
   - Set proper permissions in InstantDB dashboard
   - Validate user access before operations
   - Use nonce for OAuth flows

## 10. Common Pitfalls

1. **Schema Validation Errors**
   - Missing required fields in transactions
   - Wrong types in updates (string vs number)
   - Using defaults in schema (they don't work properly)
   - Invalid JSON data in complex fields

2. **Query Issues**
   - Not handling null/undefined data (use optional chaining)
   - Not checking loading state
   - Incorrect relationship traversal
   - Missing where clauses for filtering

3. **Transaction Failures**
   - Missing error handling (always use try/catch)
   - Invalid data in updates
   - Permission issues (check rules)
   - Missing link operations for relationships

4. **Performance Problems**
   - Too frequent updates without debouncing
   - Not caching repeated queries
   - Too complex nested queries
   - Missing indexes on filtered fields

## Permissions Setup

```typescript
// lib/permissions.ts - Define access rules
import type { InstantRules } from "@instantdb/react";

const rules = {
  $users: {
    allow: {
      view: 'auth.id == data.id', // Users can only see their own data
      create: 'false', // Users are created through auth system
      delete: 'false', // Don't allow user deletion
      update: 'false', // Don't allow user updates directly
    },
  },
  projects: {
    allow: {
      view: 'auth.id == data.userId || auth.id in data.ref("owner.id")', // Owner can view
      create: 'auth.id != null', // Logged in users can create
      update: 'auth.id == data.userId || auth.id in data.ref("owner.id")', // Owner can update
      delete: 'auth.id == data.userId || auth.id in data.ref("owner.id")', // Owner can delete
    },
  },
  tasks: {
    allow: {
      view: 'auth.id == data.userId || auth.id in data.ref("owner.id")', // Owner can view
      create: 'auth.id != null', // Logged in users can create
      update: 'auth.id == data.userId || auth.id in data.ref("owner.id")', // Owner can update
      delete: 'auth.id == data.userId || auth.id in data.ref("owner.id")', // Owner can delete
    },
  },
} satisfies InstantRules;

export default rules;
```

## Conclusion

InstantDB provides a powerful, type-safe way to add a database to your Next.js project with minimal setup. By following these patterns and best practices, you can build robust applications with real-time data synchronization and proper authentication.

Remember the key principles:
- Keep schema simple and flat
- Handle data relationships through links
- Use proper error handling everywhere
- Maintain type safety with interfaces
- Follow security best practices
- Debounce frequent updates
- Query through proper relationship paths

These guidelines will help you avoid common pitfalls and build a performant, reliable application with InstantDB and Next.js.