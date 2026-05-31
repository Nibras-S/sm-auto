// Build a lookup map of product images keyed by their (clean) file name,
// so data files can reference an image by a stable key that tolerates spaces.
const ctx = require.context("../assets/ProductList", false, /\.(png|jpe?g|svg)$/);

const imageMap = {};
ctx.keys().forEach((key) => {
  const fileName = key.split("/").pop().replace(/\.(png|jpe?g|svg)$/i, "");
  imageMap[fileName] = ctx(key);
});

const fallback = Object.values(imageMap)[0];

export const getProductImage = (imageKey) => imageMap[imageKey] || fallback;

export default imageMap;
