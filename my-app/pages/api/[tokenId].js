// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// Base URI + TokenID
// example.com/{id}
// https://docs.opensea.io/docs/metadata-standards

export default function handler(req, res) {
  // res.status(200).json({ name: 'John Doe' })
  const tokenId = req.query.tokenId;
  const name = `Crypto Dev #${tokenId}`;
  const description = "Crypto Devs is an NFT Collection from ABaaaC created for studing purposes."

  //get image url from github or dynamicaly
  const image = `https://raw.githubusercontent.com/ABaaaC/NFT-collections/master/my-app/public/cryptodevs/${Number(tokenId)-1}.svg`; 
  return res.json({
    name: name,
    description: description,
    image: image
  });
}
