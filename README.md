# Bitespeed Backend Task: Identity Reconciliation

[Live Demo](https://bitespeed-eks4.onrender.com) - Deployed using [Render](https://render.com)

This project implements the Bitespeed Backend Task of Identity Reconciliation using Node.js, TypeScript, and Supabase. The web service identifies and tracks customer identities across multiple purchases.

## Table of Contents

- [Installation](#installation)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Technologies Used](#technologies-used)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)

## Installation

1. **Clone the repository**:
    ```bash
    git cone https://github.com/palash-cj/BiteSpeed.git
    cd BiteSpeed
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up Supabase**:
    - Sign up for Supabase and create a project.
    - Create a `Contact` table with the following schema:
      - `id`: Integer, Primary Key
      - `phoneNumber`: String, Nullable
      - `email`: String, Nullable
      - `linkedId`: Integer, Nullable (References `id` for linked contacts)
      - `linkPrecedence`: Enum (`primary`, `secondary`)
      - `createdAt`: Timestamp
      - `updatedAt`: Timestamp
      - `deletedAt`: Timestamp, Nullable

4. **Configure environment variables**: 
   - Create a `.env` file in the root directory:
   ```bash
   SUPABASE_URL=<your_supabase_url>
   SUPABASE_KEY=<your_supabase_key>
   ```

## Project Structure

```
├── src
│   ├── controllers
│   │   └── contact.controller.ts  # Handles HTTP requests and responses
│   ├── models
│   │   └── contact.model.ts       # Contact model interface
│   ├── services
│   │   └── contact.service.ts     # Business logic for contact handling
│   └── utils
│       └── supabase.ts            # Supabase client setup
├── test                           # Unit and e2e tests
├── .env                           # Environment variables file
├── README.md                      # Project README file
├── package.json                   # Project configuration
└── tsconfig.json                  # TypeScript configuration
```

## API Endpoints

### POST `/identify`
Identify or create a customer based on their email and/or phone number.

#### Request Body
```json
{
    "email": "test@example.com",
    "phoneNumber": "1234567890"
}
```

#### Response Body
```json
{
    "primaryContactId": 1,
    "emails": ["test@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
}
```

#### Error Response
```json
{
    "error": "Failed to identify contact"
}
```

## Technologies Used

- **Node.js**: JavaScript runtime for building the server.
- **TypeScript**: For static typing and improved developer experience.
- **Supabase**: Postgres database and real-time capabilities.
- **Express.js**: Minimalist web framework for building APIs.

## Environment Variables

The project requires the following environment variables to be configured in a `.env` file:

- `SUPABASE_URL`: The URL of your Supabase instance.
- `SUPABASE_KEY`: Your Supabase API key.

Example `.env` file:
```
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_KEY=your-supabase-key-here
```

## Running the Project

1. **Run the server**:
    ```bash
    npm run start
    ```

## License

This project is licensed under the MIT License.
```

This README should cover the essentials of your project setup, structure, and usage. Let me know if you'd like to customize any specific sections!