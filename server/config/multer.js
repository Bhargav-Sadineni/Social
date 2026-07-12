import multer from "multer";

const storage = multer.diskStorage({})

export const uplaod = multer({storage})