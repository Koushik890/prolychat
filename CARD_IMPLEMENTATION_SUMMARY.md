# Card Content Persistence Implementation Summary

## Overview
This implementation adds persistent storage for card contents in the database, allowing users to configure cards with images, titles, subtitles, and button actions that are fully saved and retrievable.

## Database Schema Changes

### New Message Model
- **Table**: `Message`
- **Purpose**: Store all message content (text and card data) with proper relationships
- **Fields**:
  - `id`: UUID primary key
  - `listenerId`: Foreign key to Listener (one-to-one relationship)
  - `type`: Enum (TEXT, CARD)
  - `textContent`: String for text messages
  - `cardTitle`: String for card title
  - `cardSubtitle`: String for card subtitle
  - `cardButtonLabel`: String for button text
  - `cardImage`: BYTEA for storing binary image data
  - `cardImageUrl`: String for image URLs
  - `cardButtonAction`: String for button action type
  - `cardLink`: String for website links
  - `createdAt`, `updatedAt`: Timestamps

### Updated Listener Model
- Added `messageData` relationship to Message model
- Maintains backward compatibility with existing `message` field

### New Enums
- `MESSAGE_TYPE`: TEXT, CARD
- Updated `ACTION_TYPE`: MESSAGE, PROLYAI, CARD

## Backend Implementation

### New Query Functions (`src/actions/automations/message-queries.ts`)
- `createOrUpdateMessage()`: Create or update message data with image handling
- `getMessage()`: Retrieve message data by listener ID
- `deleteMessage()`: Delete message data
- `getCardDataFromMessage()`: Convert database format to frontend CardData

### Enhanced Main Queries (`src/actions/automations/queries.ts`)
- `saveListenerMessage()`: Save text or card messages to automation
- `getListenerMessage()`: Get message data for automation
- `deleteListenerMessage()`: Delete message data for automation
- Updated `addListener()` to support card data parameter

### Image Storage Strategy
- **Binary Storage**: Base64 images converted to Buffer and stored as BYTEA
- **URL Storage**: External image URLs stored as strings
- **Backward Compatible**: Supports both storage methods

## API Routes

### New Message API (`src/app/api/automations/[id]/message/route.ts`)
- `GET /api/automations/[id]/message`: Retrieve message data
- `POST /api/automations/[id]/message`: Create/update message with validation
- `DELETE /api/automations/[id]/message`: Delete message data
- **Validation**: Ensures proper message type and required data

## Frontend Integration

### New Action Functions (`src/actions/automations/index.ts`)
- `saveTextMessage()`: Save text content via API
- `saveCardMessage()`: Save card data via API  
- `getAutomationMessage()`: Retrieve message data
- `deleteAutomationMessage()`: Delete message data

### Enhanced Action Config Sidebar
- **Async Save Operations**: Text and card saves now persist to database
- **Error Handling**: Graceful fallback to UI updates if API fails
- **Real-time Updates**: UI reflects saved state immediately

### Card Data Structure
```typescript
interface CardData {
  image?: string          // Base64 or URL
  title: string          // Required
  subtitle: string       // Required  
  link?: string          // Optional website link
  buttonAction?: 'message' | 'ai' | 'website'
  buttonTitle?: string   // Custom button text
}
```

## Key Features Implemented

### ✅ Complete CRUD Operations
- **Create**: Save new text/card messages
- **Read**: Retrieve saved message data
- **Update**: Modify existing messages
- **Delete**: Remove message data

### ✅ Image Persistence
- **Database Storage**: Images stored as binary data (BYTEA)
- **URL Support**: External image URLs also supported
- **Base64 Handling**: Automatic conversion from frontend uploads

### ✅ Backward Compatibility
- **Existing Features**: All current text message functionality preserved
- **Progressive Enhancement**: New card features don't break existing automations
- **Migration Safe**: Database changes are additive, not destructive

### ✅ Type Safety
- **TypeScript**: Full type definitions for all new interfaces
- **Database Types**: Prisma-generated types for compile-time safety
- **API Validation**: Runtime validation for API requests

## Usage Flow

### For Text Messages:
1. User selects "Text" option in Action Config Sidebar
2. Enters text in modal
3. `handleTextSave()` calls `saveTextMessage()` API
4. Text stored in `Message.textContent` field
5. UI updates with saved text

### For Card Messages:
1. User selects "Card" option in Action Config Sidebar  
2. Configures image, title, subtitle, button in Card Config Modal
3. `handleCardSave()` calls `saveCardMessage()` API
4. Card data stored in respective `Message.card*` fields
5. Images converted to binary and stored in `cardImage` field
6. UI updates with card preview

## Database Relationships

```
Automation (1) ←→ (1) Listener (1) ←→ (1) Message
                                            ↓
                                    MessageType (TEXT|CARD)
```

## Error Handling

### API Level
- **Validation**: Required field checks
- **Error Responses**: Proper HTTP status codes
- **Database Errors**: Graceful error handling with rollback

### Frontend Level  
- **Try-Catch**: All API calls wrapped in error handling
- **Fallback Updates**: UI updates even if API fails
- **User Feedback**: Console logging for debugging

## Performance Considerations

### Database
- **Indexes**: Added on `type` and `listenerId` for fast queries
- **One-to-One**: Efficient relationship structure
- **Optional Fields**: NULL values for unused card/text fields

### Frontend
- **Lazy Loading**: Dynamic imports for API functions
- **Minimal Renders**: State updates only when necessary
- **Error Resilience**: UI doesn't break on API failures

## Security Measures

### Image Handling
- **Size Limits**: 10MB upload limit enforced
- **Type Validation**: Image type checking
- **Sanitization**: Proper base64 validation

### API Security  
- **Authentication**: User authentication required
- **Validation**: Input validation on all endpoints
- **SQL Injection**: Prisma ORM prevents SQL injection

## Migration Path

### From Old System
1. **Existing Data**: Old `message` field preserved
2. **New Data**: Uses Message model for new saves
3. **Gradual Migration**: Can migrate old data on-demand

### Future Enhancements
- **Audio Messages**: Schema supports additional message types
- **Video Cards**: Can extend card fields for video content
- **Template Library**: Can add template references

## Testing Recommendations

### Database Tests
- Test message CRUD operations
- Verify image storage and retrieval
- Check relationship integrity

### API Tests  
- Test all endpoint combinations
- Verify error handling
- Check authentication

### Frontend Tests
- Test card save/load functionality
- Verify image upload handling
- Test error scenarios

## Monitoring

### Key Metrics
- Message save success rate
- Image storage size trends  
- API response times
- Error frequency by type

This implementation provides a robust, scalable foundation for card content management while maintaining full backward compatibility with existing message functionality. 