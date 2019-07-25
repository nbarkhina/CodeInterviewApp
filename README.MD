# Code Interview App

[![Build status](https://neilb.visualstudio.com/Git%20Neil/_apis/build/status/Code-Interview-Site%20CI)](https://neilb.visualstudio.com/Git%20Neil/_build/latest?definitionId=11)

A web app for conducting code interviews. Allows everyone to watch the candidate as they type. Also allows the code to be run in the browser to see the output. Designed to watch a single coder however includes experimental co-authoring capability. Currently only supports the Javascript language. App was written in TypeScript and .NET Core for the backend.

See demo here: https://www.neilb.net/codeinterview/

# Debug Locally

- make sure you have .NET Core SDK 2.2 installed
- open a powershell terminal
- if haven't previously trust the .net core dev cert
- `dotnet run`
- open a second powershell terminal
- cd into wwwroot folder
- `npm install`
- `npm install -g typescript` (if you don't have typescript installed globally)
- `tsc -w`
- view the app at https://localhost:5001/index.html
 
# Publish

- run `build_first_time.bat`
- then run `build.ps1` each time after

# Dotnet Core Commands Reference

- dotnet run
- dotnet watch run (for hot reload)
- dotnet build
- dotnet --version
