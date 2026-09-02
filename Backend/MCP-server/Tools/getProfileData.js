const path = require("path");

const StudentProfile = require(
  path.join(
    __dirname,
    "../../Src/Models/StudentProfile"
  )
);

const User = require(
  path.join(
    __dirname,
    "../../Src/Models/User"
  )
);

const getProfileData = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const profile =
    await StudentProfile.findByUserId(
      userId
    );

  if (!profile) {
    throw new Error(
      "Student profile not found"
    );
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      public_slug: user.public_slug,
    },

    profile: {
      headline: profile.headline,
      bio: profile.bio,
      location: profile.location,
      website: profile.website,
      linkedin: profile.linkedin,
      github: profile.github,
      education: profile.education,
      skills: profile.skills,
      social_links:
        profile.social_links,
      is_public: profile.is_public,
    },
  };
};

module.exports = {
  getProfileData,
};