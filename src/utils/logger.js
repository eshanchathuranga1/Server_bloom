const log = require('log-beautify');
log.useLabels = true;
log.useSymbols = true
log.setSymbols({
    info: '🚀    ',
    warning: '‼  ',
    error: '🛑   ',
    success: '✔  ',
    process: '🚀  ',
    ok: '👍      '

});
log.setColors({
    process: 'blue',
}),
log.setLabels({
    process: 'PROCESS',
})
log.setTextColors({
    process: 'blue',    
});
log.setLevels({
    process: 'info',
})

module.exports = log;