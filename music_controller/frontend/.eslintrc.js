module.exports = {
    'settings': {
        'react': {
            'pragma': 'React',
            'version': '17.0.2'
        }
    },
    'env': {
        'browser': true,
        'es6': true,
        'node': true
    },
    'extends': [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaFeatures': {
            'jsx': true
        },
        'ecmaVersion': 11,
        'sourceType': 'module'
    },
    'plugins': [
        'react',
        '@typescript-eslint'
    ],
    'rules': {
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-var-requires': 0,
        'no-debugger': 'off',
        '@typescript-eslint/quotes': [
            'error',
            'single',
            {
                'allowTemplateLiterals': true
            }
        ]
    }
};
