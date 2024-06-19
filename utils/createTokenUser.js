const createTokenUser = (user) => {
    return {
      userId: user._id,
      username: user.username,
      email: user.email,
    };
  };
  
  module.exports = { createTokenUser };
  