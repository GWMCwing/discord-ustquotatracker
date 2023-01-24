# Ust Quota Tracker

Many thanks for the source code from [_em](https://github.com/henveloper).

A working discord server is deployed on [click here](https://discord.gg/TTuMfGMtDR).  
Critical bug fixes should be deployed on or before spring semester enrollment period start.  
Feel free to issue pull requests or open new issue for feedback.

## Description

This is a fork of the [Ust Quota Tracker](https://github.com/henveloper/discord-ustquotatracker). Most of the unrelated feature have been removed, and some of the code has been factorized.

The database is now using mongodb instead of mongoose because of my personal server configuration, modification can be made to [dbInterface.ts](./src/database/dbInterface.ts) to use mongoose instead.

## Possible Future Update

- Because of the current implementation of the database data fetching is based on api calls, database interface may change to local api call instead of direct fetching. Explictly return types will be included accordingly if needed, but the return types will stay the same.
- School based quota change notification may be implemented, subject to the implementation of my another express server configuration and progress.
