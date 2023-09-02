# Strict Null Check Migration Tools

Scripts to help [migrate a Typescript project to use strict null checks](https://www.typescriptlang.org/tsconfig#strictNullChecks)

## Usage

```bash
npm install
```

### `index.js`

The main script prints of list of files that are eligible for strict null checks. This includes all files that only import files thare are already strict null checked.

```bash
node index.js /path/to/your/project
```

### `autoAdd.js`

Very simple script that tries to auto add any eligible file to a custom `tsconfig` defined in `src/config.js#targetTsconfig`. This iteratively compiles the `tsconfig` project with just that file added. If there are no errors, it is added to the `tsconfig`

```bash
node autoAdd.js /path/to/your/project
```
