@echo off
set /p "msg=Commit Message : "
git add .
git commit %2 -m "%msg%"
git push origin master %1