module.exports = {
  '*.{js,ts}': ['prettier --ignore-unknown --write', 'npm run lint -- --fix'],
  '*.{md, json}': ['prettier --write'],
}
