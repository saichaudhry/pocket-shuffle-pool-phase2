# Phase 1 prompt log

**Prompt:**
Read the assignment and explain the requirements and submission steps. Don’t create files or code yet.

AI: Explained the spec-first commit, partial build, documentation, separate inherited repository, preservation rule, and submission requirements.


**Prompt:**
I want to make a small 2D pool game, only have 45 mins. Suggest a few manageable twists that would make it different from normal pool. Keep the scope suitable for about 45 minutes of starter coding and two hours for someone else to finish. I’ll choose the idea and rules.

AI: Suggested pool twists. You chose Pocket Shuffle and reduced the table to three solids, three stripes, an 8-ball, and a cue ball.

**Prompt:**
Use these decisions: two players on one computer, four open pockets and two closed, and a new blocked-pocket pair every two shots after the balls stop. Players clear their assigned balls before sinking the 8-ball. A cue-ball foul ends the turn and lets the opponent reposition it. read my SPEC.md with checkable acceptance criteria and priorities. Flag any additional rules you suggest so I can review them. Don’t generate code.


**Prompt:** 
Use my reviewed SPEC.md. Make sure the first commit contains only that file, with no code. Connect the Desktop project to my GitHub repository and push it. Don’t begin implementation yet.


**Prompt:**
Read the latest SPEC.md from GitHub. Explain what we should build during Phase 1 and what we should leave for Sai. Don’t change any files yet.

**Prompt:**
Create the basic page using HTML, CSS, and JavaScript. Draw a 2D pool table with six pocket markers, one cue ball, three solids, three stripes, and the 8-ball. Show four pockets as open and two as blocked. Keep rendering separate from game state. Don’t implement shooting yet.

**Prompt:**
Add mouse aiming with a direction line. Hold the left mouse button to charge shot power and release to shoot. Show a capped power bar. Keep input handling separate from the game logic.

**Prompt:**
Add friction, cushion rebounds, and ball-to-ball collisions in a separate physics file. Use simple, consistent physics. Prevent another shot while any ball is moving. Don’t add pocketing or player turns yet.

**Prompt:**
Add a reset button that restores the starting layout and shot count. Add clear TODOs where the student should implement pocketing, the shuffle, turns, fouls, and winning.



**Prompt:**
Check that the starter loads, aiming and charging work, balls collide and stop, shooting is blocked during motion, and reset works. Run focused physics checks. Report what you actually verified and any limitations; don’t claim unfinished features work.


**Prompt:**
I am writing a simple README with run instructions, controls, the status of every acceptance criterion, a short file map, known limitations, and prioritized next steps. Clearly state that pockets are only drawings and neither pocketing nor shuffling works yet. 


**Prompt:**
Help me simplify the README so another student can understand it quickly, while keeping the required information. Don’t change gameplay. Commit and push the documentation, then explain how one should receive the project. After I send it, leave the repository unchanged.

