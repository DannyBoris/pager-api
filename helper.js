const { BSON } = require("mongodb");
const { default: puppeteer } = require("puppeteer");

exports.prepareData = (linkedinData) => {
  console.log(linkedinData);
  console.log(linkedinData);
  return {
    section1: {
      visible: true,
      data: {
        name: linkedinData.first_name,
        profile_image: linkedinData.profile_pic_url,
        cv_file: linked,
        occupation: linkedinData.occupation,
      },
    },
    section2: {
      visible: true,
      data: {
        summary: linkedinData.summary,
        skills: linkedinData.skills,
        languages: linkedinData.languages,
      },
    },
    section3: {
      visible: true,
      data: {
        projects: linkedinData.accomplishment_projects,
      },
    },
    section4: {
      visible: true,
      data: {
        experience: linkedinData.experiences,
        education: linkedinData.education,
      },
    },
    section5: { visible: true, data: {} },
    section6: { visible: true, data: {} },
  };
};

exports.prepareData2 = function (linkedindata) {
  return {
    main_info: {
      full_name: linkedindata.full_name,
      first_name: linkedindata.first_name,
      occupation: linkedindata.occupation,
      cv_file: null,
    },
    about_me: linkedindata.summary,
    skills: linkedindata.skills,
    languages: linkedindata.languages,
    projects: linkedindata.accomplishment_projects,
    experience: linkedindata.experiences,
    education: linkedindata.education,
    contact_info: { email: "", phone: "", location: "" },
    social_links: { github: "", facebook: "", insta: "" },
  };
};

exports.getWebsitePreviewThumb = async function () {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.youtube.com");
  await page.screenshot({ path: "somephoto.jpeg" });
  await browser.close();
};
