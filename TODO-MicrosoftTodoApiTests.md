# Microsoft Todo API Test Issues

## Current Status
- We attempted to create comprehensive tests for `microsoftTodoApi.js` but encountered persistent Jest errors
- All other tests in the project (61 total) pass successfully
- Only this specific test file consistently fails with: "Your test suite must contain at least one test"

## Test File Implementation
The test implementation looked correct and followed the project's patterns:

```javascript
// Tests for Microsoft Todo API service
import { microsoftTodoApi } from '../../../../src/services/api/microsoftTodoApi';

// Setup mocks before importing the module under test
jest.mock('../../../../src/services/auth/microsoftAuth', () => ({
  microsoftAuthService: {
    getAccessToken: jest.fn().mockResolvedValue('mock-access-token')
  }
}));

// Create mock functions for Graph Client
const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPatch = jest.fn();
const mockDelete = jest.fn();
const mockApi = jest.fn().mockReturnValue({
  get: mockGet,
  post: mockPost,
  patch: mockPatch,
  delete: mockDelete
});

jest.mock('@microsoft/microsoft-graph-client', () => ({
  Client: {
    init: jest.fn().mockReturnValue({
      api: mockApi
    })
  }
}));

// Test structure with describe/it blocks and proper AAA pattern...
```

## Error Found During Testing
When we refined the test implementation, we received a more specific error:
```
ReferenceError: Cannot access 'mockApi' before initialization
  at tests/unit/services/api/ms-todo-api.spec.js:26:12
```
This suggests that Jest is having issues with the order of variable declarations and mocks even though the code appears to have variables defined before use.

## Attempted Solutions
1. Created a properly structured test file following project guidelines with comprehensive test coverage
2. Fixed variable ordering to ensure mocks are defined before they're used
3. Tried different file names (ms-todo-api.spec.js, msTodoApiBasicTest.spec.js)
4. Created minimal test files with just a single basic assertion
5. Verified proper mock setup for Microsoft Auth and Graph Client
6. Reordered import statements to come after all mock definitions

## Possible Causes
1. **Jest Hoisting Behavior**: Jest's hoisting behavior for mocks might be causing unexpected interactions
2. **Import Order Issues**: There may be a subtle issue with how Jest processes imports vs. mock definitions
3. **Path Issues**: The nested path (services/api/) might be problematic for Jest in this project
4. **Hidden Characters or Encoding**: The file might have invisible characters or encoding issues
5. **Module Dependencies**: A specific pattern in how the microsoftTodoApi module imports its dependencies

## Next Steps
1. Review Jest configuration in jest.config.js, particularly transform settings and moduleNameMapper
2. Try creating the test in a different location (directly in tests/unit/)
3. Inspect source file structure of microsoftTodoApi.js for unusual import patterns
4. Try a completely different mocking approach:
   ```javascript
   jest.mock('@microsoft/microsoft-graph-client');
   import { Client } from '@microsoft/microsoft-graph-client';
   // Then manually set up mock implementations after import
   ```
5. Check if there are any version compatibility issues between Jest and the project dependencies

## Priority
Medium - All other tests are passing, so this doesn't block development, but should be revisited for proper test coverage of the Microsoft Todo API functionality.
