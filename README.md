# Ust Quota Tracker

A working discord server is deployed on [click here](https://discord.gg/Vwwj8vYKBd).  
Critical bug fixes should be deployed on or before spring semester enrollment period start. 

## Description

This is a fork of the [Ust Quota Tracker](https://github.com/henveloper/discord-ustquotatracker). Most of the unrelated feature have been removed, and some of the code has been factorized.

The database is now using mongodb instead of mongoose because of my personal server configuration, modification can be made to [dbInterface.ts](./src/database/dbInterface.ts) to use mongoose instead.
