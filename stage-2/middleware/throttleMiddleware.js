const Bottleneck = require("bottleneck");

const limiter = new Bottleneck({
    maxConcurrent: 2,  //reqs at the same time
    minTime: 250    // Minimum time (in ms) between requests
});

module.exports = (req, res, next) => {
    limiter.schedule(() => new Promise((resolve) => {
        resolve();
    })).then(() => next());
};
