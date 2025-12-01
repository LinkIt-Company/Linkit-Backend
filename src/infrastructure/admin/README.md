# AdminJS Setup

This directory contains the AdminJS configuration for the LinkIt backend application.

## Overview

AdminJS provides an administrative interface for managing database resources through a web UI. It's integrated with NestJS and TypeORM.

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```env
ADMIN_EMAIL=admin@linkit.com
ADMIN_PASSWORD=admin123
ADMIN_COOKIE_SECRET=secret-session-cookie-change-in-production
ADMIN_SESSION_SECRET=secret-session-key-change-in-production
```

**Important**: Change these values in production environments!

### Accessing the Admin Panel

Once the application is running, access the admin panel at:

```
http://localhost:3000/admin
```

Default credentials:
- Email: `admin@linkit.com`
- Password: `admin123`

## Features

### Managed Resources

The admin panel manages the following entities:

- **Users**: User management and device tokens
- **Posts**: Content posts with AI classification
- **Folders**: User folders for organizing content
- **AI Classification**: AI-powered content classification
- **Keywords**: Content keywords
- **Post Keywords**: Relationship between posts and keywords
- **Metrics**: Analytics and metrics data
- **Onboard Categories**: Onboarding category configuration

### Navigation Groups

Resources are organized into logical groups:
- **Users**: User-related entities
- **Content**: Posts, folders, keywords
- **AI**: AI classification data
- **Analytics**: Metrics and analytics
- **Onboarding**: Onboarding configuration

## Security

The admin panel is protected with basic authentication. In production:

1. Use strong passwords
2. Change the cookie and session secrets
3. Consider adding IP whitelisting
4. Use HTTPS
5. Implement role-based access control if needed

## Customization

To add or modify resources, edit `src/infrastructure/admin/admin.module.ts`:

```typescript
resources: [
  {
    resource: YourEntity,
    options: {
      navigation: {
        name: 'Your Group',
        icon: 'YourIcon',
      },
    },
  },
]
```

For more customization options, refer to the [AdminJS documentation](https://docs.adminjs.co/).
