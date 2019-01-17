module.exports = {
  shuffle: a => {
    a.sort(() => Math.random() - 0.5);
    return a;
  },

  random: (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },

  genCode: () => {
    return this.random(100000, 999999);
  },

  time: () => {
    return (Date.now() / 1000) | 0;
  },
  without: (arr, ...args) => {
    return arr.filter(v => !args.includes(v));
  }
};
