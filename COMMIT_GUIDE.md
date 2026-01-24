# Commit Guide

This project follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This leads to a more readable and structured commit history.

## Atomic Commits

Commits should be atomic, meaning each commit should represent a single logical change. This makes it easier to understand the history of the project and to revert changes if necessary.

## Commit Message Format

Each commit message consists of a **header**, a **body**, and a **footer**.

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

### Header

The header is mandatory and should follow the format `<type>[optional scope]: <description>`.

#### Type

The type must be one of the following:

-   `feat`: A new feature
-   `fix`: A bug fix
-   `docs`: Documentation only changes
-   `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
-   `refactor`: A code change that neither fixes a bug nor adds a feature
-   `perf`: A code change that improves performance
-   `test`: Adding missing tests or correcting existing tests
-   `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation
-   `ci`: Changes to our CI configuration files and scripts
-   `build`: Changes that affect the build system or external dependencies

#### Scope (Optional)

The scope provides additional contextual information and is contained within parentheses, e.g., `feat(parser): add ability to parse arrays`. The scope could be the name of a package, a component, or a file.

#### Description

The description contains a succinct description of the change:

-   Use the imperative, present tense: "change" not "changed" nor "changes".
-   Don't capitalize the first letter.
-   No dot (.) at the end.

### Body (Optional)

The body should include the motivation for the change and contrast this with previous behavior.

### Footer (Optional)

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the words `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then the description of the change, justification, and migration notes.

### Example

```
feat(web): add commit guide link to contributing file

This enhances developer experience by making the commit guide more discoverable.
```

```
fix(sdk): correct calculation for stream payments

The previous implementation had a rounding error that resulted in incorrect payment amounts. This commit fixes the calculation and adds a test case to prevent regressions.

Closes: #123
```

```
feat: add user authentication

BREAKING CHANGE: The user authentication system has been redesigned.
The `User` model now requires an `email` field.
```
