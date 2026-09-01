# Changelog

## 1.2.0

- Simplified SQL construction and removed debug output.
- Fixed duplicated search conditions.
- Escaped values used in generated SQL literals.
- Escaped SQL Server `LIKE` metacharacters in search terms.
- Added pagination, sort direction, and required-field validation.
- Added clear validation for join and filter collections.
- Allowed custom search fields without requiring a primary `searchField`.
- Added support for the documented `nullCheckColumns` spelling.
- Added regression tests and reduced the published package contents.