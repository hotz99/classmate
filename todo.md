to refactor:
- map<string, string> uploadedFilesCache, check if hashed file in map
- optimize prompt (?)
- types for browser<->sveltekit communication
- replace gemini sdk with pure fetch
- apply matteo's colors
- refactor layout.svelte
- look into derived stores
- clean up shit code

summary request flow:
[Browser] --(Request)--> [SvelteKit API] --(Request)--> [Gemini API]
[Browser] <--(Response)-- [SvelteKit API] <--(Response)-- [Gemini API]
