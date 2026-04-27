@echo off

echo Starting Backend copy...
robocopy "c:\Users\91993\Documents\global-handlooms\spring-backend" "c:\Users\91993\Documents\global_handlooms_Backend" /E /XD target .git .idea
cd /d "c:\Users\91993\Documents\global_handlooms_Backend"
git init
git add .
git commit -m "Initial backend commit"
git branch -M main
git remote add origin https://github.com/k-satya-2400031153/global_handlooms_Backend.git
git push -u origin main -f

echo Starting Frontend copy...
robocopy "c:\Users\91993\Documents\global-handlooms" "c:\Users\91993\Documents\global_handlooms_Frontend" /E /XD backend spring-backend node_modules dist .git .vscode .idea .vercel
cd /d "c:\Users\91993\Documents\global_handlooms_Frontend"
git init
git add .
git commit -m "Initial frontend commit"
git branch -M main
git remote add origin https://github.com/k-satya-2400031153/global_handlooms_Frontend.git
git push -u origin main -f

echo Done!
