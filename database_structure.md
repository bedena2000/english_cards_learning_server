## Database Structure (MySQL)

### Entities Overview
- **User**: account owner and author of stacks, comments, and ratings
- **Stack**: collection of cards; can be public or private
- **Card**: front/back text item inside a stack
- **StackComment**: comment by a user on a stack
- **StackRating**: evaluation (1–5) of a stack by a user

---

### Tables

#### Users
| Field         | Type          | Notes |
|---------------|---------------|------|
| id            | BIGINT (PK)   | auto-increment |
| email         | VARCHAR(255)  | unique |
| username      | VARCHAR(50)   | unique |
| password_hash | VARCHAR(255)  | hashed password |
| created_at    | DATETIME      | default now |
| updated_at    | DATETIME      | auto-updated |

#### Stacks
| Field       | Type                 | Notes |
|-------------|----------------------|------|
| id          | BIGINT (PK)           | auto-increment |
| owner_id    | BIGINT (FK → Users)   | stack owner |
| title       | VARCHAR(150)          | stack title |
| description | TEXT                 | optional |
| visibility  | ENUM(public, private)| default private |
| created_at  | DATETIME             | default now |
| updated_at  | DATETIME             | auto-updated |

#### Cards
| Field      | Type                | Notes |
|------------|---------------------|------|
| id         | BIGINT (PK)          | auto-increment |
| stack_id   | BIGINT (FK → Stacks) | parent stack |
| front_text | VARCHAR(255)         | word/term |
| back_text  | TEXT                | meaning |
| position   | INT                 | ordering |
| created_at | DATETIME            | default now |
| updated_at | DATETIME            | auto-updated |

#### StackComments
| Field      | Type                | Notes |
|------------|---------------------|------|
| id         | BIGINT (PK)          | auto-increment |
| stack_id   | BIGINT (FK → Stacks) | commented stack |
| user_id    | BIGINT (FK → Users)  | comment author |
| content    | TEXT                | comment text |
| created_at | DATETIME            | default now |

#### StackRatings
| Field      | Type                | Notes |
|------------|---------------------|------|
| id         | BIGINT (PK)          | auto-increment |
| stack_id   | BIGINT (FK → Stacks) | rated stack |
| user_id    | BIGINT (FK → Users)  | rating author |
| rating     | TINYINT (1–5)        | evaluation score |
| created_at | DATETIME            | default now |
| updated_at | DATETIME            | auto-updated |

---

### Relationships
- **User 1—N Stack** (one user owns many stacks)
- **Stack 1—N Card** (one stack contains many cards)
- **User 1—N StackComment** and **Stack 1—N StackComment**
- **User 1—N StackRating** and **Stack 1—N StackRating**
- **StackRating is unique per user per stack**

---

### Notes
- Visibility is stored on `Stacks` as `public` or `private`.
- A user can rate a stack once (enforced by unique constraint).