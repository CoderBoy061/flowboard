# AI usage log

AI assistance was used as a development aid for:

- Splitting the initial UI into focused React components.
- Creating typed Redux models, reducers, selectors, and permission middleware.
- Implementing native drag-and-drop interactions.
- Adding localStorage persistence through `react-persist-state-hook`.
- Reviewing the implementation against the supplied assignment.
- Expanding tests and documenting the architecture.

Corrections and decisions made during review:

- Permission behavior was aligned with the PDF: members access tasks through granted containers, not through task assignment.
- Assignment-based access grants were removed because they were not part of the required permission model.
- Dark mode was not added because the PDF marks it out of scope.
- The 150-character description minimum was removed; descriptions are only required to be non-empty after trimming.
- Notifications, workspace switching, persistence, and search were kept as optional enhancements because they do not conflict with the PDF requirements.
- Unused access-management UI was removed during cleanup.
