import resolve from '@rollup/plugin-node-resolve';

// Lit est volontairement embarqué dans le bundle plutôt que chargé depuis un CDN :
// beaucoup d'installations Home Assistant sont hors-ligne ou sur un réseau restreint,
// où un import distant empêcherait purement et simplement la carte de se charger.
export default {
    input: 'src/psychrometric-chart-advanced.js',
    output: {
        file: 'psychrometric-chart-advanced.js',
        format: 'es'
    },
    plugins: [
        resolve()
    ]
};
