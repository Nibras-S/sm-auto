// Load all brand logos and expose them with a clean name derived from the file.
const ctx = require.context("../assets/Brands", false, /\.(png|jpe?g|svg)$/);

export const brandLogos = ctx.keys().map((key) => {
  const fileName = key.split("/").pop().replace(/\.(png|jpe?g|svg)$/i, "");
  return { name: fileName, src: ctx(key) };
});

export default brandLogos;
