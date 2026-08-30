const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const {
  getSignedUrl,
} = require("@aws-sdk/s3-request-presigner");

const fs = require("fs");


// CREATE S3 CLIENT
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});


// UPLOAD RESUME PDF
const uploadResumePdf = async (
  filePath,
  userId,
  resumeId
) => {
  const fileBuffer = fs.readFileSync(filePath);

  const key = `resumes/${userId}/${resumeId}.pdf`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: "application/pdf",
  });

  await s3.send(command);

  return {
    key,
  };
};


// GENERATE TEMPORARY DOWNLOAD URL
const getResumePdfSignedUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(
    s3,
    command,
    {
      expiresIn: 300,
    }
  );

  return signedUrl;
};


// DELETE RESUME PDF FROM S3
const deleteResumePdf = async (key) => {
  if (!key) {
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  await s3.send(command);
};


module.exports = {
  uploadResumePdf,
  getResumePdfSignedUrl,
  deleteResumePdf,
};