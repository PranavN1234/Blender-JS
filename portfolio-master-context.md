# Pranav Iyer’s 3D Portfolio — Master Project Context

**Status** · Direction selected, implementation to be verified  
**Updated** · November 15, 2026  
**Project** · An interactive software engineering portfolio built around one stylized 3D room

## Copy-paste project brief

> I’m Pranav Iyer, a software development engineer at Amazon with an M.S. in Computer Engineering from NYU Tandon. I’m revamping my existing Next.js portfolio into a compact, detailed cartoon workspace. A stylized version of me sits at the computer, typing. Clicking me makes the chair swivel toward the visitor and opens an optional AI conversation grounded in approved public information about my work. The monitor opens Projects, the bookshelf opens Publications, the wall board opens Experience, and the phone opens Contact. A chessboard and original creature-adventure artwork make the room feel like mine. Recruiters can reach the same content and my resume immediately through standard navigation, including on mobile and while 3D loads. There’s no walking, puzzle, or unlock requirement. The design workflow is Figma for layouts and flows, Blender for meshes and animation, and React Three Fiber for the live scene. Start with a rough room and a placeholder avatar. Prove the chair swivel and the monitor-to-Projects interaction before investing in a custom likeness or voice.

## Vision and audience

I want the website to feel like visiting a small animated version of my workspace. The memorable moment is personal and simple. I pause my work, turn my chair, and acknowledge the visitor. The rest of the room gives people a natural way to explore the software I’ve built, the places I’ve worked, and the research I’ve published.

The primary visitor is a recruiter or hiring manager who wants to scan my work quickly. A technical interviewer should also be able to go deeper into a case study and see my role, implementation decisions, and outcomes. A curious visitor can spend more time with the scene and find small personal details.

### Requirements I’ve chosen

- A single, detailed stylized cartoon room with a fixed opening view from a three-quarter angle. The website can animate the camera to specific views.
- A seated avatar that resembles me and turns to face the visitor on click.
- Clear, direct navigation to **Projects, Experience, Publications, Contact, and Resume**. The core content is readable HTML and works independently of the 3D scene.
- Clickable objects and short animations. No movement controls, puzzles, mandatory introduction, or content gated by finding a prop.
- An optional, mostly hidden AI conversation. It opens when deliberately selected and uses approved information I provide for retrieval.
- Personal details drawn from chess, creature-adventure games, and the expressive animation of classic Cartoon Network. Use original artwork and props in the public site.

## Room layout and interaction map

The working composition has the desk and avatar at the center, the bookshelf along one side, the career board on the back wall, and the chessboard in the foreground. Leave room for the avatar’s face and the monitor to read clearly from the opening camera. Use exaggerated shapes, expressive motions, and carefully placed detail. Choose the palette after reviewing a rough render.

| Object | Portfolio destination | Scene cue |
|---|---|---|
| Seated avatar and chair | Optional AI conversation. Keep a short bio readable on the home screen. | Typing pauses, the seat and avatar swivel together, and the character settles into a facing pose. Closing chat returns the chair and resumes typing. |
| Monitor | Projects and case studies | Screen wakes up, then the camera can move toward the desk. A web panel presents the real project content. |
| Bookshelf and featured journal | Publications | One journal slides out or opens. The panel shows papers, plain-language summaries, contributions, and publisher links. |
| Career board | Experience | A pinned card lifts or a timeline traces across the board. The panel shows roles, dates, and accomplishments. |
| Phone or tablet | Contact | Screen lights up. The panel provides direct contact and professional links. |
| Resume button and optional folder | Resume | The header button links directly to the resume. A folder can be added as a second entry point if it fits the composition. |
| Chessboard and wall art | Personality | The chessboard can show a position I choose, with an optional single-piece motion. Use original creature sketches or adventure motifs for the wallpaper. |
| Optional desk companion | A shortcut to the avatar conversation | A small idle reaction. If clickable, it opens the same conversation as the avatar. |

Skills can appear in project and role details. A dedicated skills board is optional.

### Visitor flow

- **Landing.** Show my name, role, and navigation as soon as the page loads. The room appears when ready, with a still render available as a fallback.
- **Section open.** A navigation click or prop click opens the same section. The section remains usable when an animation is skipped, the room is unavailable, or the visitor prefers reduced motion.
- **Conversation.** Open a clearly labeled **Ask AI Pranav** panel on request. Start with text. Closing it returns the avatar to work and restores focus to the control that opened it.
- **Mobile.** Start with a readable one-column layout and a room still. Test a full scene on phones before making it the default.

## Figma, Blender, and the web app

| Tool | What it owns | What it hands off |
|---|---|---|
| Figma | Layout, navigation, readable panels, responsive behavior, and a click-through prototype | Desktop and mobile frames, states, and placement for HTML UI over or beside scene imagery |
| Blender | Room composition, meshes, rig, pivots, materials, and authored animation | Editable scene, renders for Figma, and a tested GLB with named objects and clips |
| Next.js and React Three Fiber | Live 3D rendering, click targets, camera moves, UI state, portfolio content, and optional chat | A working site with direct navigation and a static fallback |

**Start with four Figma frames.** Design the desktop overview, Projects open, avatar chat open, and a mobile overview with a detail sheet. Use simple rectangles until the first Blender renders are available. Import Blender stills for the overview, monitor close-up, and visitor-facing pose, then overlay Figma hotspots. A short rendered clip can illustrate the swivel during design review. The website loads the actual models.

**Block out one scene in Blender.** Use a floor and two walls, a boxy desk, a chair, a placeholder avatar, a shelf, a career board, and a chess table. Place the opening camera before detailing the room. Keep the screen surface, journal, phone, chess piece, and other moving or clickable parts as separately named objects. Organize furniture and props into collections. Use object parenting where parts should inherit motion.

- Put the monitor and keyboard under the desk so they follow it if it moves.
- Put the chair seat and avatar root under a pivot at the swivel joint. The base stays on the floor. The avatar rig can animate hands and head independently.
- Keep the featured journal as its own object under the bookshelf so it can slide out without moving the shelf.
- Use one editable Blender scene and a single prototype export if convenient. Split out the room, avatar, or props later when that helps iteration or loading.

**Use stable names at the handoff.** The sample names below are working conventions and can be revised together.

| Exported object or group | Clip or cue | Web behavior |
|---|---|---|
| `ChairSwivel` with `AvatarRoot` | `TypingLoop`, `TurnToVisitor`, `FacingIdle`, `TurnBack` | Play the turn once, open chat, then return to the typing loop on close |
| `Monitor_Hitbox` and `MonitorScreen` | `MonitorPowerOn` | Open Projects and optionally focus the camera on the desk |
| `Journal_Hitbox` and `Journal` | `JournalSlideOut` | Open Publications and optionally play the prop animation |

**Let the app coordinate the experience.** The GLB supplies named meshes, a rig, and animation clips. A click selects an app action. The app opens a panel and can start the matching clip or camera move. When the chair-turn clip finishes, Three.js reports completion so React can move the avatar into its facing idle. Keep the chair orientation consistent across the one-shot turn and idle loop. Preserve a usable chat entry if the clip or canvas is unavailable.

## Optional AI conversation

The visible character is an AI representation of me. The first live version should answer questions from the same curated content that powers the portfolio. Store approved role summaries, project writeups, publication entries, and public links in structured content. Start with retrieval over that small collection. Add more infrastructure only if it improves answer quality for the actual content.

- Link answers to their matching portfolio entries. When the available material doesn’t support an answer, say so.
- Use public material approved for the portfolio. Keep proprietary employer information, unpublished work, credentials, and unrelated personal details out of the knowledge base.
- Keep API credentials server-side. If the model suggests opening Projects or Publications, validate the requested destination and call the same navigation action used by normal controls.
- Treat voice, lip-sync, turn-by-turn tours, and richer gestures as later additions. The prototype can use a chat panel with preset text so we can test the scene before connecting a model.

## Portfolio content to prepare

| Section | Starting material |
|---|---|
| Experience | Amazon software development, NYU IT development, Bank of America engineering, and Sayl if included in the current resume. Verify titles, dates, and public descriptions before launch. |
| Education | NYU Tandon M.S. in Computer Engineering and VIT B.Tech. in Computer Science and Engineering. |
| Projects | Start with two or three strong case studies. Candidates from the existing site include **Leya** for AI developer tooling, **NBA Stat Visualizer** for data/backend engineering, and **Don’t Eat Alone** for the NYU hackathon. |
| Publications | Candidate topics include GitHub network analysis, nested virtualization, and one-shot signature verification. Use the actual paper pages to verify titles, venues, and links before publishing. |
| Contact and resume | Current resume link and the public email, LinkedIn, and GitHub destinations I want to share. |

For each featured project, capture **the problem, my contribution, an engineering decision, the outcome, and a repo or demo link**. The claims and metrics should come from sources I can stand behind.

## Build sequence and first acceptance check

1. **Blockout and Figma.** Compare the opening view with the avatar facing the visitor. Confirm the desk, face, and bookshelf read clearly, and test the Projects and Chat panel placements.
2. **Browser prototype.** Load the rough GLB into the existing app. Connect the monitor to an HTML Projects panel. Connect the seated stand-in to the swivel and a placeholder chat panel.
3. **Portfolio content and polish.** Fill the real sections and verify navigation, mobile, reduced motion, and the room fallback. Refine the character likeness, art direction, and prop animations once the composition works.
4. **AI text chat.** Connect the approved content, verify sample answers and source links, and check how the UI handles an unavailable response.
5. **Later editions.** Consider voice and lip-sync, a miniature project demonstration on the desk, a day/night lighting change, or a room that gains artifacts as new projects launch.

The first prototype is ready to review when the avatar stops typing, turns once, opens chat, and returns to typing on close, with the chair base planted throughout. Both the monitor and the nav must open the same Projects content, including with the canvas disabled. Check that a visitor can reach Resume and Contact without interacting with the room.

## Current baseline and open decisions

- The existing portfolio is a Next.js client with sections for work, publications, resume, and contact. Its reviewed homepage source opened the old chat modal on a timer. Verify the current checkout before changing it and make the new conversation opt-in. [Portfolio repository](https://github.com/PranavN1234/Portfolio-Website/tree/main/client)
- The room concept and planning guide exist. Check whether Codex, Blender, or the MCP integration is installed locally before assuming the connection is usable. Either a local coding agent running Blender Python or an established local MCP connection can support the prototype.
- Open choices include the final room palette and composition, whether to adapt or commission the avatar, whether to include a clickable companion, which work to feature, and the production chat provider. A working title is **The Living Room**.
- The [illustrated field guide](https://chatgpt.com/library?file_id=libfile_ed0b783f50a081919fd4d495e2d5e16a&account_id=personal) has more detail on Figma, Blender asset planning, animation, and the implementation sequence.

## Handoff starters

Attach this document and use the starter for the work you’re doing.

**Codex or Claude Code**

> Inspect the portfolio checkout and identify the smallest browser prototype that meets the acceptance check in this brief. Reuse the existing Next.js client and web content where practical. For the first pass, use a placeholder avatar and stub chat.

**Blender or a 3D artist**

> Create a rough, editable cutaway room with a desk, monitor, seated avatar stand-in, shelf, and chess table. Compose the opening camera and test the chair pivot. Deliver overview and visitor-facing stills, plus a prototype GLB with the named swivel and return clips.

**Figma or a designer**

> Create the four frames in this brief around the rough Blender stills. Make Projects, Experience, Publications, Contact, and Resume immediately accessible, and show how the monitor and avatar lead to their panels.
