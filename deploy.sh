#!/bin/bash
read -p "Commit Message: " msg
git add .
git commit -m "$msg"
git push origin master
