@echo off
echo Starting git operations...

:: 直接使用 git add .
git add .
if errorlevel 1 (
    echo Error: git add failed!
    pause
    exit /b 1
)

echo Files added successfully.

:: 获取提交信息
set /p commit_msg=Enter commit message: 
if "%commit_msg%"=="" set commit_msg="Auto commit"

:: 提交更改
echo Committing changes...
git commit -m "%commit_msg%"
if errorlevel 1 (
    echo Error: git commit failed!
    pause
    exit /b 1
)

echo Commit successful.

:: 推送到远程
echo Pushing to remote...
git push xh master
if errorlevel 1 (
    echo Error: git push failed!
    pause
    exit /b 1
)

echo All operations completed successfully.
pause