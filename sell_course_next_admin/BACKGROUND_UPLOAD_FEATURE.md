# Background Upload Feature for Video and Document Editing

## Overview
This enhancement adds background upload capabilities for both video and document editing operations, allowing users to continue working while files are being uploaded and processed.

## Features

### 1. **Background Video Updates**
- **Video File Updates**: Replace video files with background upload progress tracking
- **Script File Updates**: Update video scripts (.json files) with background upload
- **Inline Script Editing**: Real-time script editing with immediate updates

### 2. **Background Document Updates**  
- **File Updates**: Replace document files (.docx) with background upload
- **Title Updates**: Immediate title-only updates without file changes
- **Progress Tracking**: Real-time upload progress display

### 3. **Enhanced Upload Manager**
- **Multiple Upload Types**: Support for `video`, `doc`, `video-update`, `doc-update`, `video-script-update`
- **Floating Panel**: Visual progress panel showing all background operations
- **Cancel/Resume**: Ability to cancel ongoing uploads
- **Error Handling**: Comprehensive error reporting and retry mechanisms

## Technical Implementation

### New API Functions
1. **Video API** (`app/api/lessons/Video/video.ts`):
   - `updateVideoFileWithProgress()` - Update video file with progress tracking
   - `updateVideoScriptWithProgress()` - Update script file with progress tracking

2. **Document API** (`app/api/lessons/Doc/document.ts`):
   - `updateDocumentWithProgress()` - Update document with progress tracking

### Enhanced Upload Manager Context
- **Extended Types**: Added support for update operations
- **Flexible Parameters**: Support for `videoId`, `docsId`, and `contentId`
- **Better Error Handling**: Improved error reporting and status management

### UI Components Updates
1. **VideoModal.tsx**:
   - Background upload for video file updates
   - Background upload for script file updates
   - Immediate updates for inline script editing
   - Enhanced user feedback messages

2. **DocumentModalContent.tsx**:
   - Background upload for document file updates
   - Immediate updates for title-only changes
   - Enhanced progress feedback

3. **FloatingUploadPanel.tsx**:
   - Support for multiple upload types with appropriate icons
   - Enhanced type labels (Creating/Updating Video/Document/Script)
   - Better visual feedback for different operation types

## User Experience Improvements

### Before
- Users had to wait for uploads to complete before continuing work
- No visual feedback during upload operations
- Risk of data loss if navigation occurred during upload

### After
- **Non-blocking uploads**: Users can continue working while files upload
- **Visual progress tracking**: Real-time progress in floating panel
- **Intelligent operations**: File updates run in background, immediate updates for simple changes
- **Safety features**: Browser warning before closing during active uploads

## Usage Examples

### Updating a Video File
1. Open video in edit mode
2. Select new video file
3. Click "Update Video"
4. Upload starts in background immediately
5. User can close modal and continue working
6. Progress tracked in floating upload panel

### Updating Document Content
1. Open document in edit mode
2. Select new document file
3. Click "Save"
4. Upload starts in background
5. Progress displayed in floating panel
6. Completion notification shown when done

### Script Editing
1. **File Upload**: Background upload for new script files
2. **Inline Editing**: Immediate save for text-based script changes

## Configuration

The system supports the following upload types:
- `video` - Creating new videos
- `video-update` - Updating existing video files
- `video-script-update` - Updating video script files
- `doc` - Creating new documents  
- `doc-update` - Updating existing documents

## Error Handling
- **Network errors**: Automatic retry with user notification
- **File validation**: Client-side validation before upload starts
- **Authorization**: Token-based authentication with automatic refresh
- **Abort support**: Users can cancel uploads at any time

## Performance Benefits
- **Improved UX**: No blocking operations during file uploads
- **Better resource utilization**: Parallel operations when possible
- **Reduced wait times**: Users can continue working immediately
- **Progress visibility**: Clear feedback on upload status

This implementation significantly improves the user experience by allowing continuous workflow while maintaining robust upload functionality with comprehensive error handling and progress tracking.
