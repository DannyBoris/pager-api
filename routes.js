const router = require("express").Router();
const { ObjectId, BSON } = require("mongodb");
const cf = require("cloudflare");
const shortid = require("shortid");
const dummydata = require("./data.json");
const { prepareData, prepareData2 } = require("./helper");
const db = require("./services/db");
const multer = require("multer");
const openai = require("./services/chat-gpt");
const s3Client = require("./services/s3-storage");
const s3 = require("./services/s3-storage");
const { Route53Resolver } = require("aws-sdk");
const axios = require("axios").default;

const net = axios.create({
  baseURL: process.env.LINKED_API_ENDPOINT,
});
const upload = multer();

router.post("/upload_cv/:uuid?", upload.single("file"), async (req, res) => {
  const { file } = req;
  const { uuid } = req.params;
  const file_name = `CV_${uuid}`;
  await s3.putObject(
    {
      Bucket: process.env.BUCKET_NAME,
      Body: file.buffer,
      Key: `/linkedin_files/${file_name}`,
    },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        return res.json({ fileName: file_name });
      }
    }
  );
});

router.get("/get_file/:file_name", async (req, res) => {
  const { file_name } = req.params;
  s3Client.getSignedUrl(
    "getObject",
    {
      Bucket: process.env.BUCKET_NAME,
      Key: `linkedin_files/${file_name}`,
      Expires: 5000,
    },
    (err, data) => {
      console.log(err, data);
    }
  );
  await s3Client.getObject(
    {
      Bucket: process.env.BUCKET_NAME,
      Key: `/linkedin_files/${file_name}`,
    },
    (err, data) => {
      if (err) throw err;
      else return res.json(data);
    }
  );
});

router.post("/upload_file/:uuid?", upload.single("file"), async (req, res) => {
  const { file } = req;
  const { uuid } = req.params;
  await s3Client.putObject(
    {
      Bucket: process.env.BUCKET_NAME,
      Body: file.buffer,
      Key: `linkedin_files/CV_${uuid}`,
    },
    (err, data) => {
      if (err) throw err;
      else return res.json(data);
    }
  );
});

router.post("/generate_about_me", async (req, res) => {
  const { text } = req.body;
  const resp = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Generate an about me section for a portfolio based on the following text: ${text}.This text will go to the about section of a profesional portfolio. if you use a new line or tab, please also add the char for it in the text (slash n and slash r). remove all reference to contact like phone, emails, social links etc. make it infomative and consice. not too wordy`,
    temperature: 0.2,
    max_tokens: 300,
    frequency_penalty: 0,
    presence_penalty: 0.6,
  });
  return res.json(resp.data.choices[0].text);
});

router.post("/generate_job_desc", async (req, res) => {
  const { company, title, description, ignore_desc } = req.body;
  let base_prompt = `Create a description paragraph for a portfolio page considering the following title - ${title}.`;
  if (!ignore_desc && description) {
    base_prompt += `Base your output on the following description ${description}`;
  }
  const resp = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: base_prompt,
    temperature: 0.3,
    max_tokens: 200,
  });
  return res.json(resp.data.choices[0].text);
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const conn = await db("linkedin_app");
  let user = conn.collection("users").findOne({ email });
  if (user) {
    return res.json(user);
  }
  user = await conn.collection("users").insertOne({ email });
  return res.json(user);
});

router.post("/save/user/:uuid?", async (req, res) => {
  try {
    const { uuid } = req.params;
    const { data, file } = req.body;
    console.log(req.files, req.file);
    console.log(data);
    if (data.section1.data.cv_file) {
      const { cv_file } = data.section1.data;
      const bsonData = BSON.serialize({ data: cv_file });
      data.section1.data.cv_file = bsonData;
    }

    const conn = await db("linkedin_app");
    const resp = await conn
      .collection("users")
      .updateOne({ uuid }, { $set: { data } }, { upsert: true });
    console.log({ resp });
  } catch (err) {
    console.log(err);
  }
});

router.get("/linkedin_data", async (req, res) => {
  try {
    const searchTerm = {};
    const { url, uuid } = req.query;
    if (url) {
      searchTerm.url = url;
    } else {
      searchTerm.uuid = uuid;
    }

    const conn = await db("linkedin_app");
    const dataInDB = await conn.collection("users").findOne(searchTerm);
    if (dataInDB) {
      return res.json(dataInDB);
    } else {
      const saved = await conn
        .collection("users")
        .insertOne({ url: url, uuid: shortid(), data: prepareData(dummydata) });
    }

    const data = new URLSearchParams();
    data.append("url", url);
    data.append("use_cache", "if-present");
    data.append("skills", "include");
    // const resp = await axios.get(
    //   "https://nubela.co/proxycurl/api/v2/linkedin",
    //   data,
    //   {
    //     headers: {
    //       "Content-Type": "application/x-www-form-urlencoded",
    //       Authorization: `Bearer pSr_ivQv5tZR2dgSqyKucA`,
    //     },
    //   }
    // );

    // console.log(resp);
    // return res.json(resp);
  } catch (err) {
    console.log(err);
    return res.status(422).send(err);
  }
});

module.exports = router;
