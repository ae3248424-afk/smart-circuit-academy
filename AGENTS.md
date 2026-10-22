<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Diploma architecture
- Keep the authored curriculum and question keys in the browser-safe diploma module; all level and part pages derive from it to keep exams aligned with lessons.
- Diploma learning routes are public independent leaf pages; use parameter validation and shared learning navigation so refreshes and direct links work.
- Keep diploma practice results on the current device, separate from cloud attempts; do not represent local certificates as externally verified qualifications.
- Use avr8js for the fixed Uno experiment firmware and map interactive terminals to actual ATmega328P pins; do not imply arbitrary Arduino C++ compilation or a physical hardware connection.
- Certificate exports render the same HTML artwork for PDF, PNG and printing; per-level colors and shapes belong in semantic global style tokens.
- Resolve book asset pointers through the shared browser-safe book-assets module against the published Lovable origin; relative infrastructure URLs are not served by external hosts such as Vercel.
