# Security

Please report vulnerabilities through this repository's private GitHub
Security Advisory form. Do not publish exploit details in a public issue.

Only the latest package version receives security fixes.

The generator escapes values supplied through `searchTerm` and exact-search
filters. SQL identifiers and expressions such as `tableName`, `orderBy`, join
fields, and `customColumnQuery` must come from trusted application configuration.