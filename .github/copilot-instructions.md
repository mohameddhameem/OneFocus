markdown
# Copilot Instructions for This Vue.js Project

## General Guidelines
- Use Vue.js Single-File Components (.vue files)
- Prefer ES6+ syntax (arrow functions, destructuring, template literals)
- Follow Vue 3 Composition API patterns for new components
- Maintain the existing project structure with components, services, and tests
- For TypeScript files (.ts), use strong typing
- Write concise and meaningful comments where necessary

## State Management
- Use Vue's reactivity system with ref() and reactive() for local state
- For global state, follow existing patterns using Vuex or provide/inject

## Testing
- Use Jest for unit and integration tests
- Follow the existing pattern of placing tests in the `tests/unit` directory
- Structure tests with describe blocks for components/modules and nested describes for methods/scenarios
- Use beforeEach/afterEach for setup and cleanup, and beforeAll/afterAll for global test configurations
- Mock external dependencies before importing the module under test
- For API mocks, follow the pattern in microsoftTodoApi tests where mockGraphClient is created first
- For component tests, use Vue Test Utils mount/shallowMount with proper prop and event testing
- Mock browser APIs (localStorage, Notification, Audio) following existing patterns
- Follow the Arrange-Act-Assert pattern in test blocks
- Verify function calls with expect().toHaveBeenCalledWith() for proper parameter validation

## API Integration
- For Microsoft Todo API integration, follow the pattern in `microsoftTodoApi.js`
- Use proper authentication mechanisms via the auth services in `services/auth`
- Use the existing API client structure for consistent interface across different task providers
- Place all API implementations in the `services/api` directory

## Pomodoro Timer
- Follow the existing implementation patterns for timer functionality
- Ensure proper integration with task management features
- Maintain the existing interface between timer components

## Task Management
- Follow the existing task management patterns
- Ensure proper integration with Microsoft Todo API and other task providers
- Maintain compatibility with the task interface structure

## Code Style
- Follow the existing ESLint and style conventions
- Use 2 spaces for indentation
- Maintain consistent naming conventions
- Follow Vue.js best practices for component structure

## Documentation
- Add JSDoc comments for exported functions and methods
- Update README.md for new features or significant changes
- Document API integrations thoroughly

## Example Component Skeleton

```vue
<template>
  <div class="component-container">
    <button @click="increaseCount">Count: {{ count }}</button>
  </div>
</template>

<script>
export default {
  name: 'MyComponent',
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increaseCount() {
      this.count++
    }
  }
}
</script>

<style scoped>
.component-container {
  padding: 10px;
}
</style>
```

## Composition API Example

```vue
<template>
  <div class="component-container">
    <button @click="increaseCount">Count: {{ count }}</button>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'MyComponent',
  setup() {
    const count = ref(0)
    
    function increaseCount() {
      count.value++
    }
    
    return {
      count,
      increaseCount
    }
  }
}
</script>
```