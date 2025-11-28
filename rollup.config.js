import resolve from '@rollup/plugin-node-resolve';

export default {
    input: 'src/psychrometric-chart-advanced.js',
    output: {
        file: 'psychrometric-chart-advanced.js',
        format: 'es'
    },
    plugins: [
        resolve()
    ],
    external: [
        'https://unpkg.com/lit?module'
    ]
};
