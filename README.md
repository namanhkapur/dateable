# dateable

# deploy production

Should work out of the box on the production server in the root directory of this monorepo
```
make deploy-production
```


# local setup
for first time local setup be sure to run 
`pre-commit install`

 ```
cd server    # (go into the server folder)
make compose # (start local postgresdb)
make clean   # (clear older builds)
make setup   # (download packages)
make watch   # (start server)
```

# Testing
If wanting to run specific tests, change `TESTS ?= '__tests__/**/*.test.ts'` in `server/Makefile`
```
make watch-test
```
