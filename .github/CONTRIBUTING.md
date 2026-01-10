# Contributing to Store Commerce

Thank you for considering contributing to Store Commerce! This document outlines the process for contributing to this project.

## How to Contribute

### Reporting Bugs
- Check if the bug has already been reported in the Issues section
- Use the GitHub issue tracker to create a new issue
- Include detailed steps to reproduce the bug
- Include error messages, screenshots, and relevant logs
- Specify your environment (OS, browser, Node version)

### Suggesting Features
- Open an issue with a clear and descriptive title
- Explain why the feature would be useful to most users
- Provide examples of how the feature would work
- Consider how it fits with the existing project goals

### Submitting Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/store-commerce.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   - Ensure all existing tests pass
   - Add new tests for new features
   - Test manually in the browser

5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
   Use clear, descriptive commit messages

6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Include screenshots for UI changes

## Development Setup

See the [Installation](../README.md#installation) section in the main README for setup instructions.

## Code Style Guidelines

### JavaScript/React
- Use ES6+ features
- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)
- Use async/await instead of promises when possible
- Add JSDoc comments for complex functions

### File Organization
- Components in `frontend/src/components/`
- Pages in `frontend/src/pages/`
- API routes in `backend/routes/`
- Controllers in `backend/controllers/`
- Models in `backend/models/`

### Naming Conventions
- Components: PascalCase (e.g., `ProductCard.jsx`)
- Functions: camelCase (e.g., `getUserProfile`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- Files: kebab-case for utilities (e.g., `auth-helper.js`)

## Testing

- Test all changes locally before submitting
- Ensure the app runs without errors
- Test both frontend and backend changes
- Verify responsiveness on different screen sizes
- Check browser console for errors

## Commit Message Guidelines

Use clear and meaningful commit messages:

**Good:**
```
Add product search functionality
Fix cart quantity update bug
Update API documentation for payments
```

**Bad:**
```
Fixed stuff
Updates
WIP
```

## Pull Request Checklist

Before submitting your PR, make sure:

- [ ] Code follows the project's style guidelines
- [ ] All tests pass
- [ ] New features include appropriate tests
- [ ] Documentation is updated
- [ ] Commit messages are clear and descriptive
- [ ] No console.log statements left in code
- [ ] No commented-out code blocks
- [ ] Screenshots included for UI changes

## Questions or Need Help?

- Open an issue for discussion
- Check existing issues for similar questions
- Be respectful and patient

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Keep discussions professional

## License

By contributing, you agree that your contributions will be licensed under the MIT License.