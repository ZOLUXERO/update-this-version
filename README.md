# update-this-version
Update this version using Semantic versioning

You can make use of the **User History**(only for azure devops) feature where every commit using a syntax like:
`feat(test): #35: commit message` or `feat: #35: add commit message`. Will group all tasks with [#35]() under a only User history and link the work item to in this case an azure devops item.

This project uses a weigth system to upgrade the versions whitout using manual intervention with semantic versioning
where:

BREAKING CHANGE > feat > fix.

### Example:

If in the commits we find a **"BREAKING CHANGE"** the version goes one major.

If we  find a **"feat"** it goes up one minor.

If we  find a **"fix"** it goes up one patch.

Lets say the project finds a **"BREAKING CHANGE"** and a **"feat"** it will go up one major because of the weigth system.

## Future updates
1) Working on be able to set the type of release manually example:

    ```
    update-this-version --release --path-type "major"
    ```
    where you can select between:
    - major
    - minor
    - patch

2) Automatic add and commit when creating a tag

## usage
```
npm i -g update-this-version // create a release aimed to dev env
npm i -g update-this-version --release // create a release aimed to prod env
git add .
git commit -m "chore(release): version [skip ci]"
git push -u origin main --tags
```
