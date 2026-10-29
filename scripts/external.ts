import pkg from '../package.json' with { type: 'json' }

export default Object.keys(pkg.dependencies)
