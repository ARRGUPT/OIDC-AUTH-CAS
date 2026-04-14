import ImageKit from "@imagekit/nodejs";

const imagekit = new ImageKit({                         // this is the client
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
})

export default imagekit
