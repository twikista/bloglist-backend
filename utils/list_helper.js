const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const reducer = (sum, currentItem) => sum + currentItem.likes;
  return !blogs.length ? 0 : blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  const { title, author, likes } = [...blogs]
    .sort((a, b) => a.likes - b.likes)
    .at(-1);
  return { title, author, likes };
};

const mostBlogs = (blogs) => {
  const authorsArray = blogs.reduce((acc, val) => {
    acc[val.author] = (acc[val.author] || 0) + 1;
    return acc;
  }, {});
  const authorWithMostBlogs = Object.keys(authorsArray).reduce((a, b) =>
    authorsArray[a] > authorsArray[b] ? a : b
  );
  return {
    author: authorWithMostBlogs,
    blogs: authorsArray[authorWithMostBlogs],
  };
};

const mostLikes = (blogs) => {
  return blogs
    .reduce((acc, val) => {
      if (acc.find((i) => i.author === val.author) === undefined) {
        return [...acc, { author: val.author, likes: val.likes }];
      } else {
        const newItem = acc.map((item) => {
          if (item.author === val.author) {
            return { ...item, likes: val.likes + item.likes };
          } else {
            return item;
          }
        });
        acc = newItem;
      }

      return acc;
    }, [])
    .reduce((a, b) => {
      console.log(`a:${a.likes} --- b:${b.likes}`);
      return a.likes > b.likes ? a : b;
    });
};

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes };
